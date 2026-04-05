import api from "./axios";
import type { Decaissement } from "../@types/decaissement";

export const getDecaissements = async (): Promise<Decaissement[]> => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const caisseId = user?.caisse_id;
  const res = await api.get(`/decaissement/${caisseId}`);
  return res.data.decaissements;
};

export const createDecaissement = async (data: FormData) => {
  return api.post("/decaissement", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateDecaissement = async (id: number, data: FormData) => {
  return api.post(`/decaissement/${id}?_method=PUT`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteDecaissement = async (id: number) => {
  return api.delete(`/decaissement/${id}`);
};

export const getDecaissement = async () => {
  const res = await api.get("/admin/decaissement");
  return res.data.decaissements;
}