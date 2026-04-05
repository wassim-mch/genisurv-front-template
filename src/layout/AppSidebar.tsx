import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CalenderIcon,
  UserCircleIcon,
  DollarLineIcon,
  LockIcon,
  PieChartIcon,
  BoxCubeIcon,
  PlugInIcon,
  PageIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../hooks/useAuth";

type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  permission?: string | string[];
  children?: NavItem[];
};

const mainNavItems: NavItem[] = [
  { name: "Dashboard", icon: <PieChartIcon />, path: "/"},
  {
    name: "Opérations",
    icon: <DollarLineIcon />,
    permission: ["voir_encaissement", "voir_decaissement"],
    children: [
      { name: "Encaissements", path: "/admin/encaissements", icon: <DollarLineIcon />, permission: "voir_encaissement" },
      { name: "Décaissements", path: "/admin/decaissements", icon: <BoxCubeIcon />, permission: "voir_decaissement" },
    ],
  },
  { name: "Décaissement", icon: <BoxCubeIcon />, path: "/decaissement", permission: "gerer_decaissement" },
  { name: "Encaissement", icon: <DollarLineIcon />, path: "/encaissement", permission: "gerer_encaissement" },
  { name: "Ma Caisse", icon: <CalenderIcon />, path: "/caisse", permission: "voir_caisse" },
  { name: "Utilisateurs", icon: <UserCircleIcon />, path: "/admin/users", permission: "gerer_user" },
  { name: "Rôles", icon: <LockIcon />, path: "/admin/roles", permission: "gerer_role" },
  { name: "Wilayas", icon: <PageIcon />, path: "/admin/wilayas", permission: "gerer_wilaya" },
  { name: "Caisses", icon: <DollarLineIcon />, path: "/admin/caisses", permission: "voir_tous_caisses" },
  { name: "Alimentations", icon: <PlugInIcon />, path: "/admin/alimentations", permission: "gerer_alimentation" },
];


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const permissions = user?.permissions ?? [];

  const hasPermission = (permission?: string | string[]) => {
    if (!permission) return true;
    if (Array.isArray(permission)) return permission.some((p) => permissions.includes(p));
    return permissions.includes(permission);
  };

  const isActive = (path?: string) => path && location.pathname === path;

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const renderMenu = (items: NavItem[]) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav) => {
        if (!hasPermission(nav.permission)) return null;

        // Menu avec enfants
        if (nav.children && nav.children.length > 0) {
          const hasVisibleChild = nav.children.some((child) => hasPermission(child.permission));
          if (!hasVisibleChild) return null;

          const isOpen = openMenus[nav.name];

          return (
            <li key={nav.name}>
              <div
                className="menu-item group flex items-center gap-2 cursor-pointer text-gray-900 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                onClick={() => toggleMenu(nav.name)}
              >
                {nav.icon && <span className="menu-item-icon-size">{nav.icon}</span>}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text font-semibold">{nav.name}</span>
                )}
                {/* Arrow */}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`ml-auto transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}>
                    ▶
                  </span>
                )}
              </div>
              {isOpen && (
                <ul className="ml-6 mt-2 flex flex-col gap-2">
                  {nav.children.map((child) => {
                    if (!hasPermission(child.permission)) return null;
                    return (
                      <li key={child.name}>
                        <Link
                          to={child.path!}
                          className={`menu-item text-gray-800 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 ${
                            isActive(child.path) ? "menu-item-active font-bold" : "menu-item-inactive"
                          }`}
                        >
                          {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{child.name}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        }

        // Menu simple
        return (
          <li key={nav.name}>
            <Link
              to={nav.path!}
              className={`menu-item flex items-center gap-2 text-gray-900 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 ${
                isActive(nav.path) ? "menu-item-active font-bold" : "menu-item-inactive"
              }`}
            >
              {nav.icon && (
                <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : ""}`}>
                  {nav.icon}
                </span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} />
              <img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} />
            </>
          ) : (
            <img src="/images/logo/logo-icon.svg" alt="Logo" width={32} />
          )}
        </Link>
      </div>

      {/* Menu */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <h2 className="mb-4 text-xs uppercase text-gray-400 dark:text-gray-500">
          {isExpanded || isHovered || isMobileOpen ? "Menu" : "..."}
        </h2>
        {renderMenu(mainNavItems)}

        
      </div>
    </aside>
  );
};

export default AppSidebar;