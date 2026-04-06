import { api } from "../lib/api";

export interface Loan {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate: string;
  status: string;
  progressPercentage: number;
}

export interface LoanSummary {
  totalLoans: number;
  monthlyPayment: number;
  avgInterestRate: number;
}

export interface Installment {
  id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  boletoCode: string;
  status: string;
  paidAt: string | null;
}

export interface PendingLoan {
  id: string;
  userName: string;
  userEmail: string;
  loanName: string;
  totalAmount: number;
  interestRate: number;
  progressPercentage: number;
  status: string;
  createdAt: string;
}

export const loanService = {
  getLoansByAccount: (accountId: string, page = 0, size = 10) =>
    api.get(`/api/v1/loans/account/${accountId}?page=${page}&size=${size}`),

  getLoanSummary: (accountId: string) =>
    api.get(`/api/v1/loans/account/${accountId}/summary`),

  requestLoan: (
    accountId: string,
    data: { name: string; amount: number; interestRate: number; termMonths: number }
  ) =>
    api.post(`/api/v1/loans/account/${accountId}/request`, data),

  getInstallments: (loanId: string) =>
    api.get(`/api/v1/loans/${loanId}/installments`),

  payInstallment: (boletoCode: string) =>
    api.post("/api/v1/loans/installments/pay", { boletoCode }),

  getPendingLoans: (page = 0, size = 10) =>
    api.get<{ content: PendingLoan[]; totalPages: number }>(`/api/v1/loans/admin/pending?page=${page}&size=${size}`),

  approveLoan: (loanId: string) =>
    api.patch(`/api/v1/loans/admin/${loanId}/approve`),

  rejectLoan: (loanId: string) =>
    api.patch(`/api/v1/loans/admin/${loanId}/reject`),
};