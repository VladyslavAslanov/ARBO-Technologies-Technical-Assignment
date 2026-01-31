import "./src/i18n";

import React, { useEffect } from "react";
import { StoresContext, rootStore } from "./src/core/rootStore";
import { RecordsScreen } from "./src/screens/RecordsScreen";

export default function App() {
  useEffect(() => {
    rootStore.sessionStore.init();
  }, []);

  return (
    <StoresContext.Provider value={rootStore}>
      <RecordsScreen />
    </StoresContext.Provider>
  );
}
