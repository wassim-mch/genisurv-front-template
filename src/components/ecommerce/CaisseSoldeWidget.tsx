// src/components/dashboard/CaisseSoldeWidget.tsx
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect } from "react";
import api from "../../api/axios";

interface CaisseData {
  id: number;
  wilaya?: string;
  solde_actuel: number;
}

export default function CaisseSoldeWidget() {
  const [caisse, setCaisse] = useState<CaisseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // الهدف الشهري (يمكنك جعله ديناميكيًا لاحقًا)
  const TARGET = 5000000; // 5 ملايين دج كمثال

  useEffect(() => {
    const fetchCaisse = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/caisse");

        if (res.data.status === 200 && res.data.data) {
          setCaisse(res.data.data);
        } else {
          setError(res.data.message || "Aucune caisse trouvée pour votre wilaya.");
        }
      } catch (err: any) {
        console.error("Erreur chargement caisse:", err);
        setError(
          err.response?.data?.message ||
          "Impossible de charger les informations de votre caisse."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCaisse();
  }, []);

  const solde = caisse?.solde_actuel || 0;
  const percentage = TARGET > 0 ? Math.min(Math.round((solde / TARGET) * 100), 100) : 0;

  const options: ApexOptions = {
    colors: ["#10B981"], // vert succès
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 340, // ارتفاع أكبر قليلاً لإعطاء مساحة داخلية
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "65%", // حجم الفراغ الداخلي أصغر → المبلغ يبدو داخل الدائرة بشكل أفضل
          margin: 15,
          background: "transparent",
        },
        track: {
          background: "#e5e7eb", // light mode
          strokeWidth: "100%",
          margin: 8, // تباعد داخلي أكبر
          opacity: 0.4,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "0px", // نُخفي القيمة الافتراضية لأننا سنعرضها يدويًا
            offsetY: 0,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        shadeIntensity: 0.5,
        gradientToColors: ["#059669"],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: { lineCap: "round" },
    labels: ["Progression"],
  };

  const series = [percentage];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50">
      {/* العنوان */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Solde de votre caisse
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {caisse?.wilaya ? `Wilaya : ${caisse.wilaya}` : "Wilaya actuelle"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="py-16 text-center text-red-600 dark:text-red-400 text-lg">
          {error}
        </div>
      ) : (
        <div className="relative h-[340px] flex items-center justify-center">
          {/* الرسم البياني */}
          <Chart options={options} series={series} type="radialBar" height={340} />

          {/* المبلغ داخل الدائرة مع تباعد جيد */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {new Intl.NumberFormat("fr-DZ").format(solde)}
            </span>
            <span className="mt-3 text-xl font-medium text-gray-600 dark:text-gray-300">
              DZD
            </span>
            <div className="mt-6 px-5 py-2 rounded-full bg-green-50/80 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/40">
              {percentage}% de l'objectif ({new Intl.NumberFormat("fr-DZ").format(TARGET)} DZD)
            </div>
          </div>
        </div>
      )}

      {/* نص توضيحي سفلي */}
      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Solde actuel mis à jour en temps réel – Wilaya de l'utilisateur
      </p>
    </div>
  );
}