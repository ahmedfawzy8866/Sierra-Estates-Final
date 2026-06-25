import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PropertyCard } from "@/components/PropertyCard";
import { PROPERTIES } from "@/data/properties";
import { useColors } from "@/hooks/useColors";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const TYPES = ["All", "Penthouse", "Villa", "Estate", "Compound", "Beachfront"] as const;
const STATUS = ["All", "Rent", "Resale"] as const;
const FURNISHED = ["All", "Yes", "No"] as const;
const ROOMS = ["Any", "1", "2", "3", "4", "5+"] as const;
const SORT_OPTIONS = [
  { key: "aiScore", label: "AI Score" },
  { key: "yield", label: "Yield" },
  { key: "price_desc", label: "Price ↓" },
  { key: "price_asc", label: "Price ↑" },
] as const;

import { MobileFilterChips } from "@/components/MobileFilterChips";
import { SierraFooter } from "@/components/SierraFooter";

type SortKey = "aiScore" | "yield" | "price_desc" | "price_asc";

export default function ListingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isDesktop, isTablet, numColumns } = useBreakpoint();
  const isWide = isDesktop || isTablet;
  const topPad = isWide ? 0 : Platform.OS === "web" ? 0 : insets.top;

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeRooms, setActiveRooms] = useState("Any");
  const [activeFurnished, setActiveFurnished] = useState("All");
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.status) setActiveStatus(params.status as string);
    if (params.rooms) setActiveRooms(params.rooms as string);
    if (params.furnished) setActiveFurnished(params.furnished as string);
  }, [params]);

  const [sortBy, setSortBy] = useState<SortKey>("aiScore");
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showOffPlanOnly, setShowOffPlanOnly] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  // New states for Mobile Filter Chips
  const [compounds, setCompounds] = useState<string[]>([]);
  const [beds, setBeds] = useState<string[]>([]);
  const [finishing, setFinishing] = useState<string[]>([]);
  const [listingType, setListingType] = useState<string[]>([]);

  const filtered = PROPERTIES.filter((p) => {
    const matchSearch =
      search.trim() === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.compound.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === "All" || p.type === activeType.toLowerCase();
    const matchStatus = activeStatus === "All" || p.status === activeStatus.toLowerCase();
    const matchFurnished = activeFurnished === "All" || (activeFurnished === "Yes" ? p.furnished === true : p.furnished === false);
    const matchRoomsUI = activeRooms === "Any" || (activeRooms === "5+" ? p.beds >= 5 : p.beds.toString() === activeRooms);
    const matchOffPlan = !showOffPlanOnly || p.isOffPlan;
    
    // New BottomSheet Filters
    const matchCompound = compounds.length === 0 || compounds.includes(p.compound);
    const matchBeds = beds.length === 0 || beds.some(b => b === "5+" ? p.beds >= 5 : p.beds.toString() === b);
    const matchListingType = listingType.length === 0 || (
      // For mock logic: assuming p.isOffPlan translates to Primary, otherwise check status
      listingType.includes(p.isOffPlan ? "Primary" : "Resale") ||
      (listingType.includes("Rent") && p.price < 500000) // Mock logic for rent
    );
    
    return matchSearch && matchType && matchStatus && matchFurnished && matchRoomsUI && matchOffPlan && matchCompound && matchBeds && matchListingType;
  }).sort((a, b) => {
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "yield") return b.yieldPercent - a.yieldPercent;
    return b.aiScore - a.aiScore;
  });

  const activeSortLabel = SORT_OPTIONS.find((s) => s.key === sortBy)?.label ?? "Sort";

  function toggleCompare(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  }

  // Bottom padding — no tab bar on desktop
  const bottomPadding = isWide ? 40 : Platform.OS === "web" ? 34 + 84 : 100;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Desktop: sidebar + content layout */}
      {isWide ? (
        <View style={[styles.desktopLayout, { flexDirection: "row" }]}>
          {/* Sidebar */}
          <View style={[styles.sidebar, { backgroundColor: colors.card, borderRightColor: colors.border }]}>
            <Text style={[styles.sidebarHeading, { color: colors.text }]}>Filters</Text>

            {/* Search */}
            <View style={[styles.searchRow, { backgroundColor: colors.background, borderColor: colors.border, marginHorizontal: 0, marginTop: 0 }]}>
              <Feather name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Location, project or developer..."
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")} hitSlop={8}>
                  <Feather name="x" size={16} color={colors.mutedForeground} />
                </Pressable>
              )}
            </View>

            {/* Property type */}
            <Text style={[styles.sidebarLabel, { color: colors.mutedForeground }]}>Property Type</Text>
            <View style={styles.sidebarPills}>
              {TYPES.map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.sidebarPill,
                    {
                      backgroundColor: activeType === type ? colors.gold + "20" : colors.background,
                      borderColor: activeType === type ? colors.gold : colors.border,
                    },
                  ]}
                  onPress={() => setActiveType(type)}
                >
                  <Text style={[styles.sidebarPillText, { color: activeType === type ? colors.gold : colors.text }]}>{type}</Text>
                </Pressable>
              ))}
            </View>

            {/* Status */}
            <Text style={[styles.sidebarLabel, { color: colors.mutedForeground }]}>Status</Text>
            <View style={styles.sidebarPills}>
              {STATUS.map((s) => (
                <Pressable
                  key={s}
                  style={[
                    styles.sidebarPill,
                    {
                      backgroundColor: activeStatus === s ? colors.gold + "20" : colors.background,
                      borderColor: activeStatus === s ? colors.gold : colors.border,
                    },
                  ]}
                  onPress={() => setActiveStatus(s)}
                >
                  <Text style={[styles.sidebarPillText, { color: activeStatus === s ? colors.gold : colors.text }]}>{s}</Text>
                </Pressable>
              ))}
            </View>

            {/* Rooms */}
            <Text style={[styles.sidebarLabel, { color: colors.mutedForeground }]}>Rooms</Text>
            <View style={styles.sidebarPills}>
              {ROOMS.map((r) => (
                <Pressable
                  key={r}
                  style={[
                    styles.sidebarPill,
                    {
                      backgroundColor: activeRooms === r ? colors.gold + "20" : colors.background,
                      borderColor: activeRooms === r ? colors.gold : colors.border,
                    },
                  ]}
                  onPress={() => setActiveRooms(r)}
                >
                  <Text style={[styles.sidebarPillText, { color: activeRooms === r ? colors.gold : colors.text }]}>{r}</Text>
                </Pressable>
              ))}
            </View>

            {/* Furnished */}
            <Text style={[styles.sidebarLabel, { color: colors.mutedForeground }]}>Furnished</Text>
            <View style={styles.sidebarPills}>
              {FURNISHED.map((f) => (
                <Pressable
                  key={f}
                  style={[
                    styles.sidebarPill,
                    {
                      backgroundColor: activeFurnished === f ? colors.gold + "20" : colors.background,
                      borderColor: activeFurnished === f ? colors.gold : colors.border,
                    },
                  ]}
                  onPress={() => setActiveFurnished(f)}
                >
                  <Text style={[styles.sidebarPillText, { color: activeFurnished === f ? colors.gold : colors.text }]}>{f}</Text>
                </Pressable>
              ))}
            </View>

            {/* Off-plan toggle */}
            <Pressable
              style={[
                styles.sidebarToggle,
                {
                  backgroundColor: showOffPlanOnly ? colors.gold + "20" : colors.background,
                  borderColor: showOffPlanOnly ? colors.gold : colors.border,
                },
              ]}
              onPress={() => setShowOffPlanOnly((v) => !v)}
            >
              <Feather name={showOffPlanOnly ? "check-square" : "square"} size={16} color={showOffPlanOnly ? colors.gold : colors.mutedForeground} />
              <Text style={[styles.sidebarPillText, { color: showOffPlanOnly ? colors.gold : colors.text }]}>Off-Plan Only</Text>
            </Pressable>

            {/* Sort */}
            <Text style={[styles.sidebarLabel, { color: colors.mutedForeground }]}>Sort By</Text>
            <View style={styles.sidebarPills}>
              {SORT_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  style={[
                    styles.sidebarPill,
                    {
                      backgroundColor: sortBy === opt.key ? colors.gold + "20" : colors.background,
                      borderColor: sortBy === opt.key ? colors.gold : colors.border,
                    },
                  ]}
                  onPress={() => setSortBy(opt.key)}
                >
                  <Text style={[styles.sidebarPillText, { color: sortBy === opt.key ? colors.gold : colors.text }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.resultCount, { color: colors.mutedForeground, marginTop: 16 }]}>
              <Text style={[styles.resultNum, { color: colors.text }]}>{filtered.length}</Text> properties found
            </Text>
          </View>

          {/* Property grid */}
          <FlatList
            data={filtered}
            keyExtractor={(p) => p.id}
            numColumns={numColumns}
            key={numColumns}
            renderItem={({ item }) => (
              <View style={[styles.gridCell, { width: numColumns === 3 ? "33.33%" : "50%" }]}>
                <PropertyCard
                  property={item}
                  compareMode={compareMode}
                  isCompared={compareIds.includes(item.id)}
                  onCompare={toggleCompare}
                />
              </View>
            )}
            contentContainerStyle={{ padding: 20, paddingBottom: bottomPadding }}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="search" size={40} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No properties found</Text>
                <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Try adjusting your filters</Text>
              </View>
            }
          />
        </View>
      ) : (
        // ─── MOBILE LAYOUT ───
        <>
      <View style={[styles.header, { paddingTop: topPad, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Location, project or developer..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : (
            <Pressable
              style={[styles.filterIconBtn, { backgroundColor: colors.gold }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Feather name="sliders" size={15} color={colors.navyDeep} />
            </Pressable>
          )}
        </View>

        <MobileFilterChips
          compounds={compounds}
          setCompounds={setCompounds}
          beds={beds}
          setBeds={setBeds}
          finishing={finishing}
          setFinishing={setFinishing}
          listingType={listingType}
          setListingType={setListingType}
        />

        <View style={styles.metaRow}>
          <Text style={[styles.resultCount, { color: colors.text }]}>
            <Text style={[styles.resultNum, { color: colors.text }]}>{filtered.length}</Text> projects with developer stock
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityRow}>
          {CITIES.slice(1).map((city) => (
            <Pressable
              key={city}
              style={[styles.cityChip, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setActiveCity(activeCity === city ? "All Cities" : city)}
            >
              <Text style={[styles.cityChipText, { color: activeCity === city ? colors.gold : colors.text }]}>
                {city} ({PROPERTIES.filter((p) => p.city === city).length} projects)
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.actionsRow}>
          <Pressable
            style={[
              styles.actionBtn,
              {
                backgroundColor: compareMode ? colors.gold + "22" : colors.card,
                borderColor: compareMode ? colors.gold : colors.border,
              },
            ]}
            onPress={() => { setCompareMode((v) => !v); if (!compareMode) setCompareIds([]); }}
          >
            <Feather name="columns" size={13} color={compareMode ? colors.gold : colors.mutedForeground} />
            <Text style={[styles.actionBtnText, { color: compareMode ? colors.gold : colors.mutedForeground }]}>
              Compare {compareMode && compareIds.length > 0 ? `(${compareIds.length})` : ""}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.mapViewBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/map" as any)}
          >
            <Feather name="map-pin" size={13} color={colors.gold} />
            <Text style={[styles.mapViewBtnText, { color: colors.gold }]}>Map</Text>
          </Pressable>

          <View style={styles.spacer} />

          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowSortMenu((v) => !v)}
          >
            <Feather name="arrow-down" size={13} color={colors.mutedForeground} />
            <Text style={[styles.actionBtnText, { color: colors.mutedForeground }]}>{activeSortLabel}</Text>
          </Pressable>
        </View>

        {showSortMenu && (
          <View style={[styles.sortMenu, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {SORT_OPTIONS.map((opt) => (
              <Pressable
                key={opt.key}
                style={[
                  styles.sortMenuItem,
                  { borderBottomColor: colors.border },
                  sortBy === opt.key && { backgroundColor: colors.gold + "18" },
                ]}
                onPress={() => { setSortBy(opt.key); setShowSortMenu(false); }}
              >
                {sortBy === opt.key && <Feather name="check" size={13} color={colors.gold} />}
                <Text style={[styles.sortMenuText, { color: sortBy === opt.key ? colors.gold : colors.text }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.gold}
            colors={[colors.gold]} 
          />
        }
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            compareMode={compareMode}
            isCompared={compareIds.includes(item.id)}
            onCompare={toggleCompare}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<SierraFooter />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No properties found</Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Try adjusting your filters</Text>
          </View>
        }
      />

      {compareMode && compareIds.length >= 2 && (
        <View style={[styles.compareBar, { backgroundColor: colors.gold, borderTopColor: colors.goldDark }]}>
          <Text style={[styles.compareBarText, { color: colors.navyDeep }]}>
            Compare {compareIds.length} properties
          </Text>
          <Pressable style={[styles.compareBarBtn, { backgroundColor: colors.navyDeep }]}>
            <Text style={[styles.compareBarBtnText, { color: colors.gold }]}>Compare Now</Text>
          </Pressable>
        </View>
      )}
        </>
      )}
    </View>
  );
}

function FilterPill({ label, active, value, colors, onPress }: any) {
  return (
    <Pressable
      style={[
        styles.filterPill,
        {
          backgroundColor: active ? colors.gold + "18" : colors.card,
          borderColor: active ? colors.gold : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.filterPillText, { color: active ? colors.gold : colors.text }]}>
        {value ?? label}
      </Text>
      <Feather name="chevron-down" size={12} color={active ? colors.gold : colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  desktopLayout: { flex: 1 },
  sidebar: {
    width: 260,
    padding: 20,
    borderRightWidth: 1,
    overflow: "scroll" as any,
  },
  sidebarHeading: { fontSize: 16, fontWeight: "800", marginBottom: 16 },
  sidebarLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  sidebarPills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  sidebarPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  sidebarPillText: { fontSize: 14, fontWeight: "600" },
  sidebarToggle: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, marginTop: 4 },
  gridCell: { padding: 6 },
  header: { paddingBottom: 8, borderBottomWidth: 1 },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    marginHorizontal: 14, marginTop: 10, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterIconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  filterRow: { gap: 8, paddingHorizontal: 14, paddingBottom: 10 },
  filterPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, height: 44, borderRadius: 22, borderWidth: 1,
    justifyContent: "center",
  },
  filterPillText: { fontSize: 14, fontWeight: "600" },
  metaRow: { paddingHorizontal: 14, marginBottom: 8 },
  resultCount: { fontSize: 14 },
  resultNum: { fontWeight: "800" },
  cityRow: { gap: 8, paddingHorizontal: 14, paddingBottom: 10 },
  cityChip: { paddingHorizontal: 14, height: 44, borderRadius: 22, borderWidth: 1, justifyContent: "center" },
  cityChipText: { fontSize: 14, fontWeight: "600" },
  actionsRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingBottom: 4,
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, height: 44, borderRadius: 22, borderWidth: 1,
    justifyContent: "center",
  },
  actionBtnText: { fontSize: 14, fontWeight: "600" },
  mapViewBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, height: 44, borderRadius: 22, borderWidth: 1,
    justifyContent: "center",
  },
  mapViewBtnText: { fontSize: 14, fontWeight: "700" },
  spacer: { flex: 1 },
  sortMenu: {
    marginHorizontal: 14, borderRadius: 10, borderWidth: 1,
    overflow: "hidden", marginTop: 4, marginBottom: 4,
    position: "absolute", right: 14, top: "100%", width: 160, zIndex: 100,
  },
  sortMenuItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, height: 48, borderBottomWidth: 1,
  },
  sortMenuText: { fontSize: 14, fontWeight: "600" },
  list: { padding: 14, paddingTop: 16 },
  empty: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptyHint: { fontSize: 14 },
  compareBar: {
    position: "absolute", bottom: Platform.OS === "web" ? 84 : 60, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1,
  },
  compareBarText: { fontSize: 14, fontWeight: "700" },
  compareBarBtn: { paddingHorizontal: 16, height: 44, borderRadius: 22, justifyContent: "center" },
  compareBarBtnText: { fontSize: 14, fontWeight: "800" },
});
