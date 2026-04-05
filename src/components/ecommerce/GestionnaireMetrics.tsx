// src/components/ecommerce/GestionnaireMetrics.tsx
import { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import api from "../../api/axios";

interface CaisseStats {
  wilaya?: string;
  solde_actuel: number;
  total_encaissements: number;
  total_alimentations: number;
  total_decaissements: number;
}

export default function GestionnaireMetrics() {
  const [stats, setStats] = useState<CaisseStats>({
    solde_actuel: 0,
    total_encaissements: 0,
    total_alimentations: 0,
    total_decaissements: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // استخدام الـ route الخاصة بالـ gestionnaire
        const response = await api.get("/caisse");

        if (response.data.status === 200 && response.data.data) {
          const data = response.data.data;

          setStats({
            wilaya: data.wilaya || "غير محدد",
            solde_actuel: Number(data.solde_actuel) || 0,
            total_encaissements: Number(data.total_encaissements) || 0,
            total_alimentations: Number(data.total_alimentations) || 0,
            total_decaissements: Number(data.total_decaissements) || 0,
          });
        } else {
          setError(response.data.message || "Aucune caisse trouvée pour votre wilaya.");
        }
      } catch (err: any) {
        console.error("Erreur chargement stats caisse:", err);
        setError("Impossible de charger les statistiques de votre caisse.");
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="h-12 w-12 bg-gray-200 rounded-xl dark:bg-gray-700"></div>
            <div className="mt-5 h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
            <div className="mt-2 h-8 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {/* 1. اسم الولاية */}
      
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/30">
          <BuildingOfficeIcon className="size-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="mt-5">
          <span className="block text-sm text-gray-500 dark:text-gray-400">Wilaya</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
            {stats.wilaya || "Non spécifiée"}
          </h4>
        </div>
      </div>

      {/* 2. الرصيد الحالي */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/30">
          <BanknotesIcon className="size-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="mt-5">
          <span className="block text-sm text-gray-500 dark:text-gray-400">Solde Actuel</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
            {formatCurrency(stats.solde_actuel)}
          </h4>
        </div>
      </div>

      {/* 3. إجمالي الإيرادات */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl dark:bg-emerald-900/30">
          <ArrowTrendingUpIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="mt-5">
          <span className="block text-sm text-gray-500 dark:text-gray-400">Encaissements Totales</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
            {formatCurrency(stats.total_encaissements)}
          </h4>
        </div>
      </div>

      {/* 4. إجمالي المصروفات */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-900/30">
          <ArrowTrendingDownIcon className="size-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="mt-5">
          <span className="block text-sm text-gray-500 dark:text-gray-400">Décaissements Totales</span>
          <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">
            {formatCurrency(stats.total_decaissements)}
          </h4>
        </div>
      </div>
    </div>
  );
}