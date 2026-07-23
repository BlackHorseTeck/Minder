"use client";

import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Home
      </Link>
      <Link
        href="/about"
        className={cn("text-sm font-medium text-muted-foreground transition-colors hover:text-primary", pathname === "/about" && "text-primary")}
      >
        About
      </Link>
      <Link
        href="/pricing"
        className={cn("text-sm font-medium text-muted-foreground transition-colors hover:text-primary", pathname === "/pricing" && "text-primary")}
      >
        Pricing
      </Link>
      <Link
        href="/guide"
        className={cn("text-sm font-medium text-muted-foreground transition-colors hover:text-primary", pathname === "/guide" && "text-primary")}
      >
        Guide
      </Link>
    </nav>
  )
}
