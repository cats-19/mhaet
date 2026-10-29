import { useEffect, useState } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  category: "checkin" | "appointment" | "supplement" | "health";
  read: boolean;
  actionUrl?: string;
};

const STORAGE_KEY = "aurelia-notifications-v1";

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Morning check-in ready",
    message: "Take 60 seconds to speak how you're feeling today. Your midwife can review any updates.",
    time: "Today · 8:00 AM",
    category: "checkin",
    read: false,
    actionUrl: "#voice",
  },
  {
    id: "notif-2",
    title: "Midwife appointment reminder",
    message: "Upcoming 3rd ANC appointment scheduled with Dr. Naomi Adeyemi.",
    time: "Yesterday · 4:30 PM",
    category: "appointment",
    read: false,
    actionUrl: "#calendar",
  },
  {
    id: "notif-3",
    title: "Iron supplement reminder",
    message: "Don't forget your daily iron supplement with a glass of water or citrus juice.",
    time: "Yesterday · 8:00 AM",
    category: "supplement",
    read: false,
    actionUrl: "#settings",
  },
  {
    id: "notif-4",
    title: "Week 24 milestone: baby is hearing sounds",
    message: "Your little one's inner ear is fully formed now and can hear the cadence of your voice.",
    time: "2 days ago",
    category: "health",
    read: true,
  },
  {
    id: "notif-5",
    title: "Previous check-in summary compiled",
    message: "Your monthly check-in entries were compiled into the latest ANC report.",
    time: "3 days ago",
    category: "appointment",
    read: true,
    actionUrl: "#reports",
  },
];

function loadStoredNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return INITIAL_NOTIFICATIONS;
}

function saveStoredNotifications(items: NotificationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent("aurelia-notifications-change", { detail: items }));
}

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>(loadStoredNotifications);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<NotificationItem[]>).detail;
      if (detail) setItems(detail);
    };
    window.addEventListener("aurelia-notifications-change", handler);
    return () => window.removeEventListener("aurelia-notifications-change", handler);
  }, []);

  const markAllRead = () => {
    const updated = items.map((n) => ({ ...n, read: true }));
    setItems(updated);
    saveStoredNotifications(updated);
  };

  const markSingleRead = (id: string) => {
    const updated = items.map((n) => (n.id === id ? { ...n, read: true } : n));
    setItems(updated);
    saveStoredNotifications(updated);
  };

  const markSingleUnread = (id: string) => {
    const updated = items.map((n) => (n.id === id ? { ...n, read: false } : n));
    setItems(updated);
    saveStoredNotifications(updated);
  };

  const unreadCount = items.filter((n) => !n.read).length;

  return {
    items,
    unreadCount,
    markAllRead,
    markSingleRead,
    markSingleUnread,
  };
}
