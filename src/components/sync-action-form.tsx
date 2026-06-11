"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

type SyncActionFormProps = {
  action: (formData: FormData) => void;
  buttonLabel: string;
  pendingLabel: string;
  pendingNotice: string;
};

function SyncSubmitButton({
  buttonLabel,
  pendingLabel,
}: {
  buttonLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      loading={pending}
    >
      {pending ? pendingLabel : buttonLabel}
    </Button>
  );
}

function SyncPendingNotice({ message }: { message: string }) {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <p
      className="mt-2 rounded-inner border border-edge bg-sand-soft px-3 py-2 text-xs font-semibold leading-relaxed text-ink-soft"
      role="status"
      aria-live="polite"
    >
      {message}
    </p>
  );
}

export function SyncActionForm({
  action,
  buttonLabel,
  pendingLabel,
  pendingNotice,
}: SyncActionFormProps) {
  return (
    <form action={action}>
      <SyncSubmitButton
        buttonLabel={buttonLabel}
        pendingLabel={pendingLabel}
      />
      <SyncPendingNotice message={pendingNotice} />
    </form>
  );
}
