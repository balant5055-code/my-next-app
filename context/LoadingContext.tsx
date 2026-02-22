"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface LoadingContextType {
  loading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const startLoading = () => {
    setCount((prev) => prev + 1);
  };

  const stopLoading = () => {
    setCount((prev) => Math.max(prev - 1, 0));
  };

  return (
    <LoadingContext.Provider
      value={{
        loading: count > 0,
        startLoading,
        stopLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useGlobalLoading must be used inside LoadingProvider");
  }
  return context;
}
