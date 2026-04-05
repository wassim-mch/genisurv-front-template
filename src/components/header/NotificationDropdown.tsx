import { useState, useEffect, useRef } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router-dom";
import api from "../../api/axios";

interface Notification {
  id: number;
  title: string | null;
  message: string | null;
  type: string;
  action_type: string | null;
  target_id: number | null;
  target_type: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };

  // جلب الإشعارات
  const fetchNotifications = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      const response = await api.get("/notifications");
      const newNotifications = response.data.notifications || [];

      // إذا كان هناك إشعارات جديدة
      if (newNotifications.length > notifications.length) {
        setNotifications(newNotifications);
        setNotifying(true);           // إظهار النقطة البرتقالية
      } else if (isInitial) {
        setNotifications(newNotifications);
      }

    } catch (err) {
      console.error("Erreur chargement notifications", err);
    } finally {
      if (isInitial) setLoading(false);
      setLastFetchTime(new Date());
    }
  };

  // Polling كل 8 ثواني
  useEffect(() => {
    fetchNotifications(true); // الجلب الأولي

    intervalRef.current = setInterval(() => {
      fetchNotifications(false); // تحديث بدون تحميل
    }, 8000); // 8 ثواني (يمكنك تغييرها إلى 5000 أو 10000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // لا نضع dependencies لأننا نريد polling مستمر

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} h${diffH > 1 ? "s" : ""}`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const getNotificationIcon = (type: string, isRead: boolean) => {
    const baseClass = `w-10 h-10 rounded-full flex items-center justify-center text-white ${
      isRead ? "opacity-60" : "opacity-100"
    }`;

    switch (type.toLowerCase()) {
      case "encaissement":
        return (
          <div className={`${baseClass} bg-green-500`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "decaissement":
        return (
          <div className={`${baseClass} bg-red-500`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a5 5 0 00-10 0v2m-2 4h14a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z" />
            </svg>
          </div>
        );
      case "alimentation":
        return (
          <div className={`${baseClass} bg-blue-500`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${baseClass} bg-gray-500`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Notifications
          </h5>
          <button
            onClick={closeDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-500 dark:text-gray-400">
            Aucune notification
          </div>
        ) : (
          <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
            {notifications.map((notif) => (
              <li key={notif.id}>
                <DropdownItem
                  onItemClick={closeDropdown}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <span className="relative block w-10 h-10 rounded-full overflow-hidden">
                    {getNotificationIcon(notif.type, notif.is_read)}
                  </span>

                  <span className="block flex-1">
                    <span className="mb-1.5 block text-theme-sm text-gray-500 dark:text-gray-400 space-x-1">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {notif.title || notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}
                      </span>
                      <span className="block mt-1">{notif.message || "Action effectuée"}</span>
                    </span>

                    <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span>{notif.type}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{formatTimeAgo(notif.created_at)}</span>
                    </span>
                  </span>
                </DropdownItem>
              </li>
            ))}
          </ul>
        )}

        <Link
          to="/notifications"
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Voir toutes les notifications
        </Link>
      </Dropdown>
    </div>
  );
}