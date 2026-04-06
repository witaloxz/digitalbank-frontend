import { api } from "../lib/api";

export const accountService = {
  getCurrentUserAccount: (userId: string) => 
    api.get(`/api/v1/accounts/user/${userId}`),

  getAccountStatement: (accountId: string) => 
    api.get(`/api/v1/accounts/${accountId}/statement`),

  deposit: (accountId: string, amount: number, description?: string) =>
    api.post("/api/v1/transactions/deposit", {
      accountId,
      amount,
      description: description || "Depósito via app",
    }),

  withdraw: (accountId: string, amount: number, description?: string) =>
    api.post("/api/v1/transactions/withdraw", {
      accountId,
      amount,
      description: description || "Saque via app",
    }),
};