import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDeleteDialogProps = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  trigger: React.ReactNode;
};

export default function ConfirmDeleteDialog({
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  trigger,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-black">{title}</AlertDialogTitle>
          {description ? <AlertDialogDescription>{description}</AlertDialogDescription> : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl font-bold">{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className="rounded-xl font-bold"
            onClick={async () => {
              try {
                setLoading(true);
                await onConfirm();
              } finally {
                setLoading(false);
                setOpen(false);
              }
            }}
            disabled={loading}
          >
            {loading ? "Deleting…" : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

