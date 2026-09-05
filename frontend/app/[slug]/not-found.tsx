import Link from "next/link";
import { Ghost } from "lucide-react";

export default function SlugNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-4 text-center text-white">
      <Ghost className="h-12 w-12 opacity-50" />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-zinc-400">This link doesn&apos;t exist or is no longer available.</p>
      <Link href="/" className="text-sm text-violet-400 hover:underline">
        Go home
      </Link>
    </div>
  );
}
