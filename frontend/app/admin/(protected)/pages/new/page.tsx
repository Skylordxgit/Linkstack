"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createPage } from "@/services/pages";
import { listTemplates, type TemplateSummary } from "@/services/admin";
import { slugify, isValidSlug, isReservedSlug } from "@/lib/slug";

const schema = z.object({
  name: z.string().min(1, "Internal name is required"),
  title: z.string().min(1, "Public title is required"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(64)
    .refine(isValidSlug, "Lowercase letters, numbers, hyphens or underscores only")
    .refine((s) => !isReservedSlug(s), "This slug is reserved"),
  template: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewPagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { template: "blank" } });

  const name = watch("name");
  const slug = watch("slug");

  useEffect(() => {
    if (!slugTouched && name) setValue("slug", slugify(name));
  }, [name, slugTouched, setValue]);

  useEffect(() => {
    listTemplates().then((res) => setTemplates(res.builtIn));
  }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const page = await createPage(values);
      toast({ title: "Page created", description: `"${page.name}" is ready to customize.` });
      router.push(`/admin/pages/${page.id}/edit`);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Could not create page", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <Link href="/admin/pages" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Pages
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Create Page</h1>
        <p className="text-sm text-muted-foreground">Set up a new public link page.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>Page details</CardTitle>
            <CardDescription>You can change all of this later in the editor.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Internal Name</Label>
                <Input placeholder="Baji Main" {...register("name")} />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Public Title</Label>
                <Input placeholder="Baji Affiliate" {...register("title")} />
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Slug</Label>
                <Input
                  placeholder="baji"
                  {...register("slug")}
                  onChangeCapture={() => setSlugTouched(true)}
                />
                <p className="truncate text-xs text-muted-foreground">
                  {siteUrl}/{slug || "your-slug"}
                </p>
                {errors.slug && <p className="text-xs text-red-400">{errors.slug.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Template</Label>
                <Select defaultValue="blank" onValueChange={(v) => setValue("template", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a starting point" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={submitting} className="mt-2 h-11">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Page
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
