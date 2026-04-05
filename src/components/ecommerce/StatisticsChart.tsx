// src/components/ecommerce/StatisticsChart.tsx
import { useState, useEffect, useRef } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import { CalenderIcon } from "../../icons";
import api from "../../api/axios";

interface MonthlyStat {
  month: string;              // ex: "Jan", "Fév"
  encaissements: number;
  decaissements: number;
}

export default function StatisticsChart() {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [stats, setStats] = useState<MonthlyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب البيانات الشهرية للصندوق الخاص بالمستخدم (gestionnaire)
  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const caisseId = user?.caisse_id;
        const res = await api.get(`/gestionnaire/stats/monthly/${caisseId}`); 
        const monthlyData = res.data.data || [];

        // تحويل البيانات إلى صيغة مناسبة للرسم
        const formatted = monthlyData.map((item: any) => ({
          month: item.month || "Inconnu",
          encaissements: Number(item.encaissements) || 0,
          decaissements: Number(item.decaissements) || 0,
        }));

        setStats(formatted);
      } catch (err: any) {
        console.error("Erreur chargement stats mensuelles:", err);
        setError("Impossible de charger les statistiques mensuelles.");
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyStats();
  }, []);

  // إعدادات الـ date picker (نفس الكود الأصلي مع تحسينات بسيطة)
  useEffect(() => {
    if (!datePickerRef.current) return;

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 30); // شهر كامل بدل 7 أيام

    flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "d M Y",
      defaultDate: [sevenDaysAgo, today],
      clickOpens: true,
      prevArrow: '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow: '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      onChange: (selectedDates) => {
        // هنا يمكنك إضافة فلترة البيانات حسب التاريخ المختار لاحقًا
        console.log("Date range selected:", selectedDates);
      },
    });
  }, []);

  // إعدادات الرسم البياني (محسنة للـ gestionnaire)
  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit, sans-serif",
      labels: {
        colors: "#6B7280", // gray-500 light
      },
    },
    colors: ["#10B981", "#EF4444"], // أخضر للإيرادات، أحمر للمصروفات
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 340,
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    stroke: {
      curve: "smooth",
      width: [3, 3],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 0,
      hover: { size: 6 },
    },
    grid: {
      borderColor: "#e5e7eb", // light mode
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${new Intl.NumberFormat("fr-DZ").format(val)} DZD`,
      },
    },
    xaxis: {
      type: "category",
      categories: stats.length > 0 ? stats.map(s => s.month) : ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280",
          fontSize: "12px",
        },
        formatter: (val: number) => `${val / 1000}k`,
      },
    },
  };

  const series = [
    {
      name: "Encaissements",
      data: stats.map(s => s.encaissements),
    },
    {
      name: "Décaissements",
      data: stats.map(s => s.decaissements),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-6 pt-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/40 md:px-6 md:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mouvements financiers de votre caisse
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Encaissements et décaissements sur les 12 derniers mois
          </p>
        </div>

        <div className="relative inline-flex items-center">
          <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
          <input
            ref={datePickerRef}
            className="h-10 w-40 rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-brand-500 dark:focus:ring-brand-500/30"
            placeholder="Sélectionnez une période"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="py-16 text-center text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : stats.length === 0 ? (
        <div className="py-16 text-center text-gray-500 dark:text-gray-400">
          Aucune donnée disponible pour votre caisse ce mois-ci
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="min-w-[800px] xl:min-w-full">
            <Chart options={options} series={series} type="area" height={340} />
          </div>
        </div>
      )}
    </div>
  );
}