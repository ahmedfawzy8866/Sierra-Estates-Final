import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";

import { useColors } from "@/hooks/useColors";

interface VirtualTourModalProps {
  visible: boolean;
  onClose: () => void;
  propertyTitle: string;
  tourUrl?: string;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const PANNELLUM_HTML = (imageUrl: string, title: string) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"/>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; background: #040C16; overflow: hidden; }
#panorama { width: 100%; height: 100vh; }
</style>
</head>
<body>
<div id="panorama"></div>
<script>
pannellum.viewer('panorama', {
  type: 'equirectangular',
  panorama: 'https://pannellum.org/images/alma.jpg',
  autoLoad: true,
  autoRotate: -2,
  compass: false,
  showZoomCtrl: false,
  showFullscreenCtrl: false,
  showControls: false,
  hfov: 100,
  pitch: 5,
  yaw: 180,
  title: '${title}',
  author: 'Sierra Estates',
});
</script>
</body>
</html>`;

export function VirtualTourModal({ visible, onClose, propertyTitle }: VirtualTourModalProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(true);

  const html = PANNELLUM_HTML("", propertyTitle);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent>
      <View style={[styles.root, { backgroundColor: colors.navyDeep }]}>
        <View style={[styles.header, { backgroundColor: "rgba(4,12,22,0.9)", borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.headerLabel, { color: colors.gold }]}>VIRTUAL TOUR</Text>
            <Text style={[styles.headerTitle, { color: colors.cream }]} numberOfLines={1}>
              {propertyTitle}
            </Text>
          </View>
          <Pressable style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onClose}>
            <Feather name="x" size={20} color={colors.cream} />
          </Pressable>
        </View>

        <View style={styles.tourContainer}>
          {loading && (
            <View style={[styles.loader, { backgroundColor: colors.navyDeep }]}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={[styles.loaderText, { color: colors.mutedForeground }]}>Loading 360° Tour...</Text>
            </View>
          )}
          <WebView
            source={{ html }}
            style={styles.webview}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
          />
        </View>

        <View style={[styles.footer, { backgroundColor: "rgba(4,12,22,0.9)", borderTopColor: colors.border }]}>
          <View style={styles.footerLeft}>
            <Feather name="rotate-cw" size={14} color={colors.gold} />
            <Text style={[styles.footerHint, { color: colors.mutedForeground }]}>Drag to explore the space</Text>
          </View>
          <View style={styles.footerLeft}>
            <Feather name="zoom-in" size={14} color={colors.gold} />
            <Text style={[styles.footerHint, { color: colors.mutedForeground }]}>Pinch to zoom</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 14,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 2, marginBottom: 3 },
  headerTitle: { fontSize: 16, fontWeight: "700", maxWidth: SCREEN_W - 100 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tourContainer: { flex: 1, position: "relative" },
  webview: { flex: 1, backgroundColor: "#040C16" },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 5,
  },
  loaderText: { fontSize: 13 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 14,
    borderTopWidth: 1,
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerHint: { fontSize: 12 },
});
