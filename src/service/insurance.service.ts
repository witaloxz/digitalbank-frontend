import { api } from "../lib/api";

export interface Insurance {
  id: string;
  userName: string;
  userEmail: string;
  plan: string;
  status: string;
  createdAt: string;
}

export const insuranceService = {
  requestLifeInsurance: (accountId: string, plan: string) =>
    api.post(`/api/v1/insurance/life/request?accountId=${accountId}`, { plan }),

  getPendingRequests: (page = 0, size = 10) =>
    api.get<{ content: Insurance[]; totalPages: number }>(`/api/v1/insurance/admin/pending?page=${page}&size=${size}`),

  approveRequest: (id: string) =>
    api.patch(`/api/v1/insurance/admin/${id}/approve`),

  rejectRequest: (id: string) =>
    api.patch(`/api/v1/insurance/admin/${id}/reject`),
};