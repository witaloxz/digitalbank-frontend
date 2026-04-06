import { api } from "../lib/api";

export const accountService = {
  getCurrentUserAccount: (userId: string) => api.get(`/accounts/user/${userId}`),

  getAccountStatement: (accountId: string) => api.get(`/accounts/${accountId}/statement`),

  deposit: (accountId: string, amount: number, description?: string) =>
    api.post("/transactions/deposit", {
      accountId,
      amount,
      description: description || "Depósito via app",
    }),

  withdraw: (accountId: string, amount: number, description?: string) =>
    api.post("/transactions/withdraw", {
      accountId,
      amount,
      description: description || "Saque via app",
    }),
};