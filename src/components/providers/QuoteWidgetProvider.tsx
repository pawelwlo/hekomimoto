"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type QuoteWidgetContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const QuoteWidgetContext = createContext<QuoteWidgetContextValue | null>(null);

export function QuoteWidgetProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <QuoteWidgetContext.Provider value={value}>
      {children}
    </QuoteWidgetContext.Provider>
  );
}

export function useQuoteWidget() {
  const ctx = useContext(QuoteWidgetContext);
  if (!ctx) {
    throw new Error("useQuoteWidget must be used within QuoteWidgetProvider");
  }
  return ctx;
}
