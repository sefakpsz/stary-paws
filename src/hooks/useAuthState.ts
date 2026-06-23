import { createContext, createElement, type ReactNode, useContext, useState } from "react";
import { demoLogin } from "../api/auth";
import type { CreateType } from "../app/types";

type AuthStateContextValue = {
  createType: CreateType | null;
  isAuthenticated: boolean;
  showAuth: boolean;
  showProfile: boolean;
  closeAuth: () => void;
  closeCreate: () => void;
  closeProfile: () => void;
  openAuth: () => void;
  openProfile: () => void;
  requestCreate: (type: CreateType) => void;
  signIn: () => Promise<void>;
  signOut: () => void;
};

const AuthStateContext = createContext<AuthStateContextValue | null>(null);

export function AuthStateProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [createType, setCreateType] = useState<CreateType | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const requestCreate = (type: CreateType) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setCreateType(type);
  };

  const signIn = async () => {
    await demoLogin();
    setAuthenticated(true);
    setShowAuth(false);
  };

  const signOut = () => {
    setAuthenticated(false);
    setShowProfile(false);
  };

  return createElement(
    AuthStateContext.Provider,
    {
      value: {
        createType,
        isAuthenticated,
        showAuth,
        showProfile,
        closeAuth: () => setShowAuth(false),
        closeCreate: () => setCreateType(null),
        closeProfile: () => setShowProfile(false),
        openAuth: () => setShowAuth(true),
        openProfile: () => setShowProfile(true),
        requestCreate,
        signIn,
        signOut,
      },
    },
    children,
  );
}

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error("useAuthState must be used inside AuthStateProvider");
  }

  return context;
}
