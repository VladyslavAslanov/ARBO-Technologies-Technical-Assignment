import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  RefreshControl,
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

export const RecordsScreen = observer(() => {
  const { t } = useTranslation(["screens", "common", "defects"]);
  const { sessionStore, recordsStore } = useStores();

  console.log(sessionStore.deviceId);

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
  const empty = !recordsStore.loading && recordsStore.items.length === 0;

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

      {empty ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text>{t("screens:records.empty")}</Text>
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
