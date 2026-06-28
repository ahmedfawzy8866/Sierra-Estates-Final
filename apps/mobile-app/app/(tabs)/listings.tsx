import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PropertyCard } from "@/components/PropertyCard";
import { PROPERTIES } from "@/data/properties";
import { useColors } from "@/hooks/useColors";

const TYPES = ["All", "Penthouse", "Villa", "Estate", "Compound", "Beachfront"] as const;
const CITIES = ["All Cities", "Dubai", "Abu Dhabi", "Riyadh"];
const SORT_OPTIONS = [
  { key: "aiScore", label: "AI Score" },
  { key: "yield", label: "Yield" },
  { key: "price_desc", label: "Price ↓" },
  { key: "price_asc", label: "Price ↑" },
] as const;

type SortKey = "aiScore" | "yield" | "price_desc" | "price_asc";

export default function ListingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [activeCity, setActiveCity] = useState("All Cities");
  const [sortBy, setSortBy] = useState<SortKey>("aiScore");
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showOffPlanOnly, setShowOffPlanOnly] = useState(false);

  const filtered = PROPERTIES.filter((p) => {
    const matchSearch =
      search.trim() === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase()) ||
      p.compound.toLowerCase().includes(search.toLowerCase());
    const matchType = activeType === "All" || p.type === activeType.toLowerCase();
    const matchCity = activeCity === "All Cities" || p.city === activeCity;
    const matchOffPlan = !showOffPlanOnly || p.isOffPlan;
    return matchSearch && matchType && matchCity && matchOffPlan;
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

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <FilterPill
            label="Property Type"
            active={activeType !== "All"}
            value={activeType !== "All" ? activeType : undefined}
            colors={colors}
            onPress={() => {
              const idx = TYPES.indexOf(activeType as any);
              setActiveType(TYPES[(idx + 1) % TYPES.length]);
            }}
          />
          <FilterPill
            label="Price"
            colors={colors}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          />
          <FilterPill
            label="Beds"
            colors={colors}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          />
          <FilterPill
            label="City"
            active={activeCity !== "All Cities"}
            value={activeCity !== "All Cities" ? activeCity : undefined}
            colors={colors}
            onPress={() => {
              const idx = CITIES.indexOf(activeCity);
              setActiveCity(CITIES[(idx + 1) % CITIES.length]);
            }}
          />
          <FilterPill
            label="Off-Plan"
            active={showOffPlanOnly}
            colors={colors}
            onPress={() => setShowOffPlanOnly((v) => !v)}
          />
        </ScrollView>

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
            onPress={() => router.push("/(tabs)/map" as any)}
          >
            <Feather name="map-pin" size={13} color={colors.gold} />
            <Text style={[styles.mapViewBtnText, { color: colors.gold }]}>Map</Text>
          </Pressable>

          <View style={styles.spacer} />

          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowSortMenu((v) => !v)}
          >
            <Feather name="arrow-up-down" size={13} color={colors.mutedForeground} />
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
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            compareMode={compareMode}
            isCompared={compareIds.includes(item.id)}
            onCompare={toggleCompare}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }]}
        showsVerticalScrollIndicator={false}
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
  header: { paddingBottom: 8, borderBottomWidth: 1 },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    marginHorizontal: 14, marginTop: 10, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterIconBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  filterRow: { gap: 8, paddingHorizontal: 14, paddingBottom: 10 },
  filterPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  filterPillText: { fontSize: 12, fontWeight: "600" },
  metaRow: { paddingHorizontal: 14, marginBottom: 8 },
  resultCount: { fontSize: 13 },
  resultNum: { fontWeight: "800" },
  cityRow: { gap: 8, paddingHorizontal: 14, paddingBottom: 10 },
  cityChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  cityChipText: { fontSize: 12, fontWeight: "600" },
  actionsRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingBottom: 4,
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1,
  },
  actionBtnText: { fontSize: 12, fontWeight: "600" },
  mapViewBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1,
  },
  mapViewBtnText: { fontSize: 12, fontWeight: "700" },
  spacer: { flex: 1 },
  sortMenu: {
    marginHorizontal: 14, borderRadius: 10, borderWidth: 1,
    overflow: "hidden", marginTop: 4, marginBottom: 4,
    position: "absolute", right: 14, top: "100%", width: 160, zIndex: 100,
  },
  sortMenuItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  sortMenuText: { fontSize: 13, fontWeight: "600" },
  list: { padding: 14, paddingTop: 16 },
  empty: { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptyHint: { fontSize: 13 },
  compareBar: {
    position: "absolute", bottom: Platform.OS === "web" ? 84 : 60, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1,
  },
  compareBarText: { fontSize: 14, fontWeight: "700" },
  compareBarBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  compareBarBtnText: { fontSize: 13, fontWeight: "800" },
});
