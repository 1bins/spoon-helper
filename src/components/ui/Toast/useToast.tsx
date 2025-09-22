'use client';

import { useContext } from "react";
import { ToastContext } from "./ToastContext";

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if(!ctx) throw new Error("ToastProvider 내부에서만 useToast 사용이 가능합니다");
  return ctx;
}