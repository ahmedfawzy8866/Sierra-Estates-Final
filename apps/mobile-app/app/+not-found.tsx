import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { Property, PROPERTIES } from "@/data/properties";
import React from "react";

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.primary }]}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
  },
});
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
function buildMapHtml(properties: Property[], isDark: boolean) {
  const markers = properties.map((p) => ({
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    label: p.priceLabel,
    title: p.title,
    score: p.aiScore,
    type: p.type,
  }));

  const bgColor = isDark ? "#040C16" : "#FAF8F5";
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; background: ${bgColor}; }
#map { width: 100%; height: 100vh; }
.price-marker {
  background: #040C16;
  color: #E9C176;
  border: 2px solid #E9C176;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 800;
  font-family: sans-serif;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  transition: transform 0.15s ease;
}
.price-marker.active {
  background: #E9C176;
  color: #040C16;
  transform: scale(1.15);
  z-index: 9999 !important;
}
.leaflet-popup-content-wrapper {
  background: #0D2035;
  border: 1px solid #1C3A5E;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
  color: #FAF8F5;
  font-family: sans-serif;
}
.leaflet-popup-tip { background: #0D2035; }
.leaflet-popup-close-button { color: #8A9BB0 !important; font-size: 18px !important; }
.popup-title { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
.popup-loc { font-size: 11px; color: #8A9BB0; margin-bottom: 8px; }
.popup-score { font-size: 11px; color: #E9C176; font-weight: 700; }
.popup-btn { margin-top: 10px; background: #E9C176; color: #040C16; border: none; border-radius: 6px; padding: 8px 16px; font-size: 12px; font-weight: 700; cursor: pointer; width: 100%; }
.popup-btn:hover { opacity: 0.85; }
</style>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([25.15, 55.22], 11);
L.tileLayer('${tileUrl}', { maxZoom: 19 }).addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);

var data = ${JSON.stringify(markers)};
var activeMarker = null;

data.forEach(function(p) {
  var el = document.createElement('div');
  el.className = 'price-marker';
  el.innerText = p.label;

  var marker = L.marker([p.lat, p.lng], {
    icon: L.divIcon({ className: '', html: el, iconSize: null, iconAnchor: [40, 16] })
  }).addTo(map);

  marker.on('click', function() {
    if (activeMarker) activeMarker.classList.remove('active');
    el.classList.add('active');
    activeMarker = el;

    var popup = L.popup({ maxWidth: 220, className: '' })
      .setLatLng([p.lat, p.lng])
      .setContent(
        '<div class="popup-title">' + p.title + '</div>' +
        '<div class="popup-loc">' + p.type.charAt(0).toUpperCase() + p.type.slice(1) + '</div>' +
        '<div class="popup-score">AI Score: ' + p.score + '/100</div>' +
        '<button class="popup-btn" onclick="window.ReactNativeWebView && window.ReactNativeWebView.postMessage(\\'' + p.id + '\\')">View Property</button>'
      )
      .openOn(map);
  });
});
</script>
</body>
</html>`;
}

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isDark } = require("@/context/ThemeContext").useTheme();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  function onMessage(event: any) {
    const id = event.nativeEvent.data;
    const property = PROPERTIES.find((p) => p.id === id);
    if (property) {
      setSelectedProperty(property);
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
    }
  }

  function closeCard() {
    Animated.timing(cardAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setSelectedProperty(null)
    );
  }

  const cardTranslate = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 0],
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Property Map</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {PROPERTIES.length} properties across Dubai
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.gold + "20", borderColor: colors.gold + "44" }]}>
          <View style={[styles.dot, { backgroundColor: colors.gold }]} />
          <Text style={[styles.badgeText, { color: colors.gold }]}>LIVE</Text>
        </View>
      </View>

      <WebView
        source={{ html: buildMapHtml(PROPERTIES, isDark) }}
        style={styles.map}
        onMessage={onMessage}
        javaScriptEnabled
        scrollEnabled={false} />

      {selectedProperty && (
        <Animated.View
          style={[
            styles.propertyCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ translateY: cardTranslate }],
            },
          ]}
        >
          <Pressable style={styles.cardClose} onPress={closeCard} hitSlop={8}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </Pressable>
          <Image source={selectedProperty.image} style={styles.cardImage} />
          <View style={styles.cardBody}>
            <View style={styles.cardTop}>
              <Text style={[styles.cardPrice, { color: colors.gold }]}>{selectedProperty.priceLabel}</Text>
              <View style={[styles.aiTag, { backgroundColor: colors.gold + "20" }]}>
                <Text style={[styles.aiTagText, { color: colors.gold }]}>AI {selectedProperty.aiScore}</Text>
              </View>
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
              {selectedProperty.title}
            </Text>
            <Text style={[styles.cardLoc, { color: colors.mutedForeground }]} numberOfLines={1}>
              {selectedProperty.location} · {selectedProperty.city}
            </Text>
            <View style={styles.cardMeta}>
              <MetaItem icon="home" label={`${selectedProperty.beds} beds`} colors={colors} />
              <MetaItem icon="droplet" label={`${selectedProperty.baths} baths`} colors={colors} />
              <MetaItem icon="trending-up" label={`${selectedProperty.yieldPercent}%`} colors={colors} highlight />
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.viewBtn,
                { backgroundColor: colors.gold, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => {
                closeCard();
                router.push(`/property/${selectedProperty.id}` as any);
              }}
            >
              <Text style={[styles.viewBtnText, { color: colors.navyDeep }]}>View Property</Text>
              <Feather name="arrow-right" size={15} color={colors.navyDeep} />
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}
function MetaItem({ icon, label, colors, highlight }: any) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon} size={11} color={highlight ? colors.gold : colors.mutedForeground} />
      <Text style={[styles.metaText, { color: highlight ? colors.gold : colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { fontSize: 12, marginTop: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  map: { flex: 1 },
  propertyCard: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 90 : 90,
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  cardClose: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: { width: 110, height: "100%", resizeMode: "cover" },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  cardPrice: { fontSize: 18, fontWeight: "800" },
  aiTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  aiTagText: { fontSize: 11, fontWeight: "700" },
  cardTitle: { fontSize: 13, fontWeight: "700", marginBottom: 3 },
  cardLoc: { fontSize: 11, marginBottom: 8 },
  cardMeta: { flexDirection: "row", gap: 10, marginBottom: 12 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 10, fontWeight: "500" },
  viewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 6,
  },
  viewBtnText: { fontSize: 12, fontWeight: "800" },
});
