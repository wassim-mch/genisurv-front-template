import { useState, useEffect, useCallback } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";

import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";

import { useModal } from "../../hooks/useModal";

import {
  getAlimentations,
  createAlimentation,
  updateAlimentation,
} from "../../api/alimentations.api";

import { getCaisses } from "../../api/caisses.api";

import type { Alimentation } from "../../@types/alimentation";
import type { Caisse } from "../../@types/caisse";

import { PlusIcon, PencilIcon } from "../../icons";

interface AlimentationForm {
  caisse_id: string;
  montant: string;
}

interface FormErrors {
  [key: string]: string[]; // مثال: { caisse_id: ["La caisse est obligatoire."], montant: [...] }
}

export default function AlimentationsPage() {
  const [alimentations, setAlimentations] = useState<Alimentation[]>([]);
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<AlimentationForm>({ caisse_id: "", montant: "" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string>("");

  const [editingItem, setEditingItem] = useState<Alimentation | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const { isOpen, openModal, closeModal } = useModal();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [alimentationsData, caissesData] = await Promise.all([
        getAlimentations(),
        getCaisses(),
      ]);
      setAlimentations(alimentationsData);
      setCaisses(caissesData);
    } catch (err: any) {
      console.error(err);
      setServerError("Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({ caisse_id: "", montant: "" });
    setFormErrors({});
    setServerError("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingItem(null);
    openModal();
  };

  const handleOpenEdit = (item: Alimentation) => {
    setEditingItem(item);
    setForm({
      caisse_id: item.caisse_id?.toString() || "",
      montant: item.montant?.toString() || "",
    });
    setFormErrors({});
    setServerError("");
    openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setServerError("");
    setSubmitting(true);

    // تنظيف المبلغ قبل الإرسال
    const montantClean = form.montant.replace(/\s/g, "").replace(",", ".");

    const payload = {
      caisse_id: Number(form.caisse_id),
      montant: Number(montantClean),
    };

    try {
      if (editingItem) {
        await updateAlimentation(editingItem.id, payload);
      } else {
        await createAlimentation(payload);
      }

      closeModal();
      fetchData();
      resetForm();
    } catch (err: any) {
      if (err.response?.status === 422) {
        // أخطاء التحقق من Laravel
        setFormErrors(err.response.data.errors || {});
      } else {
        setServerError(
          err.response?.data?.message ||
            "Une erreur est survenue lors de l'enregistrement."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatMoney = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val.replace(/\s/g, "").replace(",", ".")) : val;
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
      minimumFractionDigits: 2,
    }).format(isNaN(num) ? 0 : num);
  };

  return (
    <>
      <PageMeta title="Alimentations" description="Gestion des alimentations" />
      <PageBreadcrumb pageTitle="Alimentations" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Liste des alimentations
          </h3>
          <Button size="sm" startIcon={<PlusIcon />} onClick={handleOpenCreate}>
            Ajouter
          </Button>
        </div>

        {serverError && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {serverError}
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
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Wilaya / Caisse
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Par
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Montant
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {alimentations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Aucune alimentation trouvée.
                    </TableCell>
                  </TableRow>
                ) : (
                  alimentations.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-gray-800"
                    >
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                        {item.wilaya || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                        {item.par || "Système"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right text-sm font-semibold text-success-600 dark:text-success-400">
                        {formatMoney(item.montant)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                        {item.date_creation || new Date(item.created_at).toLocaleDateString("fr-DZ")}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                            title="Modifier"
                          >
                            <PencilIcon className="size-5 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Modal Formulaire */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-lg p-6">
        <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
          {editingItem ? "Modifier l'alimentation" : "Nouvelle alimentation"}
        </h4>

        {serverError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Caisse <span className="text-error-500">*</span></Label>
            <Select
              options={caisses.map((c) => ({
                value: c.id.toString(),
                label: c.wilaya || `Caisse #${c.id}`,
              }))}
              value={form.caisse_id}
              onChange={(val) => setForm({ ...form, caisse_id: val as string })}
              placeholder="Sélectionnez une caisse"
              error={formErrors.caisse_id?.[0]}
            />
          </div>

          <div>
            <Label>Montant <span className="text-error-500">*</span></Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0 DZD"
              value={form.montant}
              onChange={(e) => {
                // Autorise chiffres, virgule, point et espaces
                const val = e.target.value.replace(/[^0-9,\s.]/g, "");
                setForm({ ...form, montant: val });
              }}
              className="text-gray-800 dark:text-white"
              error={formErrors.montant?.[0]}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={closeModal} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Enregistrement...
                </div>
              ) : editingItem ? (
                "Modifier"
              ) : (
                "Enregistrer"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}