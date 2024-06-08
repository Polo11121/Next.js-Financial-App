"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NavButton } from "@/components/nav-button";
import { useMedia } from "react-use";
import { Menu } from "lucide-react";

const ROUTES = [
  {
    href: "/",
    label: "Overview",
  },
  {
    href: "/transactions",
    label: "Transactions",
  },
  {
    href: "/accounts",
    label: "Accounts",
  },
  {
    href: "/categories",
    label: "Categories",
  },
  {
    href: "/settings",
    label: "Settings",
  },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMedia("(max-width: 1024px", false);
  const pathname = usePathname();
  const router = useRouter();

  const clickHandler = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return isMobile ? (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <Button
          variant="outline"
          size="sm"
          className="font-normal bg-white/10 hover:bg-white/20 hover:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent focus:bg-white/20 outline-none text-white transition"
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="px-2">
        <nav className="flex flex-col gap-y-2 pt-6">
          {ROUTES.map(({ href, label }) => {
            const isActive = pathname === href;
            const navigateHandler = () => clickHandler(href);

            return (
              <Button
                key={href}
                variant={isActive ? "secondary" : "ghost"}
                onClick={navigateHandler}
                className="w-full justify-start"
              >
                {label}
              </Button>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  ) : (
    <nav>
      <ul className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
        {ROUTES.map(({ href, label }) => (
          <li key={href}>
            <NavButton href={href} label={label} isActive={pathname === href} />
          </li>
        ))}
      </ul>
    </nav>
  );
};
