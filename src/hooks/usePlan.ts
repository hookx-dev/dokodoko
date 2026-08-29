"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlan, SubscriptionStatus } from "@/lib/firebase/firestore";

interface PlanState {
  plan: UserPlan;
  subscriptionStatus: SubscriptionStatus | null;
  loading: boolean;
}

export function usePlan(): PlanState {
  const { user } = useAuth();
  const [state, setState] = useState<PlanState>({
    plan: "free",
    subscriptionStatus: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState({ plan: "free", subscriptionStatus: null, loading: false });
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      const data = snap.data();
      const subscriptionStatus = (data?.subscriptionStatus as SubscriptionStatus) || null;
      const plan: UserPlan = data?.plan === "premium" && subscriptionStatus === "active" ? "premium" : "free";
      setState({ plan, subscriptionStatus, loading: false });
    });

    return () => unsubscribe();
  }, [user]);

  return state;
}
