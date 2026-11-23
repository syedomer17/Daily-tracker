import { create } from "zustand";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? 3500,
    };

    set((state) => ({
      // Keep at most 4 toasts visible simultaneously
      toasts: [...state.toasts.slice(-3), newToast],
    }));

    // Auto dismiss
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, newToast.duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "success", title, description, duration }),
  error: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "error", title, description, duration }),
  info: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "info", title, description, duration }),
  warning: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "warning", title, description, duration }),
};
