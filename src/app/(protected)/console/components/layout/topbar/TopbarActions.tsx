"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TopbarContextType {
  actions: React.ReactNode;
  setActions: (actions: React.ReactNode) => void;
}

const TopbarContext = createContext<TopbarContextType>({
  actions: null,
  setActions: () => {},
});

export function TopbarProvider({ children }: { children: React.ReactNode }) {
  const [actions, setActions] = useState<React.ReactNode>(null);

  return (
    <TopbarContext.Provider value={{ actions, setActions }}>
      {children}
    </TopbarContext.Provider>
  );
}

export function useTopbar() {
  return useContext(TopbarContext);
}

export function TopbarActions({ children }: { children: React.ReactNode }) {
  const { setActions } = useTopbar();

  useEffect(() => {
    setActions(children);
    return () => {
      setActions(null);
    };
  }, [children, setActions]);

  return null;
}