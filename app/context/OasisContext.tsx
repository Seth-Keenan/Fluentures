"use client";

import React, { createContext, useContext, useState } from "react";

type OasisContextType = {
  oasisId: string | null;
  setOasisId: (id: string | null) => void;
};

const OasisContext = createContext<OasisContextType | undefined>(undefined);

export function OasisProvider({ children }: { children: React.ReactNode }) {
  const [oasisId, setOasisId] = useState<string | null>(null);

  return (
    <OasisContext.Provider value={{ oasisId, setOasisId }}>
      {children}
    </OasisContext.Provider>
  );
}

export function useOasis() {
  const context = useContext(OasisContext);
  if (!context) {
    throw new Error("useOasis must be used within an OasisProvider");
  }
  return context;
}
