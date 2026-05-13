import { toast as sonnerToast } from "sonner";

export function useToast() {
  const toast = (options: any) => {
    if (typeof options === 'string') {
      return sonnerToast(options);
    }
    // Handle toast object with title and description
    const message = options.title || '';
    const description = options.description || '';
    const fullMessage = description ? `${message}\n${description}` : message;
    return sonnerToast(fullMessage);
  };

  return {
    toast,
    toasts: [] as any[], // Compatibility with old toast system
    dismiss: (toastId?: string | number) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    }
  };
}

export { sonnerToast as toast };
