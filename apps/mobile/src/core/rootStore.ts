import React from "react";
import { SessionStore } from "../stores/sessionStore";
import { RecordsStore } from "../stores/recordsStore";
import { DefectTypesStore } from "../stores/defectTypesStore";

export class RootStore {
  sessionStore = new SessionStore();
  recordsStore = new RecordsStore();
  defectTypesStore = new DefectTypesStore();
}

export const rootStore = new RootStore();
export const StoresContext = React.createContext(rootStore);
export const useStores = () => React.useContext(StoresContext);
