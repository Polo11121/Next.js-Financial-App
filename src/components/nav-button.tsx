import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavButtonProps = {
  href: string;
  label: string;
  isActive: boolean;
};

export const NavButton = ({ href, isActive, label }: NavButtonProps) => (
  <Button
    asChild
    size="sm"
    variant="outline"
    className={cn(
      "w-full lg:w-auto justify-between font-normal hover:text-white hover:bg-white/20 border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/20 transition",
      isActive ? "bg-white/10 text		-white" : "bg-transparent"
    )}
  >
    <Link href={href}>{label}</Link>
  </Button>
);
