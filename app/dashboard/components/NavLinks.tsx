"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Layers,
  BookOpen,
  FileText,
  MessageSquare,
  Trophy,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "Problem Bank", href: "/dashboard/problem-bank", icon: Layers },
  { label: "Hackathons", href: "/dashboard/hackathons", icon: Trophy },
  { label: "Archives", href: "/dashboard/archives", icon: BookOpen },
  { label: "Resume ATS", href: "/dashboard/resume-ats", icon: FileText },
  { label: "STAR Mock", href: "/dashboard/mock", icon: MessageSquare },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex min-w-0 flex-1 items-center justify-evenly gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex min-w-0 flex-1 items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? "bg-surface-container-highest text-display"
                  : "text-body hover:text-display"
              }
            `}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive ? "text-primary" : "text-body"
              }`}
            />
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
