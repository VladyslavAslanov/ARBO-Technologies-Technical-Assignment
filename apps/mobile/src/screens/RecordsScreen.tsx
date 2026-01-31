import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  RefreshControl,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useStores } from "../core/rootStore";

function PillButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? "#111" : "#ddd",
        backgroundColor: active ? "#111" : "transparent",
        color: active ? "#fff" : "#111",
        overflow: "hidden",
        marginRight: 8,
      }}
    >
      {label}
    </Text>
  );
}

function DefectTypeDropdown({
  label,
  items,
  selected,
  onToggle,
  onClear,
  onClose,
  visible,
  onOpen,
  renderLabel,
  tSelected,
  tAll,
  tClose,
  tClear,
}: {
  label: string;
  items: Array<{ key: string; category: string }>;
  selected: string[];
  onToggle: (key: string) => void;
  onClear: () => void;
  visible: boolean;
  onClose: () => void;
  onOpen: () => void;
  renderLabel: (key: string) => string;
  tSelected: string;
  tAll: string;
  tClose: string;
  tClear: string;
}) {
  const selectedCount = selected.length;

  return (
    <>
      <Pressable
        onPress={onOpen}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#ddd",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "600" }}>{label}</Text>
        <Text style={{ opacity: 0.7 }}>
          {selectedCount === 0 ? tAll : `${tSelected}: ${selectedCount}`}
        </Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, paddingTop: 60 }}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600" }}>{label}</Text>
            <View style={{ flexDirection: "row" }}>
              <Pressable onPress={onClear} style={{ padding: 10 }}>
                <Text style={{ fontWeight: "600" }}>{tClear}</Text>
              </Pressable>
              <Pressable onPress={onClose} style={{ padding: 10 }}>
                <Text style={{ fontWeight: "600" }}>{tClose}</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {items.map((it) => {
              const active = selected.includes(it.key);
              return (
                <Pressable
                  key={it.key}
                  onPress={() => onToggle(it.key)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderWidth: 1,
                    borderColor: active ? "#111" : "#ddd",
                    borderRadius: 10,
                    marginBottom: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>
                    {renderLabel(it.key)}
                  </Text>
                  <Text>{active ? "✓" : ""}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

export const RecordsScreen = observer(() => {
  const { t } = useTranslation(["screens", "common", "defects"]);
  const { sessionStore, recordsStore, defectTypesStore } = useStores();

  const [defectsOpen, setDefectsOpen] = useState(false);

  console.log(sessionStore.deviceId);

  const defectTypesKey = recordsStore.selectedDefectTypes
    .slice()
    .sort()
    .join("|");

  useEffect(() => {
    if (!sessionStore.isReady) return;
    if (!sessionStore.deviceId) return;
    recordsStore.loadFirstPage(sessionStore.deviceId);
  }, [
    sessionStore.isReady,
    sessionStore.deviceId,
    recordsStore.days,
    recordsStore.sortBy,
    recordsStore.order,
    defectTypesKey,
  ]);

  if (!sessionStore.isReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>{t("common:loading")}</Text>
      </View>
    );
  }

  if (sessionStore.error) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Text>
          {t("common:error")}: {sessionStore.error}
        </Text>
      </View>
    );
  }

  const deviceId = sessionStore.deviceId!;
  const isEmpty = !recordsStore.loading && recordsStore.items.length === 0;

  return (
    <View style={{ flex: 1, paddingTop: 60 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        {t("screens:records.title")}
      </Text>

      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <View style={{ marginTop: 12 }}>
          <DefectTypeDropdown
            label={t("screens:records.filters.defectType")}
            items={defectTypesStore.items}
            selected={recordsStore.selectedDefectTypes}
            onToggle={(k) => recordsStore.toggleDefectType(k)}
            onClear={() => recordsStore.clearDefectTypes()}
            visible={defectsOpen}
            onOpen={() => setDefectsOpen(true)}
            onClose={() => setDefectsOpen(false)}
            renderLabel={(key) =>
              t(`defects:${key}.label`, { defaultValue: key })
            }
            tSelected={t("screens:records.filters.selected")}
            tAll={t("screens:records.filters.allDefects")}
            tClose={t("screens:records.filters.close")}
            tClear={t("screens:records.filters.clear")}
          />
        </View>
        <Text style={{ marginBottom: 6, opacity: 0.7 }}>
          {t("screens:records.filters.days")}
        </Text>
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <PillButton
            label="7"
            active={recordsStore.days === 7}
            onPress={() => recordsStore.setDays(7)}
          />
          <PillButton
            label="14"
            active={recordsStore.days === 14}
            onPress={() => recordsStore.setDays(14)}
          />
          <PillButton
            label="30"
            active={recordsStore.days === 30}
            onPress={() => recordsStore.setDays(30)}
          />
        </View>

        <Text style={{ marginBottom: 6, opacity: 0.7 }}>
          {t("screens:records.filters.sort")}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <PillButton
            label={t("screens:records.filters.sortCreatedAt")}
            active={recordsStore.sortBy === "createdAt"}
            onPress={() => recordsStore.setSortBy("createdAt")}
          />
          <PillButton
            label={t("screens:records.filters.sortSeverity")}
            active={recordsStore.sortBy === "severity"}
            onPress={() => recordsStore.setSortBy("severity")}
          />
          <PillButton
            label={recordsStore.order.toUpperCase()}
            active={true}
            onPress={() => recordsStore.toggleOrder()}
          />
        </View>
      </View>

      <Text style={{ paddingHorizontal: 16, marginBottom: 8, opacity: 0.7 }}>
        deviceId: {sessionStore.deviceId}
      </Text>

      {recordsStore.error ? (
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text>
            {t("common:error")}: {recordsStore.error}
          </Text>
        </View>
      ) : null}

      {isEmpty ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>{t("screens:records.isEmpty")}</Text>
        </View>
      ) : (
        <FlatList
          data={recordsStore.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={recordsStore.loading && recordsStore.offset === 0}
              onRefresh={() => recordsStore.loadFirstPage(deviceId)}
            />
          }
          onEndReachedThreshold={0.6}
          onEndReached={() => recordsStore.loadNextPage(deviceId)}
          ListFooterComponent={
            recordsStore.loading && recordsStore.offset > 0 ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 10,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "600" }}>
                {t(`defects:${item.defectType}.label`, {
                  defaultValue: item.defectType,
                })}{" "}
                • {item.severity}/5
              </Text>
              <Text style={{ marginTop: 4 }}>
                {new Date(item.createdAt).toLocaleString("cs-CZ")}
              </Text>
              <Text style={{ marginTop: 4 }}>photos: {item.photosCount}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
});
