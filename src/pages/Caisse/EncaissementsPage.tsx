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

import { useModal } from "../../hooks/useModal";

import {
  getEncaissements,
  createEncaissement,
  updateEncaissement,
  deleteEncaissement,
} from "../../api/encaissements.api";

import type { Encaissement } from "../../@types/encaissement";

import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";

interface EncaissementForm {
  montant: string;
  rapport: string;
}

interface FormErrors {
  [key: string]: string[];
}

const initialForm: EncaissementForm = {
  montant: "",
  rapport: "",
};

export default function EncaissementsPage() {
  const [encaissements, setEncaissements] = useState<Encaissement[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<EncaissementForm>(initialForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string>("");

  const [editingItem, setEditingItem] = useState<Encaissement | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Encaissement | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const { isOpen, openModal, closeModal } = useModal();
  const deleteModal = useModal();

  // Récupération depuis localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const caisseId = user?.caisse_id?.toString() || "";
  const userId = user?.id?.toString() || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEncaissements();
      setEncaissements(data);
    } catch (err: any) {
      console.error(err);
      setServerError("Erreur lors du chargement des encaissements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm(initialForm);
    setFormErrors({});
    setServerError("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingItem(null);
    openModal();
  };

  const handleOpenEdit = (item: Encaissement) => {
    setEditingItem(item);
    setForm({
      montant: item.montant.toString(),
      rapport: item.rapport || "",
    });
    setFormErrors({});
    setServerError("");
    openModal();
  };

  const handleOpenDelete = (item: Encaissement) => {
    setItemToDelete(item);
    deleteModal.openModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setServerError("");
    setSubmitting(true);

    const payload = {
      caisse_id: caisseId,
      user_id: userId,
      montant: Number(form.montant.replace(/\s/g, "").replace(",", ".")),
      rapport: form.rapport.trim() || undefined, // envoie undefined si vide
    };

    if (!caisseId || !userId) {
      setServerError("Informations utilisateur ou caisse manquantes.");
      setSubmitting(false);
      return;
    }

    try {
      if (editingItem) {
        await updateEncaissement(editingItem.id, payload);
      } else {
        await createEncaissement(payload);
      }

      closeModal();
      fetchData();
      resetForm();
    } catch (err: any) {
      if (err.response?.status === 422) {
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

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteEncaissement(itemToDelete.id);
      deleteModal.closeModal();
      setItemToDelete(null);
      fetchData();
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || "Erreur lors de la suppression."
      );
    }
  };

  const formatMoney = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val.replace(/\s/g, "").replace(",", ".")) : val;
    return new Intl.NumberFormat("fr-DZ", {
      style: "currency",
      currency: "DZD",
    }).format(isNaN(num) ? 0 : num);
  };

  return (
    <>
      <PageMeta title="Encaissements" description="Gestion des encaissements" />
      <PageBreadcrumb pageTitle="Encaissements" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Liste des encaissements
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
                    Par
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Montant
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Rapport
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
                {encaissements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Aucun encaissement trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  encaissements.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-gray-800"
                    >
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                        {item.par || item.par || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right text-sm font-semibold text-success-600 dark:text-success-400">
                        {formatMoney(item.montant)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {item.rapport || "—"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                        {item.date_creation }
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
                          <button
                            onClick={() => handleOpenDelete(item)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
                            title="Supprimer"
                          >
                            <TrashBinIcon className="size-5 text-red-500" />
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
          {editingItem ? "Modifier l'encaissement" : "Nouvel encaissement"}
        </h4>

        {serverError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Montant <span className="text-error-500">*</span></Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0 DZD"
              value={form.montant}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9,\s]/g, "");
                setForm({ ...form, montant: val });
              }}
              className="text-gray-800 dark:text-white"
              error={formErrors.montant?.[0]}
            />
          </div>

          <div>
            <Label>Rapport / Commentaire (facultatif)</Label>
            <Input
              value={form.rapport}
              onChange={(e) => setForm({ ...form, rapport: e.target.value })}
              placeholder="Ajoutez une note ou un motif (max 255 caractères)"
              rows={3}
              className="text-gray-800 dark:text-white"
              error={formErrors.rapport?.[0]}
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

      {/* Modal Suppression */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} className="max-w-sm p-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Confirmer la suppression
        </h4>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Êtes-vous sûr de vouloir supprimer cet encaissement de{" "}
          <strong>{itemToDelete ? formatMoney(itemToDelete.montant) : ""}</strong> ?
          <br />
          Cette action est irréversible.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={deleteModal.closeModal}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Supprimer
          </Button>
        </div>
      </Modal>
    </>
  );
}