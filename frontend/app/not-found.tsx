import Link from "next/link";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-4 text-center text-white">
      <Ghost className="h-12 w-12 opacity-50" />
      <h1 className="text-2xl font-semibold">404 — Not found</h1>
      <Link href="/admin" className="text-sm text-violet-400 hover:underline">
        Go to admin
      </Link>
    </div>
  );
}
