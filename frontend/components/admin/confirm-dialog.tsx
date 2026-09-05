"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
}

export function useConfirm() {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      setState({ options, resolve });
    });

  const handle = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  const dialog = state ? (
    <Dialog open onOpenChange={(open) => !open && handle(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{state.options.title}</DialogTitle>
          <DialogDescription>{state.options.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => handle(false)}>
            Cancel
          </Button>
          <Button variant={state.options.destructive ? "destructive" : "default"} onClick={() => handle(true)}>
            {state.options.confirmLabel ?? "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;

  return { confirm, ConfirmDialog: () => dialog };
}
