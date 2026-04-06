import { api } from "../lib/api";

export interface TransferKey {
  id: string;
  type: "EMAIL" | "PHONE" | "CPF";
  value: string;
}

export const transferKeyService = {
  listKeys: (accountId: string) =>
    api.get<TransferKey[]>(`/accounts/${accountId}/keys`),

  createKey: (accountId: string, data: { type: string; value: string }) =>
    api.post<TransferKey>(`/accounts/${accountId}/keys`, data),

  deleteKey: (accountId: string, keyId: string) =>
    api.delete(`/accounts/${accountId}/keys/${keyId}`),
};