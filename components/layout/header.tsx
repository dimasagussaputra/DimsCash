import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <Image
          src="/DimsCash.jpg"
          alt="DimsCash Logo"
          width={32}
          height={32}
          className="size-8 rounded-full object-cover ring-1 ring-primary/40"
        />
        <span className="font-bold tracking-tight">DimsCash</span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
      </div>
    </header>
  );
}
