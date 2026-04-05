import EcommerceMetrics from "../../components/ecommerce/WilayaMetrics";
import MonthlySalesChart from "../../components/ecommerce/MouvementsMensuelsChart";
import PageMeta from "../../components/common/PageMeta";
import CaisseSoldeWidget from "../../components/ecommerce/CaisseSoldeWidget";
import { useEffect, useState } from "react";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import GestionnaireMetrics from "../../components/ecommerce/GestionnaireMetrics";

export default function Home() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user?.role || null;
    setUserRole(role);
  }, []);

  if (!userRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const isSuperAdmin = userRole === "superadmin";
  const isGestionnaire = userRole === "gestionnaire";
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="space-y-8 md:space-y-10 lg:space-y-12 px-4 sm:px-6 lg:px-8">
        {isSuperAdmin && (
          <>
            <section>
              <EcommerceMetrics />
            </section>

            <section>
              <MonthlySalesChart />
            </section>
          </>
        )}

        {isGestionnaire && (
          <section>
            <GestionnaireMetrics /><br />                                                    
            <StatisticsChart />
          </section>
        )}


        {!isSuperAdmin && !isGestionnaire && (
          <div className="rounded-xl bg-yellow-50 p-8 text-center text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <h3 className="text-xl font-semibold">Autorisations insuffisantes</h3>
            <p className="mt-3">
              Il semble que votre rôle n'est pas défini ou n'est pas pris en charge dans le tableau de bord.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
