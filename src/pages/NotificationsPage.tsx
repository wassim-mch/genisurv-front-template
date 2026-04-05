// src/pages/Notifications.tsx
import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import Button from "../components/ui/button/Button";
import Badge from "../components/ui/badge/Badge";
import api from "../api/axios";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Notification {
  id: number;
  title: string | null;
  message: string | null;
  type: string; // "encaissement", "decaissement", "alimentation", ...
  action_type: string | null;
  target_id: number | null;
  target_type: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/notifications"); // ou /notifications/unread si tu veux filtrer
      const data = res.data.notifications || [];

      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
    } catch (err: any) {
      console.error(err);
      setError("Impossible de charger les notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Erreur mark as read", err);
    }
  };

  const markAllAsRead = async () => {
    if (!unreadCount) return;
    setMarkingAll(true);
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Erreur mark all", err);
      setError("Impossible de marquer toutes les notifications comme lues.");
    } finally {
      setMarkingAll(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "encaissement":   return "success";
      case "decaissement":   return "error";
      case "alimentation":   return "primary";
      default:               return "gray";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "encaissement":
        return "💰";
      case "decaissement":
        return "📤";
      case "alimentation":
        return "📥";
      default:
        return "🔔";
    }
  };

  return (
    <>
      <PageMeta
        title="Notifications"
        description="Consultez toutes vos notifications système"
      />
      <PageBreadcrumb pageTitle="Notifications" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Notifications
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {unreadCount > 0
                ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                : "Aucune notification non lue"}
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={markAllAsRead}
              disabled={markingAll}
            >
              {markingAll ? "En cours..." : "Tout marquer comme lu"}
            </Button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <span className="text-3xl">🔔</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Aucune notification pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  notif.is_read
                    ? "bg-gray-50/50 dark:bg-white/5 border-gray-200 dark:border-gray-800"
                    : "bg-white dark:bg-white/10 border-brand-200 dark:border-brand-800 shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icône + badge statut */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${
                        notif.type === "encaissement"
                          ? "bg-green-500"
                          : notif.type === "decaissement"
                          ? "bg-red-500"
                          : notif.type === "alimentation"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {getTypeIcon(notif.type)}
                    </div>

                    {!notif.is_read && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-medium text-gray-900 dark:text-white/90 truncate">
                        {notif.title || notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                      </h4>

                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notif.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {notif.message}
                    </p>

                    <div className="mt-2">
                      <Badge size="sm" color={getTypeBadgeColor(notif.type)}>
                        {notif.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}