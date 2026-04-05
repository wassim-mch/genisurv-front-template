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
  getDecaissements,
  createDecaissement,
  updateDecaissement,
  deleteDecaissement,
} from "../../api/decaissements.api";

import type { Decaissement } from "../../@types/decaissement";

import { PlusIcon, PencilIcon, TrashBinIcon } from "../../icons";

interface DecaissementForm {
  caisse_id: string;
  montant: string;
  designation: string;
  observation: string;
  type_justif: string;
  file_path: File | null;
}

interface FormErrors {
  [key: string]: string[];
}

export default function DecaissementsPage() {
  const [decaissements, setDecaissements] = useState<Decaissement[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<DecaissementForm>({
    caisse_id: "",
    montant: "",
    designation: "",
    observation: "",
    type_justif: "",
    file_path: null,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  const [editingItem, setEditingItem] = useState<Decaissement | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Decaissement | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const { isOpen, openModal, closeModal } = useModal();
  const deleteModal = useModal();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const caisseId = user?.caisse_id?.toString() || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDecaissements();
      setDecaissements(data);
    } catch (err) {
      setServerError("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setForm({
      caisse_id: caisseId,
      montant: "",
      designation: "",
      observation: "",
      type_justif: "",
      file_path: null,
    });
    setFormErrors({});
    setServerError("");
  };
  const formatMoney = (value: number) => {
  return new Intl.NumberFormat("fr-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 2,
  }).format(value);
};
  // ✅ VALIDATION
  const validateForm = () => {
    let errors: FormErrors = {};

    if (!form.designation.trim()) {
      errors.designation = ["La désignation est obligatoire."];
    }

    if (!form.montant || Number(form.montant) <= 0) {
      errors.montant = ["Le montant est obligatoire et > 0."];
    }

    if (!form.observation.trim()) {
      errors.observation = ["L'observation est obligatoire."];
    }

    if (!form.type_justif) {
      errors.type_justif = ["Le type est obligatoire."];
    }

    if (!form.file_path && !editingItem) {
      errors.file_path = ["Le fichier est obligatoire."];
    }

    return errors;
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingItem(null);
    openModal();
  };

  const handleOpenEdit = (item: Decaissement) => {
    setEditingItem(item);
    setForm({
      caisse_id: caisseId,
      montant: item.montant.toString(),
      designation: item.designation || "",
      observation: item.observation || "",
      type_justif: item.type_justificatif || "",
      file_path: null,
    });
    setFormErrors({});
    openModal();
  };

  const handleOpenDelete = (item: Decaissement) => {
    setItemToDelete(item);
    deleteModal.openModal();
  };

  // ✅ SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});
    setServerError("");

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("caisse_id", form.caisse_id);
      formData.append("montant", form.montant);
      formData.append("designation", form.designation);
      formData.append("observation", form.observation);
      formData.append("type_justif", form.type_justif);

      if (form.file_path) {
        formData.append("file_path", form.file_path);
      }

      if (editingItem) {
        await updateDecaissement(editingItem.id, formData);
      } else {
        await createDecaissement(formData);
      }

      closeModal();
      fetchData();
      resetForm();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || {});
      } else {
        setServerError("Erreur serveur.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    await deleteDecaissement(itemToDelete.id);
    deleteModal.closeModal();
    fetchData();
  };

  const typeOptions = [
    { value: "facture", label: "Facture" },
    { value: "reçu", label: "Reçu" },
    { value: "autre", label: "Autre" },
  ];

  return (
    <>
      <PageMeta title="Décaissements" description="Gestion" />
      <PageBreadcrumb pageTitle="Décaissements" />


      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Liste des décaissements
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
                    ID
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Par
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Désignation
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Montant
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    État
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Justificatif
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
                {decaissements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Aucun décaissement trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  decaissements.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/5 border-b border-gray-100 dark:border-gray-800"
                    >
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.id}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.par || "—"}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.designation}</TableCell>
                      <TableCell className="px-5 py-4 text-right text-sm font-semibold text-success-600 dark:text-success-400">
                        {formatMoney(Number(item.montant))}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.type_justificatif || "—"}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">{item.etat_justificatif || "—"}</TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                        {item.lien_justificatif? (
                          <a
                            href={`${item.lien_justificatif}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
                          >
                            Voir le fichier
                          </a>
                        ) : (
                          "Aucun"
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm text-gray-800 dark:text-white">
                        {new Date(item.date_creation).toLocaleDateString("fr-DZ")}
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
        <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
          {editingItem ? "Modifier le décaissement" : "Nouveau décaissement"}
        </h4>

        {serverError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Désignation *</Label>
            <Input
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className="text-gray-800 dark:text-white"
              error={formErrors.designation?.[0]}
            />
          </div>

          <div>
            <Label>Montant *</Label>
            <Input
              type="number"
              step="0.01"
              value={form.montant}
              onChange={(e) => setForm({ ...form, montant: e.target.value })}
              className="text-gray-800 dark:text-white"
              error={formErrors.montant?.[0]}
            />
          </div>

          <div>
            <Label>Observation</Label>
            <Input
              value={form.observation}
              onChange={(e) => setForm({ ...form, observation: e.target.value })}
              className="text-gray-800 dark:text-white"
              error={formErrors.observation?.[0]}
            />
          </div>

          <div>
            <Label>Type de justificatif</Label>
            <Select
              options={typeOptions}
              value={form.type_justif}
              onChange={(val) => setForm({ ...form, type_justif: val as string })}
              error={formErrors.type_justif?.[0]}
            />
          </div>

          <div>
            <Label>Justificatif (facultatif)</Label>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => setForm({ ...form, file_path: e.target.files?.[0] || null })}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
            />
            {formErrors.file_path?.[0] && (
              <p className="mt-1 text-sm text-red-600">{formErrors.file_path[0]}</p>
            )}
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
        <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
          Confirmer la suppression
        </h4>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Êtes-vous sûr de vouloir supprimer ce décaissement ? Cette action est irréversible.
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