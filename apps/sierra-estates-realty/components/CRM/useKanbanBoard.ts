import { useState, useEffect } from "react";
import { db, getAnalyticsInstance } from "@/lib/firebase";
import { logAuditAction } from "@/lib/audit";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { useAuth } from "@/lib/AuthContext";
import { UserProfile, COLLECTIONS } from "@/lib/models/schema";
import { logger } from "@/lib/logger";
import {
  InvestmentStakeholder,
  StakeholderDraft,
  StakeholderFilters,
  PipelinePhase,
  PHASE_SEQUENCE,
  INITIAL_STAKEHOLDER_STATE,
} from "./types";

export const DEFAULT_FILTERS: StakeholderFilters = {
  search: "",
  intensity: "all",
  channel: "all",
  partnerId: "all",
};

export const matchesStakeholderFilters = (
  stakeholder: InvestmentStakeholder,
  filters: StakeholderFilters,
) => {
  const search = filters.search.trim().toLowerCase();
  const matchesSearch =
    !search ||
    [
      stakeholder.name,
      stakeholder.phone,
      stakeholder.portfolioPreference,
      stakeholder.capitalAllocation,
      stakeholder.assignedPartnerName,
      stakeholder.originChannel,
    ].some((value) => value?.toLowerCase().includes(search));

  const matchesIntensity =
    filters.intensity === "all" ||
    stakeholder.strategicIntensity === filters.intensity;
  const matchesChannel =
    filters.channel === "all" || stakeholder.originChannel === filters.channel;
  const matchesPartner =
    filters.partnerId === "all" ||
    stakeholder.assignedPartnerId === filters.partnerId ||
    stakeholder.assignedTo === filters.partnerId;

  return matchesSearch && matchesIntensity && matchesChannel && matchesPartner;
};

export function useKanbanBoard() {
  const { user, isGuest } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pipelineState, setPipelineState] = useState<
    Record<PipelinePhase, InvestmentStakeholder[]>
  >({
    acquisition: [],
    consultation: [],
    inspection: [],
    structuring: [],
    settlement: [],
  });
  const [activeInventorySize, setActiveInventorySize] = useState(0);
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([]);
  const [dragging, setDragging] = useState<{
    id: string;
    currentPhase: PipelinePhase;
  } | null>(null);
  const [phaseTarget, setPhaseTarget] = useState<PipelinePhase | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stakeholderDraft, setStakeholderDraft] = useState<StakeholderDraft>(
    INITIAL_STAKEHOLDER_STATE,
  );
  const [filters, setFilters] = useState<StakeholderFilters>(DEFAULT_FILTERS);
  const [syncingPF, setSyncingPF] = useState(false);
  const [matchingLeads, setMatchingLeads] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const pDoc = await getDoc(doc(db, COLLECTIONS.users, user.uid));
        if (pDoc.exists()) {
          setUserProfile({ id: pDoc.id, ...pDoc.data() } as UserProfile);
        }
      } catch (err) {
        logger.error("Profile recovery failure:", err);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user && !isGuest) return;

    const pq = query(collection(db, "partners"), orderBy("name", "asc"));
    const unsubscribePartners = onSnapshot(pq, (snapshot) => {
      setPartners(
        snapshot.docs.map((d) => ({ id: d.id, name: d.data().name })),
      );
    });

    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));

    if (userProfile?.role === "agent") {
      logger.info("Restricting view to agent:", user?.uid);
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allStakeholders: InvestmentStakeholder[] = snapshot.docs.map(
          (d) => {
            const data = d.data();
            const rawPhase = (
              data.phase ||
              data.status ||
              "acquisition"
            ).toLowerCase();
            let phase: PipelinePhase = "acquisition";

            if (["new", "acquisition"].includes(rawPhase))
              phase = "acquisition";
            else if (["contacted", "consultation"].includes(rawPhase))
              phase = "consultation";
            else if (["viewing", "inspection"].includes(rawPhase))
              phase = "inspection";
            else if (["negotiating", "structuring"].includes(rawPhase))
              phase = "structuring";
            else if (["closed", "settlement"].includes(rawPhase))
              phase = "settlement";

            return {
              id: d.id,
              ...data,
              phase,
              portfolioPreference:
                data.portfolioPreference ||
                data.interest ||
                "General Inventory",
              capitalAllocation: data.capitalAllocation || data.budget || "N/A",
              strategicIntensity:
                data.strategicIntensity || data.priority || "warm",
              originChannel: data.originChannel || data.via || "WhatsApp",
              intelligenceScore: data.intelligenceScore || data.score || 0,
              aiProfiling: data.aiProfiling || {
                interests: [],
                topMatches: [],
              },
              automation: data.automation || {
                followupReminderEnabled: true,
                interactionFrequency: "medium",
              },
            } as InvestmentStakeholder;
          },
        );

        const filteredLeads =
          userProfile?.role === "agent"
            ? allStakeholders.filter(
                (s) =>
                  s.assignedPartnerId === user?.uid ||
                  s.assignedTo === user?.uid,
              )
            : allStakeholders;

        const grouped = {
          acquisition: filteredLeads.filter((s) => s.phase === "acquisition"),
          consultation: filteredLeads.filter((s) => s.phase === "consultation"),
          inspection: filteredLeads.filter((s) => s.phase === "inspection"),
          structuring: filteredLeads.filter((s) => s.phase === "structuring"),
          settlement: filteredLeads.filter((s) => s.phase === "settlement"),
        };

        setPipelineState(grouped);
        setActiveInventorySize(filteredLeads.length);
        setLoading(false);
      },
      (error) => {
        logger.error("Pipeline synchronization failure:", error);
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
      unsubscribePartners();
    };
  }, [user, isGuest, userProfile]);

  const calculatePredictiveScore = (
    draft: Partial<StakeholderDraft | InvestmentStakeholder>,
  ) => {
    let base = 50;
    const intensity = draft.strategicIntensity;
    if (intensity === "hot") base = 82;
    else if (intensity === "warm") base = 58;
    else if (intensity === "cold") base = 32;

    const channelWeights: Record<string, number> = {
      Referral: 15,
      "Walk-in": 12,
      WhatsApp: 7,
      Website: 4,
      Instagram: -2,
    };

    const weight = channelWeights[draft.originChannel || ""] || 0;
    const interactionBonus = "id" in draft && draft.id ? 5 : 0;
    const precisionNoise = Math.floor(Math.random() * 8) - 4;
    return Math.min(
      100,
      Math.max(0, base + weight + interactionBonus + precisionNoise),
    );
  };

  const onboardStakeholder = async () => {
    try {
      const partner = partners.find(
        (p) => p.id === stakeholderDraft.assignedPartnerId,
      );
      const assignedPartnerId =
        userProfile?.role === "agent"
          ? user?.uid
          : stakeholderDraft.assignedPartnerId || "";
      const assignedPartnerName =
        userProfile?.role === "agent"
          ? userProfile.displayName
          : partner?.name || "";

      const docRef = await addDoc(collection(db, "leads"), {
        ...stakeholderDraft,
        assignedPartnerId,
        assignedPartnerName,
        assignedTo: assignedPartnerId,
        phase: "acquisition",
        intelligenceScore: calculatePredictiveScore(stakeholderDraft),
        aiProfiling: {
          interests: [stakeholderDraft.portfolioPreference],
          topMatches: [],
          lastAnalyzedAt: serverTimestamp(),
        },
        automation: {
          followupReminderEnabled: true,
          interactionFrequency:
            stakeholderDraft.strategicIntensity === "hot" ? "high" : "medium",
        },
        createdAt: serverTimestamp(),
      });

      const analytics = await getAnalyticsInstance();
      if (analytics) {
        logEvent(analytics, "stakeholder_onboarded", {
          name: stakeholderDraft.name,
          intensity: stakeholderDraft.strategicIntensity,
          channel: stakeholderDraft.originChannel,
        });
      }

      await logAuditAction({
        action: "STAKEHOLDER_ONBOARD",
        performer: "Executive Admin",
        performerId: "system",
        targetId: docRef.id,
        targetType: "stakeholder",
        details: `Onboarded ${stakeholderDraft.name} into acquisition phase.`,
      });

      setShowModal(false);
      setStakeholderDraft(INITIAL_STAKEHOLDER_STATE);
    } catch (err) {
      logger.error("Stakeholder onboarding failure:", err);
    }
  };

  const advancePhase = async (id: string, currentPhase: PipelinePhase) => {
    const nextIdx = PHASE_SEQUENCE.indexOf(currentPhase) + 1;
    if (nextIdx >= PHASE_SEQUENCE.length) return;
    const targetPhase = PHASE_SEQUENCE[nextIdx];
    try {
      const docRef = doc(db, "leads", id);
      const updates: any = {
        phase: targetPhase,
        lastStrategicInteraction: serverTimestamp(),
      };

      if (targetPhase === "settlement") {
        const stakeholder = [...Object.values(pipelineState)]
          .flat()
          .find((s) => s.id === id);
        if (
          stakeholder &&
          stakeholder.dealValue &&
          stakeholder.commissionPercentage
        ) {
          updates.finalGci =
            (stakeholder.dealValue * stakeholder.commissionPercentage) / 100;
          updates.settledAt = serverTimestamp();
        }
      }

      await updateDoc(docRef, updates);

      const analytics = await getAnalyticsInstance();
      if (analytics) {
        logEvent(
          analytics,
          targetPhase === "settlement" ? "deal_closed" : "phase_transition",
          {
            stakeholder_id: id,
            target_phase: targetPhase,
            gci: updates.finalGci || 0,
          },
        );
      }

      await logAuditAction({
        action:
          targetPhase === "settlement"
            ? "SETTLEMENT_FINALIZED"
            : "PHASE_TRANSITION",
        performer: "Executive Admin",
        performerId: "system",
        targetId: id,
        targetType: "stakeholder",
        details: `Migrated stakeholder ${id} to ${targetPhase}`,
      });
    } catch (err) {
      logger.error("Phase transition failure:", err);
    }
  };

  const handlePhaseMigration = async (toPhase: PipelinePhase) => {
    if (!dragging || dragging.currentPhase === toPhase) return;
    try {
      const docRef = doc(db, "leads", dragging.id);
      const updates: any = {
        phase: toPhase,
        lastStrategicInteraction: serverTimestamp(),
      };

      if (toPhase === "settlement") {
        const stakeholder = [...Object.values(pipelineState)]
          .flat()
          .find((s) => s.id === dragging.id);
        if (
          stakeholder &&
          stakeholder.dealValue &&
          stakeholder.commissionPercentage
        ) {
          updates.finalGci =
            (stakeholder.dealValue * stakeholder.commissionPercentage) / 100;
          updates.settledAt = serverTimestamp();
        }
      }

      await updateDoc(docRef, updates);

      const analytics = await getAnalyticsInstance();
      if (analytics) {
        logEvent(
          analytics,
          toPhase === "settlement" ? "deal_closed" : "phase_transition",
          {
            stakeholder_id: dragging.id,
            target_phase: toPhase,
            gci: updates.finalGci || 0,
          },
        );
      }

      await logAuditAction({
        action:
          toPhase === "settlement"
            ? "SETTLEMENT_FINALIZED"
            : "PHASE_TRANSITION",
        performer: "Executive Admin",
        performerId: "system",
        targetId: dragging.id,
        targetType: "stakeholder",
        details: `Strategic relocation of stakeholder to ${toPhase}`,
      });

      setDragging(null);
      setPhaseTarget(null);
    } catch (err) {
      logger.error("Strategic relocation failure:", err);
    }
  };

  const syncLeadsFromPF = async () => {
    setSyncingPF(true);
    try {
      const response = await fetch("/api/property-finder?action=sync-leads", {
        method: "POST",
      });
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error);

      const summary = result.summary || { created: 0, updated: 0, skipped: 0 };
      alert(
        `Property Finder sync completed. Added ${summary.created}, refreshed ${summary.updated}, skipped ${summary.skipped}.`,
      );
    } catch (err) {
      logger.error("PF Sync Error:", err);
      alert(
        "Synchronization protocol failed to establish secure link with Property Finder. Check gateway configuration.",
      );
    } finally {
      setSyncingPF(false);
    }
  };

  const visiblePipelineState = PHASE_SEQUENCE.reduce(
    (acc, phase) => {
      acc[phase] = pipelineState[phase].filter((stakeholder) =>
        matchesStakeholderFilters(stakeholder, filters),
      );
      return acc;
    },
    {
      acquisition: [] as InvestmentStakeholder[],
      consultation: [] as InvestmentStakeholder[],
      inspection: [] as InvestmentStakeholder[],
      structuring: [] as InvestmentStakeholder[],
      settlement: [] as InvestmentStakeholder[],
    },
  );

  const visibleStakeholders = Object.values(visiblePipelineState).flat();
  const hotStakeholders = visibleStakeholders.filter(
    (stakeholder) => stakeholder.strategicIntensity === "hot",
  ).length;
  const closeReady =
    visiblePipelineState.structuring.length +
    visiblePipelineState.settlement.length;
  const pipelineValue = visibleStakeholders.reduce(
    (total, stakeholder) => total + (stakeholder.dealValue || 0),
    0,
  );

  return {
    userProfile,
    pipelineState,
    visiblePipelineState,
    activeInventorySize,
    partners,
    dragging,
    setDragging,
    phaseTarget,
    setPhaseTarget,
    showModal,
    setShowModal,
    loading,
    stakeholderDraft,
    setStakeholderDraft,
    filters,
    setFilters,
    syncingPF,
    matchingLeads,
    setMatchingLeads,
    visibleStakeholders,
    hotStakeholders,
    closeReady,
    pipelineValue,
    onboardStakeholder,
    advancePhase,
    handlePhaseMigration,
    syncLeadsFromPF,
  };
}
