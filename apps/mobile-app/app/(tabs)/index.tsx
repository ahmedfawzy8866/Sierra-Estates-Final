import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ClaimNowModal } from "@/components/ClaimNowModal";
import { PropertyCard } from "@/components/PropertyCard";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { useClaim } from "@/context/ClaimContext";
import { FEATURES, PROPERTIES, STATS, TESTIMONIALS } from "@/data/properties";
import { useColors } from "@/hooks/useColors";

const { width: SCREEN_W } = Dimensions.get("window");

export default function HomeScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const { t, isRTL, toggleLanguage, language } = useLanguage();
  const { hasClaimed } = useClaim();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [claimVisible, setClaimVisible] = useState(false);

  const featured = PROPERTIES.filter((p) => p.isFeatured);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 240], outputRange: [0, 1], extrapolate: "clamp" });

  const rowDir = isRTL ? "row-reverse" : "row";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[styles.stickyHeader, { backgroundColor: colors.background, paddingTop: topPad, opacity: headerOpacity, borderBottomColor: colors.border }]}
        pointerEvents="none"
      >
        <Text style={[styles.stickyTitle, { color: colors.text }]}>{t.brandName}</Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        <ImageBackground
          source={require("../../assets/images/hero_bg.png")}
          style={[styles.hero, { paddingTop: topPad + 20 }]}
          imageStyle={{ resizeMode: "cover" }}
        >
          <View style={[styles.heroOverlay, { backgroundColor: isDark ? "rgba(4,12,22,0.65)" : "rgba(4,12,22,0.55)" }]} />

          <View style={[styles.heroBranding, { paddingTop: Platform.OS === "web" ? 0 : topPad, flexDirection: rowDir }]}>
            <View style={[styles.logoRow, { flexDirection: rowDir }]}>
              <Image source={require("../../assets/images/logo_shield.png")} style={styles.logo} />
              <Text style={styles.brandName}>{t.brandName}</Text>
            </View>
            <View style={[styles.topActions, { flexDirection: rowDir }]}>
              <Pressable
                style={[styles.topBtn, { backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.25)" }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleLanguage(); }}
              >
                <Text style={styles.langBtnText}>{language === "en" ? "ع" : "EN"}</Text>
              </Pressable>
              <Pressable
                style={[styles.topBtn, { backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.25)" }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleTheme(); }}
              >
                <Feather name={isDark ? "sun" : "moon"} size={16} color="#FAF8F5" />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroContent}>
            <Pressable
              style={[styles.promoBar, { backgroundColor: "rgba(4,12,22,0.75)", flexDirection: rowDir }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setClaimVisible(true); }}
            >
              <View style={[styles.promoBadge, { backgroundColor: colors.gold }]}>
                <Text style={[styles.promoLabel, { color: colors.navyDeep }]}>{t.promoOff}</Text>
              </View>
              <Text style={styles.promoText}>{t.promoService}</Text>
              <Text style={[styles.promoSpots, { color: colors.gold }]}>{t.promoSpots}</Text>
            </Pressable>

            <View style={[styles.pill, { flexDirection: rowDir }]}>
              <View style={[styles.dot, { backgroundColor: colors.gold }]} />
              <Text style={[styles.pillText, { color: colors.gold }]}>{t.aiDriven}</Text>
            </View>
            <Text style={[styles.heroHeadline, { textAlign: isRTL ? "right" : "left" }]}>
              {t.heroTitle1}{"\n"}
              <Text style={[styles.heroItalic, { color: colors.gold }]}>{t.heroTitle2}</Text>
            </Text>
            <Text style={[styles.heroSub, { textAlign: isRTL ? "right" : "left" }]}>{t.heroSub}</Text>
            <View style={[styles.heroCtas, { flexDirection: rowDir }]}>
              <Pressable
                style={({ pressed }) => [styles.ctaPrimary, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/(tabs)/listings" as any); }}
              >
                <Text style={[styles.ctaPrimaryText, { color: colors.navyDeep }]}>{t.exploreListings}</Text>
                <Feather name={isRTL ? "arrow-left" : "arrow-right"} size={16} color={colors.navyDeep} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.ctaSecondary, { borderColor: "rgba(255,255,255,0.4)", flexDirection: rowDir, opacity: pressed ? 0.75 : 1 }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/(tabs)/map" as any); }}
              >
                <Feather name="map" size={14} color="#FAF8F5" />
                <Text style={styles.ctaSecondaryText}>{t.viewMap}</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.statsRow, { backgroundColor: "rgba(4,12,22,0.6)", flexDirection: rowDir }]}>
            {[
              { value: "1,500+", label: t.luxuryListings },
              { value: "98%", label: t.aiMatchRate },
              { value: "26", label: t.compounds },
              { value: "<4s", label: t.responseTime },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.gold }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { textAlign: "center" }]}>{s.label.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </ImageBackground>

        <View style={[styles.quickActions, { backgroundColor: colors.background, borderBottomColor: colors.border, flexDirection: rowDir }]}>
          <QuickAction icon="search" label={t.search} color={colors} onPress={() => router.push("/(tabs)/listings" as any)} />
          <QuickAction icon="map" label={t.mapView} color={colors} onPress={() => router.push("/(tabs)/map" as any)} />
          <QuickAction icon="camera" label={t.virtualTour} color={colors} onPress={() => router.push(`/property/1` as any)} />
          <QuickAction icon="tag" label={hasClaimed ? (isRTL ? "✓ محجوز" : "✓ Claimed") : (isRTL ? "احجز 25%" : "Claim 25%")} color={colors} onPress={() => setClaimVisible(true)} gold={!hasClaimed} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <SectionHeader title={t.featuredProperties} subtitle={t.featuredSub} colors={colors} isRTL={isRTL} />
          {featured.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
          <Pressable
            style={({ pressed }) => [styles.seeAllBtn, { borderColor: colors.border, flexDirection: rowDir, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push("/(tabs)/listings" as any)}
          >
            <Text style={[styles.seeAllText, { color: colors.gold }]}>{t.seeAll} {PROPERTIES.length} {t.properties}</Text>
            <Feather name={isRTL ? "arrow-left" : "arrow-right"} size={14} color={colors.gold} />
          </Pressable>
        </View>

        <View style={[styles.featuresSection, { backgroundColor: isDark ? colors.navyMid : colors.surfaceAlt }]}>
          <SectionHeader title={t.whySierra} subtitle={t.whySierraSub} colors={colors} isRTL={isRTL} />
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.featureCard, { backgroundColor: isDark ? colors.navyDeep : colors.card, borderColor: colors.border }]}>
                <View style={[styles.featureIcon, { backgroundColor: colors.gold + "22" }]}>
                  <Feather name={f.icon as any} size={20} color={colors.gold} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>{f.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.testimonialsSection, { backgroundColor: colors.background }]}>
          <SectionHeader title={t.clientStories} subtitle={t.clientStoriesSub} colors={colors} isRTL={isRTL} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.testimonialRow}>
            {TESTIMONIALS.map((item, i) => (
              <View key={i} style={[styles.testimonialCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.starsRow, { flexDirection: rowDir }]}>
                  {Array(item.rating).fill(0).map((_, si) => <Feather key={si} name="star" size={12} color={colors.gold} />)}
                </View>
                <Text style={[styles.testimonialText, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>"{item.text}"</Text>
                <View style={[styles.testimonialAuthor, { flexDirection: rowDir }]}>
                  <View style={[styles.testimonialAvatar, { backgroundColor: colors.gold + "22", borderColor: colors.gold + "44" }]}>
                    <Text style={[styles.testimonialInitials, { color: colors.gold }]}>{item.avatar}</Text>
                  </View>
                  <View>
                    <Text style={[styles.testimonialName, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>{item.name}</Text>
                    <Text style={[styles.testimonialRole, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>{item.role}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.ctaSection, { backgroundColor: isDark ? colors.navyMid : colors.surfaceAlt }]}>
          <View style={[styles.ctaCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.ctaEyebrow, { color: colors.gold }]}>{t.limitedAccess}</Text>
            <Text style={[styles.ctaTitle, { color: colors.text }]}>{t.off25Title}</Text>
            <Text style={[styles.ctaSub, { color: colors.mutedForeground }]}>{t.off25Sub}</Text>
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setClaimVisible(true); }}
            >
              <Text style={[styles.ctaBtnText, { color: colors.navyDeep }]}>{t.claimNow}</Text>
            </Pressable>
          </View>
        </View>
      </Animated.ScrollView>

      <ClaimNowModal visible={claimVisible} onClose={() => setClaimVisible(false)} />
    </View>
  );
}

function QuickAction({ icon, label, color, onPress, gold }: any) {
  return (
    <Pressable style={({ pressed }) => [styles.quickAction, { opacity: pressed ? 0.7 : 1 }]} onPress={onPress}>
      <View style={[styles.quickActionIcon, {
        backgroundColor: gold ? color.gold + "25" : color.gold + "18",
        borderColor: gold ? color.gold + "60" : color.gold + "30",
        borderWidth: gold ? 1.5 : 1,
      }]}>
        <Feather name={icon} size={20} color={color.gold} />
      </View>
      <Text style={[styles.quickActionLabel, { color: color.mutedForeground }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

function SectionHeader({ title, subtitle, colors, isRTL }: any) {
  return (
    <View style={[styles.sectionHeader, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
      <Text style={[styles.sectionTitle, { color: colors.text, textAlign: isRTL ? "right" : "left" }]}>{title}</Text>
      {subtitle && <Text style={[styles.sectionSub, { color: colors.mutedForeground, textAlign: isRTL ? "right" : "left" }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  stickyHeader: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 100, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 1 },
  stickyTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
  hero: { minHeight: 560, justifyContent: "space-between" },
  heroOverlay: StyleSheet.absoluteFillObject as any,
  heroBranding: { alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, zIndex: 1 },
  logoRow: { alignItems: "center", gap: 8 },
  logo: { width: 32, height: 32, borderRadius: 8 },
  brandName: { color: "#FAF8F5", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  topActions: { gap: 8 },
  topBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  langBtnText: { color: "#FAF8F5", fontSize: 14, fontWeight: "800" },
  heroContent: { padding: 24, zIndex: 1 },
  promoBar: { alignItems: "center", gap: 8, backgroundColor: "rgba(4,12,22,0.75)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 20, flexWrap: "wrap" },
  promoBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  promoLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  promoText: { color: "#FAF8F5CC", fontSize: 11, flex: 1 },
  promoSpots: { fontSize: 11, fontWeight: "700" },
  pill: { alignItems: "center", gap: 8, marginBottom: 14 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  heroHeadline: { fontSize: 40, fontWeight: "800", lineHeight: 48, color: "#FAF8F5", marginBottom: 14 },
  heroItalic: { fontStyle: "italic", fontWeight: "800" },
  heroSub: { fontSize: 13, lineHeight: 21, color: "#FAF8F5CC", marginBottom: 28 },
  heroCtas: { gap: 12, flexWrap: "wrap" },
  ctaPrimary: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 13, borderRadius: 6 },
  ctaPrimaryText: { fontSize: 14, fontWeight: "700" },
  ctaSecondary: { alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 6, borderWidth: 1 },
  ctaSecondaryText: { color: "#FAF8F5", fontSize: 14, fontWeight: "600" },
  statsRow: { paddingHorizontal: 16, paddingVertical: 18, justifyContent: "space-around", zIndex: 1 },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 9, fontWeight: "600", letterSpacing: 1, color: "rgba(250,248,245,0.6)" },
  quickActions: { justifyContent: "space-around", paddingVertical: 20, paddingHorizontal: 12, borderBottomWidth: 1 },
  quickAction: { alignItems: "center", gap: 8, flex: 1 },
  quickActionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  quickActionLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  section: { padding: 20, paddingTop: 28 },
  sectionHeader: { marginBottom: 18 },
  sectionTitle: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  sectionSub: { fontSize: 13 },
  seeAllBtn: { alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 8, borderWidth: 1, marginTop: 4 },
  seeAllText: { fontSize: 14, fontWeight: "700" },
  featuresSection: { padding: 20, paddingTop: 28, paddingBottom: 28 },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  featureCard: { width: (SCREEN_W - 52) / 2, padding: 16, borderRadius: 12, borderWidth: 1, gap: 10 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureTitle: { fontSize: 13, fontWeight: "700" },
  featureDesc: { fontSize: 11, lineHeight: 17 },
  testimonialsSection: { padding: 20, paddingTop: 28, paddingBottom: 28 },
  testimonialRow: { gap: 12, paddingRight: 20 },
  testimonialCard: { width: SCREEN_W * 0.78, padding: 20, borderRadius: 14, borderWidth: 1, gap: 12 },
  starsRow: { gap: 3 },
  testimonialText: { fontSize: 13, lineHeight: 20, fontStyle: "italic" },
  testimonialAuthor: { alignItems: "center", gap: 12 },
  testimonialAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  testimonialInitials: { fontSize: 13, fontWeight: "800" },
  testimonialName: { fontSize: 13, fontWeight: "700" },
  testimonialRole: { fontSize: 11, marginTop: 1 },
  ctaSection: { padding: 20, paddingBottom: 20 },
  ctaCard: { borderRadius: 14, borderWidth: 1, padding: 26, alignItems: "center" },
  ctaEyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 2, marginBottom: 10 },
  ctaTitle: { fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 10 },
  ctaSub: { fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 20 },
  ctaBtn: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 6 },
  ctaBtnText: { fontSize: 14, fontWeight: "800" },
});
