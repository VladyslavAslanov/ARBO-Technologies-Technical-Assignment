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

export const RecordsScreen = observer(() => {
  const { t } = useTranslation(["screens", "common"]);
  const { sessionStore, recordsStore } = useStores();

  console.log(sessionStore.deviceId);

  useEffect(() => {
    if (!sessionStore.isReady) return;
    if (!sessionStore.deviceId) return;
    recordsStore.loadFirstPage(sessionStore.deviceId);
  }, [sessionStore.isReady, sessionStore.deviceId]);

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
                {item.defectType} • {item.severity}/5
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
