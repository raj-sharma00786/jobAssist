"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, MessageSquareText } from "lucide-react";

export interface DashboardNotification {
  id: string;
  kind: "Hackathon" | "Interview";
  title: string;
  body: string;
  href: string;
}

export default function NotificationMenu({
  notifications,
}: {
  notifications: DashboardNotification[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasNotifications = notifications.length > 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant bg-surface text-body transition-colors hover:bg-surface-container hover:text-display"
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-[18px] w-[18px]" />
        {hasNotifications ? (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface" />
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-xl">
          <div className="border-b border-outline-variant/70 px-4 py-3">
            <p className="text-sm font-bold text-display">Notifications</p>
            <p className="mt-0.5 text-xs text-body">
              Hackathons and interview experience updates
            </p>
          </div>

          {hasNotifications ? (
            <div className="max-h-80 overflow-y-auto py-1">
              {notifications.map((notification) => {
                const Icon =
                  notification.kind === "Hackathon"
                    ? CalendarDays
                    : MessageSquareText;

                return (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-container"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                        {notification.kind}
                      </span>
                      <span className="mt-0.5 block truncate text-sm font-semibold text-display">
                        {notification.title}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-body">
                        {notification.body}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-semibold text-display">
                No new updates
              </p>
              <p className="mt-1 text-xs leading-relaxed text-body">
                New hackathons and interview archives will show here when they
                are published.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
