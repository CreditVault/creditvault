import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildNotifications, readIds, unreadCount } from "@/lib/notifications";

export function NotificationBell() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1);
    window.addEventListener("creditvault:notif", onChange);
    window.addEventListener("creditvault:applications", onChange);
    return () => {
      window.removeEventListener("creditvault:notif", onChange);
      window.removeEventListener("creditvault:applications", onChange);
    };
  }, []);

  const count = useMemo(() => {
    // depend on tick to recompute
    void tick;
    if (typeof window === "undefined") return 0;
    try {
      const list = buildNotifications();
      // Only count items the user hasn't seen yet
      const read = readIds();
      return list.filter((n) => !read.has(n.id)).length;
    } catch {
      return 0;
    }
  }, [tick]);

  return (
    <Link
      to="/notifications"
      aria-label={`Notifications${count ? ` (${count} unread)` : ""}`}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition hover:border-white/20 hover:text-foreground"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-semibold text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
