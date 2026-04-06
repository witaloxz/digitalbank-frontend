import { api } from "../lib/api";

export interface Card {
  id: string;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  type: "DEBIT" | "CREDIT";
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  creditLimit: number;
}

export interface CardSpending {
  category: string;
  amount: number;
}

export interface CardTransaction {
  description: string;
  date: string;
  amount: number;
  negative: boolean;
}

export const cardService = {
  getMyCards: () =>
    api.get<Card[]>("/api/v1/cards"),

  createCard: (data: { type: "DEBIT" | "CREDIT"; creditLimit?: number }) =>
    api.post<Card>("/api/v1/cards", data),

  blockCard: (cardId: string) =>
    api.patch(`/api/v1/cards/${cardId}/block`),

  deleteCard: (cardId: string) =>
    api.delete(`/api/v1/cards/${cardId}`),

  getCardSpending: (cardId: string) =>
    api.get<CardSpending[]>(`/api/v1/cards/${cardId}/spending`),

  getCardTransactions: (cardId: string) =>
    api.get<CardTransaction[]>(`/api/v1/cards/${cardId}/transactions`),
};