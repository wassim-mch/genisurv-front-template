import { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BuildingOfficeIcon,    // pour les wilayas / caisses
  UsersIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline"; // ou tes propres icons
import api from "../../api/axios";

interface DashboardStats {
  total_wilayas: number;
  total_caisses: number;
  total_solde: number;
  total_users: number;
  variation_solde?: number;   // % par rapport au mois dernier (optionnel)
}

export default function WilayaMetrics() {
  const [stats, setStats] = useState<DashboardStats>({
    total_wilayas: 0,
    total_caisses: 0,
    total_solde: 0,
    total_users: 0,
    variation_solde: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Route API à créer (voir plus bas)
        const response = await api.get("/admin/stats/dashboard");

        setStats(response.data || {
          total_wilayas: 0,
          total_caisses: 0,
          total_solde: 0,
          total_users: 0,
        });
      } catch (err: any) {
        console.error("Erreur chargement stats dashboard:", err);
        setError("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 0,
    }).format(amount);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 animate-pulse dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="h-12 w-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
            <div className="mt-5 h-4 bg-gray-200 rounded w-24 dark:bg-gray-700"></div>
            <div className="mt-2 h-6 bg-gray-200 rounded w-32 dark:bg-gray-700"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {/* 1. Nombre de wilayas */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
          <BuildingOfficeIcon className="size-6 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="block text-sm text-gray-500 dark:text-gray-400">
              Wilayas gérées
            </span>
            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
              {stats.total_wilayas}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon className="size-3.5" />
            Actives
          </Badge>
        </div>
      </div>

      {/* 2. Nombre de caisses */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
          <BuildingOfficeIcon className="size-6 text-green-600 dark:text-green-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="block text-sm text-gray-500 dark:text-gray-400">
              Caisses actives
            </span>
            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
              {stats.total_caisses}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon className="size-3.5" />
            Opérationnelles
          </Badge>
        </div>
      </div>

      {/* 3. Solde total */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/30">
          <BanknotesIcon className="size-6 text-purple-600 dark:text-purple-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="block text-sm text-gray-500 dark:text-gray-400">
              Solde global
            </span>
            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
              {formatCurrency(stats.total_solde)}
            </h4>
          </div>
          {stats.variation_solde !== undefined && (
            <Badge color={stats.variation_solde >= 0 ? "success" : "error"}>
              {stats.variation_solde >= 0 ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />}
              {Math.abs(stats.variation_solde)}%
            </Badge>
          )}
        </div>
      </div>

      {/* 4. Nombre d'utilisateurs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl dark:bg-amber-900/30">
          <UsersIcon className="size-6 text-amber-600 dark:text-amber-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="block text-sm text-gray-500 dark:text-gray-400">
              Utilisateurs
            </span>
            <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
              {stats.total_users}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon className="size-3.5" />
            Inscrits
          </Badge>
        </div>
      </div>
    </div>
  );
}