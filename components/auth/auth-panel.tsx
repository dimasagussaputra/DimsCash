import Image from "next/image";

interface AuthPanelProps {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Soft neumorphic panel shared by the login and register forms:
 * logo pressed into a socket, heading, form slot, footer link slot.
 */
export function AuthPanel({
  title,
  description,
  footer,
  children,
}: AuthPanelProps) {
  return (
    <section className="nm-raised animate-fade-up rounded-3xl border border-border bg-card p-6 sm:p-8">
      <header className="text-center">
        <span className="nm-inset mx-auto flex size-16 items-center justify-center rounded-full bg-background p-2.5">
          <Image
            src="/DimsCash.jpg"
            alt="DimsCash Logo"
            width={56}
            height={56}
            className="size-full rounded-full object-cover ring-1 ring-primary/40"
            priority
          />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </header>

      <div className="mt-6">{children}</div>

      {footer && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </section>
  );
}
