"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/auth";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      const next = params.get("next") || "/admin";
      router.replace(next);
      router.refresh();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login failed", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="glass-panel w-full max-w-sm rounded-2xl p-8 [--glass-opacity:0.1] [--glass-blur:24px] [--glass-border-opacity:0.25]"
    >
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold">Admin Sign In</h1>
        <p className="text-sm text-muted-foreground">Private dashboard access only</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" className="pl-9" {...register("email")} />
          </div>
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="pl-9"
              {...register("password")}
            />
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        <Button type="submit" disabled={submitting} className="mt-2 h-11">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
        </Button>
      </form>
    </motion.div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-aurora p-4 [--c1:#0ea5e9] [--c2:#8b5cf6] [--c3:#22d3ee]">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
