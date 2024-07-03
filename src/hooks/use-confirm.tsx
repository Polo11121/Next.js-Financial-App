import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const useConfirm = (
  title: string,
  message: string
): [
  ({ disabled }: { disabled?: boolean }) => JSX.Element,
  () => Promise<unknown>
] => {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = () =>
    new Promise((resolve, _reject) => {
      setPromise({ resolve });
    });

  const closeHandler = () => setPromise(null);

  const confirmHandler = () => {
    promise?.resolve(true);
    closeHandler();
  };

  const cancelHandler = () => {
    promise?.resolve(false);
    closeHandler();
  };

  const ConfirmationDialog = ({ disabled }: { disabled?: boolean }) => (
    <Dialog open={!!promise} onOpenChange={closeHandler}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button onClick={cancelHandler} variant="outline" disabled={disabled}>
            Cancel
          </Button>
          <Button onClick={confirmHandler} disabled={disabled}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};
