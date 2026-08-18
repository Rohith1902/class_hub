import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      {/* Animated 404 */}
      <div className="relative mb-8">
        <p className="text-[9rem] font-black font-heading leading-none text-muted/60 select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Search className="w-9 h-9 text-primary" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold font-heading mb-3">Page not found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline" className="rounded-xl gap-2">
            <Home className="w-4 h-4" /> Go Home
          </Button>
        </Link>
        <Link href="/search">
          <Button className="rounded-xl gap-2">
            <Search className="w-4 h-4" /> Find a Tutor
          </Button>
        </Link>
      </div>
    </div>
  );
}
