import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useActionSheet } from "@expo/react-native-action-sheet";

import { SierraHeader } from "@/components/SierraHeader";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminScreen() {
  const colors = useColors();
  const { isRTL } = useLanguage();
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();

  const [platformMode, setPlatformMode] = useState("Production");

  const handleChangeMode = () => {
    const options = ["Production", "Staging", "Development", "Cancel"];
    const cancelButtonIndex = 3;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        title: "Platform Environment",
        message: "Select the environment you want to connect to.",
        userInterfaceStyle: "dark",
      },
      (selectedIndex?: number) => {
        if (selectedIndex !== undefined && selectedIndex !== cancelButtonIndex) {
          setPlatformMode(options[selectedIndex]);
        }
      }
    );
  };

  const rowDir = isRTL ? "row-reverse" : "row";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SierraHeader
        title="Admin Settings"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.gold, textAlign: isRTL ? "right" : "left" }]}>
            SYSTEM CONFIGURATION
          </Text>
          
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { borderBottomColor: colors.border, flexDirection: rowDir, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleChangeMode}
          >
            <View style={[styles.settingLeft, { flexDirection: rowDir }]}>
              <Feather name="server" size={18} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Environment</Text>
            </View>
            <View style={[styles.settingRight, { flexDirection: rowDir }]}>
              <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{platformMode}</Text>
              <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { borderBottomColor: colors.border, flexDirection: rowDir, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              showActionSheetWithOptions({
                options: ["Clear Cache", "Cancel"],
                destructiveButtonIndex: 0,
                cancelButtonIndex: 1,
                userInterfaceStyle: "dark"
              }, () => {});
            }}
          >
            <View style={[styles.settingLeft, { flexDirection: rowDir }]}>
              <Feather name="trash-2" size={18} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Clear Local Data</Text>
            </View>
            <View style={[styles.settingRight, { flexDirection: rowDir }]}>
              <Feather name={isRTL ? "chevron-left" : "chevron-right"} size={16} color={colors.mutedForeground} />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "JetBrainsMono-Regular",
    letterSpacing: 1,
    marginBottom: 16,
  },
  settingRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLeft: {
    alignItems: "center",
    gap: 12,
  },
  settingRight: {
    alignItems: "center",
    gap: 8,
  },
  settingText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
  },
  settingValue: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
});
