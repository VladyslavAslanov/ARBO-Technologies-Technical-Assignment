import React from "react";
import { SessionStore } from "../stores/sessionStore";
import { RecordsStore } from "../stores/recordsStore";

export class RootStore {
  sessionStore = new SessionStore();
  recordsStore = new RecordsStore();
}

export const rootStore = new RootStore();
export const StoresContext = React.createContext(rootStore);
export const useStores = () => React.useContext(StoresContext);
