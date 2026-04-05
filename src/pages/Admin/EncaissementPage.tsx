import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import { getEncaissement } from "../../api/encaissements.api";
import type { Encaissement } from "../../@types/encaissement";

export default function EncaissementPage() {
  const [encaissements, setEncaissements] = useState<Encaissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEncaissement();
      setEncaissements(data);
    } catch {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const parseMontant = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return 0;

    if (typeof val === "number") return val;

    return parseFloat(val.replace(/\s/g, "").replace(",", ".")) || 0;
    };
  const formatMoney = (val: number) =>
    new Intl.NumberFormat("fr-DZ", { style: "currency", currency: "DZD" }).format(val);

  return (
    <>
      <PageMeta title="Gestion des Encaissements" description="Page d'affichage des encaissements" />
      <PageBreadcrumb pageTitle="Encaissements" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Liste des encaissements
          </h3>
        </div>

        {error && (
          <div className="mx-5 mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-500 dark:bg-error-500/10">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Par
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Montant
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Rapport
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </TableCell>

                </TableRow>
              </TableHeader>

              <TableBody>
                {encaissements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                      Aucun encaissement trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  encaissements.map((item) => (
                    <TableRow key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                      <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.par}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-right text-sm font-semibold text-success-600 dark:text-success-400">
                        {formatMoney(parseMontant(item.montant))}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-right text-sm font-semibold text-success-600 dark:text-success-400">
                        {item.rapport}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {item.date_creation}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}