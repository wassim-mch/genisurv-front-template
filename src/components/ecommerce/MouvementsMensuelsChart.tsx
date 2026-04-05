// MouvementsMensuelsChart.tsx
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import { MoreDotIcon } from "../../icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import api from "../../api/axios";

interface MonthlyData {
  month: string;
  encaissements: number;
  decaissements: number;
  alimentations: number;
}

export default function MouvementsMensuelsChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchMonthly = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/admin/stats/mensuel");

        // ────────────────────────────────────────────────
        // Débogage très important ici
        console.log("Réponse brute API:", res);
        console.log("res.data:", res.data);
        console.log("Type de res.data:", typeof res.data);
        console.log("res.data est Array?", Array.isArray(res.data));
        // ────────────────────────────────────────────────

        // Protection contre les formats inattendus
        let monthlyData: MonthlyData[] = [];

        if (Array.isArray(res.data)) {
          monthlyData = res.data;
        } else if (res.data && Array.isArray(res.data.data)) {
          monthlyData = res.data.data;
        } else if (res.data?.monthly) {
          monthlyData = res.data.monthly;
        }

        if (mounted) {
          setData(monthlyData);
        }
      } catch (err: any) {
        console.error("Erreur chargement stats mensuelles:", err);
        if (mounted) {
          setError(
            err.response?.data?.message ||
            "Impossible de charger les données mensuelles"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMonthly();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  // Valeurs par défaut si pas de données
  const months = data.length > 0
    ? data.map(d => d.month)
    : ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

  const encaissements = data.length > 0
    ? data.map(d => d.encaissements || 0)
    : new Array(12).fill(0);

  const decaissements = data.length > 0
    ? data.map(d => d.decaissements || 0)
    : new Array(12).fill(0);

  const alimentations = data.length > 0
    ? data.map(d => d.alimentations || 0)
    : new Array(12).fill(0);

  const options: ApexOptions = {
    colors: ["#10B981", "#EF4444", "#3B82F6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 6,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: "Montant (DZD)" },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${new Intl.NumberFormat("fr-DZ").format(val)} DZD`,
      },
    },
  };

  const series = [
    { name: "Encaissements", data: encaissements },
    { name: "Décaissements", data: decaissements },
    { name: "Alimentations", data: alimentations },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pt-5 pb-6 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Mouvements mensuels
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Encaissements, décaissements et alimentations par mois
            </p>
          </div>

          
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : data.length === 0 && !error ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            Aucune donnée disponible pour le moment
          </div>
        ) : (
          <Chart options={options} series={series} type="bar" height={350} />
        )}
      </div>
    </div>
  );
}