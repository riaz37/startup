"use client";

import { PageLoading } from "@/components/ui/global-loading";
import { useEffect, useState } from "react";

const loadingMessages = [
  "Loading your Sohozdaam experience...",
  "Preparing amazing group deals for you...",
  "Connecting you with group orders...",
  "Finding the best bulk prices...",
  "Setting up your savings dashboard...",
  "Loading fresh products and deals...",
  "Preparing your group shopping experience...",
];

export default function Loading() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return <PageLoading message={loadingMessages[messageIndex]} />;
}
