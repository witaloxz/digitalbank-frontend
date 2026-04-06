import { api } from "../lib/api";

export interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalPendingLoans: number;
  totalRevenue: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  balance: number;
  joinDate: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  balance: number;
  joinDate: string;
}

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  type: "transfer" | "withdrawal" | "deposit";
  status: "completed" | "pending" | "failed";
  date: string;
  description: string;
}

export interface SystemSettings {
  transferFee: string;
  withdrawalFee: string;
  dailyTransferLimit: string;
  dailyWithdrawalLimit: string;
  minTransfer: string;
  maxTransfer: string;
  maintenanceMode: boolean;
}

export interface MonthlyData {
  month: string;
  value: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export const adminService = {
  getMonthlyUsers: (months: number = 6) =>
    api.get<MonthlyData[]>(`/api/v1/admin/stats/users-monthly?months=${months}`),

  getMonthlyTransactions: (months: number = 6) =>
    api.get<MonthlyData[]>(`/api/v1/admin/stats/transactions-monthly?months=${months}`),

  getMonthlyRevenue: (months: number = 6) =>
    api.get<MonthlyData[]>(`/api/v1/admin/stats/revenue-monthly?months=${months}`),

  getStatusDistribution: () =>
    api.get<StatusDistribution[]>("/api/v1/admin/stats/status-distribution"),

  getSettings: () =>
    api.get<SystemSettings>("/api/v1/admin/settings"),

  updateSettings: (settings: SystemSettings) =>
    api.put("/api/v1/admin/settings", settings),

  getStats: () =>
    api.get<AdminStats>("/api/v1/admin/stats"),

  getUsers: (page: number = 0, size: number = 10, search?: string, filter?: string) => {
    const params: any = { page, size };
    if (search) params.search = search;
    if (filter) {
      if (filter === "active") params.status = "ACTIVE";
      else if (filter === "inactive") params.status = "INACTIVE";
      else if (filter === "admin") params.role = "ADMIN";
    }
    return api.get<{ content: AdminUser[]; totalPages: number }>("/api/v1/admin/users", { params });
  },

  updateUserRole: (userId: string, role: "USER" | "ADMIN") =>
    api.patch(`/api/v1/admin/users/${userId}/role`, { role }),

  toggleUserStatus: (userId: string) =>
    api.patch(`/api/v1/admin/users/${userId}/toggle-status`),

  getTransactions: (page, size, search, status, type) => {
    const params: any = { page, size };
    if (search) params.search = search;
    if (status && status !== "all") params.status = status;
    if (type && type !== "all") params.type = type;
    return api.get("/api/v1/admin/transactions", { params });
  },

  updateTransactionStatus: (id, status) =>
    api.patch(`/api/v1/admin/transactions/${id}/status`, { status }),

  reverseTransaction: (txId: string) =>
    api.patch(`/api/v1/admin/transactions/${txId}/reverse`),
};