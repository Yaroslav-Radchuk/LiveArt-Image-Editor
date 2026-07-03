import { ref } from 'vue';

export const ToastVariant = {
  Success: 'success',
  Error: 'error',
  Info: 'info',
} as const;

export type ToastVariant = (typeof ToastVariant)[keyof typeof ToastVariant];

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  action?: ToastAction;
}

const TOAST_DURATION_MS = 4500;

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  function show(message: string, variant: ToastVariant = ToastVariant.Info, action?: ToastAction) {
    const id = nextId;
    nextId += 1;
    toasts.value = [
      ...toasts.value,
      {
        id,
        message,
        variant,
        action,
      },
    ];

    setTimeout(() => {
      dismiss(id);
    }, TOAST_DURATION_MS);
  }

  function runAction(toast: Toast) {
    toast.action?.handler();
    dismiss(toast.id);
  }

  return {
    toasts,
    show,
    dismiss,
    runAction,
  };
}
