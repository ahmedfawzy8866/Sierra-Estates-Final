import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useFavorites } from "@/context/FavoritesContext";
import { useColors } from "@/hooks/useColors";
import type { Property } from "@/data/properties";

const isWeb = Platform.OS === "web";

interface PropertyCardProps {
  property: Property;
  horizontal?: boolean;
  compareMode?: boolean;
  isCompared?: boolean;
  onCompare?: (id: string) => void;
}

export function PropertyCard({ property, horizontal = false, compareMode = false, isCompared = false, onCompare }: PropertyCardProps) {
  const colors = useColors();
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(property.id);

  function onFav() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(property.id);
  }

  function onPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (compareMode && onCompare) {
      onCompare(property.id);
    } else {
      router.push(`/property/${property.id}` as any);
    }
  }

  if (horizontal) {
    return (
      <Animated.View entering={isWeb ? undefined : FadeInDown.springify().damping(16).mass(0.8)}>
        <Pressable
          style={({ pressed }) => [
            styles.hCard,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={onPress}
        >
          <View style={styles.hImageWrap}>
          <Image source={property.image} style={styles.hImage} />
          {property.isOffPlan && (
            <View style={[styles.offPlanBadge, { backgroundColor: colors.card }]}>
              <Text style={[styles.offPlanText, { color: colors.text }]}>Off-Plan</Text>
            </View>
          )}
        </View>
        <View style={styles.hContent}>
          <Text style={[styles.hPrice, { color: colors.gold }]} numberOfLines={1}>{property.priceLabel}</Text>
          <Text style={[styles.hTitle, { color: colors.text }]} numberOfLines={1}>{property.title}</Text>
          <Text style={[styles.hLocation, { color: colors.mutedForeground }]} numberOfLines={1}>{property.location}</Text>
          <View style={styles.hMeta}>
            <MetaPill icon="maximize" label={`${(property.sqft / 1000).toFixed(1)}k ft²`} colors={colors} />
            <MetaPill icon="trending-up" label={`${property.yieldPercent}%`} colors={colors} highlight />
          </View>
        </View>
        <Pressable style={styles.hFav} onPress={onFav} hitSlop={12}>
          <Feather name="heart" size={18} color={fav ? colors.gold : colors.mutedForeground} />
        </Pressable>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={isWeb ? undefined : FadeInDown.springify().damping(16).mass(0.8)} style={{ width: horizontal ? "auto" : "100%" }}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isCompared ? colors.gold : colors.border,
            borderWidth: isCompared ? 2 : 1,
            opacity: pressed ? 0.95 : 1,
          },
        ]}
        onPress={onPress}
      >
        {compareMode && (
        <View style={[styles.compareOverlay, isCompared && { backgroundColor: colors.gold + "22" }]}>
          <View style={[styles.compareCheckbox, {
            backgroundColor: isCompared ? colors.gold : "transparent",
            borderColor: isCompared ? colors.gold : colors.border,
          }]}>
            {isCompared && <Feather name="check" size={12} color={colors.navyDeep} />}
          </View>
          <Text style={[styles.compareLabel, { color: isCompared ? colors.gold : colors.mutedForeground }]}>
            {isCompared ? "Selected" : "Select to Compare"}
          </Text>
        </View>
      )}

      <View style={styles.imageContainer}>
        <Image source={property.image} style={styles.image} />

        {property.isOffPlan && (
          <View style={styles.offPlanRow}>
            <View style={[styles.offPlanPill, { backgroundColor: "rgba(4,12,22,0.85)" }]}>
              <Text style={[styles.offPlanPillText, { color: "#FAF8F5" }]}>Off-Plan</Text>
            </View>
            {property.deliveryDate && (
              <View style={[styles.offPlanPill, { backgroundColor: "rgba(4,12,22,0.85)" }]}>
                <Text style={[styles.offPlanPillText, { color: "#FAF8F5" }]}>Delivery: {property.deliveryDate}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.imageTopRight}>
          <View style={[styles.scoreTag, { backgroundColor: "rgba(4,12,22,0.85)" }]}>
            <Feather name="cpu" size={9} color={colors.gold} />
            <Text style={[styles.scoreText, { color: colors.gold }]}>{property.aiScore}</Text>
          </View>
          <Pressable style={[styles.favBtn, { backgroundColor: "rgba(4,12,22,0.6)" }]} onPress={onFav} hitSlop={10}>
            <Feather name="heart" size={17} color={fav ? colors.gold : "#ffffff"} />
          </Pressable>
        </View>

        {property.isFeatured && (
          <View style={[styles.featuredTag, { backgroundColor: colors.gold }]}>
            <Text style={[styles.featuredText, { color: colors.navyDeep }]}>FEATURED</Text>
          </View>
        )}

        <View style={[styles.tourHint, { backgroundColor: "rgba(4,12,22,0.7)" }]}>
          <Feather name="camera" size={11} color={colors.gold} />
          <Text style={[styles.tourHintText, { color: colors.gold }]}>Virtual Tour</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.gold }]}>{property.priceLabel}</Text>
          <View style={[styles.yieldBadge, { borderColor: colors.gold + "44", backgroundColor: colors.gold + "12" }]}>
            <Feather name="trending-up" size={10} color={colors.gold} />
            <Text style={[styles.yieldText, { color: colors.gold }]}>{property.yieldPercent}% yield</Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{property.title}</Text>
        <View style={styles.locRow}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.location, { color: colors.mutedForeground }]} numberOfLines={1}>
            {property.location} · {property.city}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.meta}>
          <MetaPill icon="home" label={`${property.beds} beds`} colors={colors} />
          <MetaPill icon="droplet" label={`${property.baths} baths`} colors={colors} />
          <MetaPill icon="maximize" label={`${(property.sqft / 1000).toFixed(1)}k ft²`} colors={colors} />
        </View>

        <View style={[styles.compoundRow, { borderTopColor: colors.border }]}>
          <Feather name="layers" size={11} color={colors.mutedForeground} />
          <Text style={[styles.compoundText, { color: colors.mutedForeground }]}>{property.compound}</Text>
        </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function MetaPill({ icon, label, colors, highlight }: any) {
  return (
    <View style={styles.metaPill}>
      <Feather name={icon} size={11} color={highlight ? colors.gold : colors.mutedForeground} />
      <Text style={[styles.metaText, { color: highlight ? colors.gold : colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  imageContainer: { position: "relative", height: 210 },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  offPlanRow: { position: "absolute", top: 12, left: 12, flexDirection: "row", gap: 6 },
  offPlanPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  offPlanPillText: { fontSize: 12, fontWeight: "700" },
  imageTopRight: { position: "absolute", top: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  scoreTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  scoreText: { fontSize: 12, fontWeight: "700" },
  favBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  featuredTag: { position: "absolute", bottom: 12, left: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  featuredText: { fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  tourHint: { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tourHintText: { fontSize: 12, fontWeight: "600" },
  content: { padding: 14 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  price: { fontSize: 21, fontWeight: "800" },
  yieldBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  yieldText: { fontSize: 12, fontWeight: "700" },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  location: { fontSize: 14 },
  divider: { height: 1, marginBottom: 12 },
  meta: { flexDirection: "row", gap: 14, marginBottom: 10 },
  metaPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, fontWeight: "500" },
  compoundRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 10, borderTopWidth: 1 },
  compoundText: { fontSize: 12 },
  compareOverlay: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, paddingBottom: 0 },
  compareCheckbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  compareLabel: { fontSize: 14, fontWeight: "600" },
  hCard: { flexDirection: "row", borderRadius: 12, borderWidth: 1, overflow: "hidden", marginBottom: 12, alignItems: "stretch" },
  hImageWrap: { position: "relative", width: 100 },
  hImage: { width: 100, height: "100%", resizeMode: "cover" },
  offPlanBadge: { position: "absolute", top: 8, left: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  offPlanText: { fontSize: 12, fontWeight: "700" },
  hContent: { flex: 1, padding: 12 },
  hPrice: { fontSize: 16, fontWeight: "800", marginBottom: 2 },
  hTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  hLocation: { fontSize: 12, marginBottom: 6 },
  hMeta: { flexDirection: "row", gap: 10 },
  hFav: { paddingHorizontal: 14, alignItems: "center", justifyContent: "center" },
});
