"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  reloadUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      // プロトタイプを維持したまま新しいオブジェクト参照を作成してReactに再描画させる
      const updatedUser = Object.assign(Object.create(Object.getPrototypeOf(auth.currentUser)), auth.currentUser);
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
