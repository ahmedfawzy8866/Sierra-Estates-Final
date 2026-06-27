"use client";
import "./CRMKanban.css";
import React from "react";
import { Search } from "lucide-react";
import { useKanbanBoard } from "./useKanbanBoard";
import {
  InvestmentStakeholder,
  StakeholderFilters,
  PHASE_DEFS,
  PHASE_SEQUENCE,
  CHANNEL_METADATA,
} from "./types";
import StakeholderCard from "./StakeholderCard";

export default function CRMKanban() {
  const {
    visiblePipelineState,
    activeInventorySize,
    partners,
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
  } = useKanbanBoard();
  if (loading) {
    return (
      <div className="section-loader">
        {" "}
        <div className="loader-logo sm">SB</div>{" "}
        <div className="loader-text sm">
          Synchronizing Opportunity Pipeline…
        </div>{" "}
      </div>
    );
  }
  return (
    <div className="crm-view animate-fade-in">
      {" "}
      <div className="page-header">
        {" "}
        <div className="header-flex">
          {" "}
          <div>
            {" "}
            <h1>Command Intelligence: Strategic Pipeline</h1>{" "}
            <div className="page-sub">
              Analyzing {visibleStakeholders.length} of {activeInventorySize}{" "}
              active investment stakeholders within the conversion lifecycle
            </div>{" "}
          </div>{" "}
          <div className="header-actions">
            {" "}
            <button
              className="btn btn-outline"
              onClick={syncLeadsFromPF}
              disabled={syncingPF}
            >
              {" "}
              <span className="icon">🌐</span>{" "}
              {syncingPF ? "Syncing..." : "Sync Property Finder"}{" "}
            </button>{" "}
            <button
              className="btn btn-ghost"
              disabled={matchingLeads}
              onClick={async () => {
                try {
                  setMatchingLeads(true);
                  const res = await fetch("/api/matching?bulk=true", {
                    method: "POST",
                  });
                  if (res.ok) alert("Neural matching orchestrator initiated.");
                } finally {
                  setMatchingLeads(false);
                }
              }}
            >
              {" "}
              <span className="icon">⚡</span>{" "}
              {matchingLeads ? "Matching..." : "Neural Match"}{" "}
            </button>{" "}
            <button className="btn btn-gold" onClick={() => setShowModal(true)}>
              {" "}
              <span className="plus">+</span> Onboard Prospect{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <div className="crm-filter-bar">
        {" "}
        <div className="crm-search-shell">
          {" "}
          <Search size={16} />{" "}
          <input
            value={filters.search}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, search: event.target.value }))
            }
            placeholder="Search by name, phone, advisor, channel, or interest"
          />{" "}
        </div>{" "}
        <select
          title="Filter by priority"
          value={filters.intensity}
          onChange={(event) =>
            setFilters((prev) => ({
              ...prev,
              intensity: event.target.value as StakeholderFilters["intensity"],
            }))
          }
        >
          {" "}
          <option value="all">All priority</option>{" "}
          <option value="hot">Hot only</option>{" "}
          <option value="warm">Warm only</option>{" "}
          <option value="cold">Cold only</option>{" "}
        </select>{" "}
        <select
          title="Filter by channel"
          value={filters.channel}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, channel: event.target.value }))
          }
        >
          {" "}
          <option value="all">All channels</option>{" "}
          {Object.keys(CHANNEL_METADATA).map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}{" "}
        </select>{" "}
        <select
          title="Filter by advisor"
          value={filters.partnerId}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, partnerId: event.target.value }))
          }
        >
          {" "}
          <option value="all">All advisors</option>{" "}
          {partners.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
            </option>
          ))}{" "}
        </select>{" "}
      </div>{" "}
      <div className="pipeline-metrics-row">
        {" "}
        <div className="metric-card-glass">
          {" "}
          <div className="metric-label">Visible Pipeline</div>{" "}
          <div className="metric-value text-[var(--navy)]">
            {visibleStakeholders.length}
          </div>{" "}
          <div className="metric-trend">Filtered operating view</div>{" "}
        </div>{" "}
        <div className="metric-card-glass">
          {" "}
          <div className="metric-label">Hot Prospects</div>{" "}
          <div className="metric-value text-[#dc2626]">
            {hotStakeholders}
          </div>{" "}
          <div className="metric-trend">Immediate follow-up priority</div>{" "}
        </div>{" "}
        <div className="metric-card-glass">
          {" "}
          <div className="metric-label">Close Ready</div>{" "}
          <div className="metric-value text-[var(--gold)]">
            {closeReady}
          </div>{" "}
          <div className="metric-trend">Structuring + settlement</div>{" "}
        </div>{" "}
        <div className="metric-card-glass">
          {" "}
          <div className="metric-label">Pipeline Value</div>{" "}
          <div className="metric-value text-[var(--success)]">
            {" "}
            {pipelineValue > 0
              ? `${(pipelineValue / 1000000).toFixed(1)}M`
              : "0"}{" "}
          </div>{" "}
          <div className="metric-trend">Estimated deal volume (EGP)</div>{" "}
        </div>{" "}
        {PHASE_SEQUENCE.map((phase) => {
          const phaseColorStyle = { color: PHASE_DEFS[phase].color };
          return (
          <div key={phase} className="metric-card-glass">
            {" "}
            <div className="metric-label">{PHASE_DEFS[phase].title}</div>{" "}
            <div
              className="metric-value"
              style={phaseColorStyle}
            >
              {" "}
              {visiblePipelineState[phase].length}{" "}
            </div>{" "}
            <div className="metric-trend">
              {" "}
              {visiblePipelineState[phase].length > 0
                ? "Active Deployment"
                : "Idle Queue"}{" "}
            </div>{" "}
          </div>
        )})}
      </div>{" "}
      <div className="kanban-scroller">
        {" "}
        <div className="kanban-board-premium">
          {" "}
          {PHASE_SEQUENCE.map((phase) => {
            const accentStyle = { "--accent": PHASE_DEFS[phase].color } as React.CSSProperties;
            const bgStyle = { background: PHASE_DEFS[phase].color };
            return (
            <div
              key={phase}
              className={`kanban-col-premium ${phaseTarget === phase ? "drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setPhaseTarget(phase);
              }}
              onDragLeave={() => setPhaseTarget(null)}
              onDrop={() => handlePhaseMigration(phase)}
            >
              {" "}
              <div
                className="kanban-col-header-premium"
                style={accentStyle}
              >
                {" "}
                <div className="header-top">
                  {" "}
                  <h3 className="col-title">{PHASE_DEFS[phase].title}</h3>{" "}
                  <span
                    className="col-badge"
                    style={bgStyle}
                  >
                    {visiblePipelineState[phase].length}
                  </span>{" "}
                </div>{" "}
                <p className="col-sub">{PHASE_DEFS[phase].description}</p>{" "}
              </div>{" "}
              <div className="kanban-cards-premium">
                {" "}
                {visiblePipelineState[phase].map(
                  (stakeholder: InvestmentStakeholder) => (
                    <StakeholderCard
                      key={stakeholder.id}
                      stakeholder={stakeholder}
                      phase={phase}
                      onProgress={advancePhase}
                      onDragStart={(id, p) =>
                        setDragging({ id, currentPhase: p })
                      }
                    />
                  ),
                )}{" "}
                {visiblePipelineState[phase].length === 0 && (
                  <div className="empty-reservoir">
                    {" "}
                    <div className="empty-icon">⌘</div>{" "}
                    <p>
                      {filters.search ||
                      filters.intensity !== "all" ||
                      filters.channel !== "all" ||
                      filters.partnerId !== "all"
                        ? "No stakeholders match the active filters"
                        : "Reserved for future asset assignments"}
                    </p>{" "}
                  </div>
                )}{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
      {showModal && (
        <div
          className="modal-overlay reveal"
          onClick={() => setShowModal(false)}
        >
          {" "}
          <div
            className="modal-content-luxury glass-effect"
            onClick={(e) => e.stopPropagation()}
          >
            {" "}
            <div className="modal-header-luxury">
              {" "}
              <h2>Prospect Specification</h2>{" "}
              <p>
                Initialize a new strategic relationship within the portfolio
                ecosystem
              </p>{" "}
            </div>{" "}
            <div className="specification-grid">
              {" "}
              <div className="spec-group full">
                {" "}
                <label>Prospect Identity</label>{" "}
                <input
                  autoFocus
                  placeholder="Full Legal Name"
                  value={stakeholderDraft.name}
                  onChange={(e) =>
                    setStakeholderDraft((p) => ({ ...p, name: e.target.value }))
                  }
                />{" "}
              </div>{" "}
              <div className="spec-group">
                {" "}
                <label>Direct Contact (International)</label>{" "}
                <input
                  placeholder="+20 1XX XXX XXXX"
                  value={stakeholderDraft.phone}
                  onChange={(e) =>
                    setStakeholderDraft((p) => ({
                      ...p,
                      phone: e.target.value,
                    }))
                  }
                />{" "}
              </div>{" "}
              <div className="spec-group">
                {" "}
                <label>Inventory Profile Interest</label>{" "}
                <input
                  placeholder="e.g. Waterfront Mansion"
                  value={stakeholderDraft.portfolioPreference}
                  onChange={(e) =>
                    setStakeholderDraft((p) => ({
                      ...p,
                      portfolioPreference: e.target.value,
                    }))
                  }
                />{" "}
              </div>{" "}
              <div className="spec-group">
                {" "}
                <label>Capital Allocation (EGP)</label>{" "}
                <input
                  placeholder="e.g. 25M - 40M"
                  value={stakeholderDraft.capitalAllocation}
                  onChange={(e) =>
                    setStakeholderDraft((p) => ({
                      ...p,
                      capitalAllocation: e.target.value,
                    }))
                  }
                />{" "}
              </div>{" "}
              <div className="spec-group">
                {" "}
                <label>Engagement Velocity</label>{" "}
                <select
                  title="Engagement Velocity"
                  value={stakeholderDraft.strategicIntensity}
                  onChange={(e) =>
                    setStakeholderDraft((p) => ({
                      ...p,
                      strategicIntensity: e.target.value as any,
                    }))
                  }
                >
                  {" "}
                  <option value="hot">Critical Intent / Hot</option>{" "}
                  <option value="warm">Proactive / Warm</option>{" "}
                  <option value="cold">Observational / Cold</option>{" "}
                </select>{" "}
              </div>{" "}
              <div className="spec-group">
                {" "}
                <label>Estimated Value (EGP)</label>{" "}
                <input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={stakeholderDraft.dealValue}
                  onChange={(e) =>
                    setStakeholderDraft((p) => ({
                      ...p,
                      dealValue: Number(e.target.value),
                    }))
                  }
                />{" "}
              </div>{" "}
              <div className="spec-group">
                {" "}
                <label>Target Commission (%)</label>{" "}
                <input
                  type="number"
                  step="0.1"
                  placeholder="2.5"
                  value={stakeholderDraft.commissionPercentage}
                  onChange={(e) =>
                    setStakeholderDraft((p) => ({
                      ...p,
                      commissionPercentage: Number(e.target.value),
                    }))
                  }
                />{" "}
              </div>{" "}
              <div className="spec-group">
                {" "}
                <label>Assigned Executive Partner</label>{" "}
                <select
                  title="Assigned Executive Partner"
                  value={stakeholderDraft.assignedPartnerId}
                  onChange={(e) =>
                    setStakeholderDraft((p) => ({
                      ...p,
                      assignedPartnerId: e.target.value,
                    }))
                  }
                >
                  {" "}
                  <option value="">Unassigned</option>{" "}
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}{" "}
                </select>{" "}
              </div>{" "}
              <div className="spec-group full">
                {" "}
                <label>Origin Acquisition Channel</label>{" "}
                <div className="channel-grid">
                  {" "}
                  {Object.keys(CHANNEL_METADATA).map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`channel-btn ${stakeholderDraft.originChannel === v ? "selected" : ""}`}
                      onClick={() =>
                        setStakeholderDraft((p) => ({ ...p, originChannel: v }))
                      }
                    >
                      {" "}
                      <span className="icon">
                        {CHANNEL_METADATA[v].icon}
                      </span>{" "}
                      <span className="label">{v}</span>{" "}
                    </button>
                  ))}{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="modal-actions-luxury">
              {" "}
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Terminate Entry
              </button>{" "}
              <button
                className="btn btn-gold shadow-gold"
                onClick={onboardStakeholder}
              >
                Authorize Prospect Record
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
