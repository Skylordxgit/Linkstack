"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { duplicatePage } from "@/services/pages";
import { slugify } from "@/lib/slug";
import type { Page } from "@/types";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, "Lowercase letters, numbers, hyphens or underscores only"),
});
type FormValues = z.infer<typeof schema>;

export function DuplicateDialog({
  page,
  onClose,
  onDuplicated,
}: {
  page: Page;
  onClose: () => void;
  onDuplicated: () => void;
}) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: `${page.name} Copy`, slug: slugify(`${page.slug}-copy`) },
  });

  const nameValue = watch("name");
  useEffect(() => {
    setValue("slug", slugify(nameValue || ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await duplicatePage(page.id, values);
      toast({ title: "Page duplicated" });
      onDuplicated();
      onClose();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Duplicate failed", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate page</DialogTitle>
          <DialogDescription>
            Copies profile, blocks, links, socials, appearance, background and SEO. Analytics are not copied.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>New Name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>New Slug</Label>
            <Input {...register("slug")} />
            {errors.slug && <p className="text-xs text-red-400">{errors.slug.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Duplicate
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
