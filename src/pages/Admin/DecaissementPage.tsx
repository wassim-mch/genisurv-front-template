import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../components/ui/table";
import { getDecaissement } from "../../api/decaissements.api";
import type { Decaissement } from "../../@types/decaissement";

export default function DecaissementPage() {
  const [decaissements, setDecaissements] = useState<Decaissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDecaissement();
      setDecaissements(data);
    } catch {
      setError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatMoney = (val: number | string) =>
    new Intl.NumberFormat("fr-DZ", { style: "currency", currency: "DZD" }).format(Number(val));

  return (
    <>
      <PageMeta title="Décaissements" description="Liste des décaissements" />
      <PageBreadcrumb pageTitle="Décaissements" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Liste des décaissements
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
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">ID</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Par</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Désignation</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Montant</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Type</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Etat</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Justificatif</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {decaissements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-800 dark:text-white/90">
                      Aucun décaissement trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  decaissements.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.id}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.par}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.designation}</TableCell>
                      <TableCell className="px-5 py-4 text-sm font-semibold text-success-600 dark:text-success-400">
                        {formatMoney(item.montant)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.type_justificatif || "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.etat_justificatif || "-"}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                        {item.lien_justificatif ? (
                          <a href={item.lien_justificatif} target="_blank" className="text-blue-600 dark:text-blue-400 underline">
                            Télécharger
                          </a>
                        ) : (
                          "Aucun"
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.date_creation}</TableCell>
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