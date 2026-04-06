import { api } from "../lib/api";
import { v4 as uuidv4 } from "uuid";

export const transferService = {
  createTransfer: (data: {
    fromAccountId: string;
    destinationAccountNumber?: string;
    transferKey?: string;
    transferKeyType?: string;
    amount: number;
    description: string;
  }) => {
    const idempotencyKey = uuidv4();
    return api.post("/transfers", data, {
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },

  reverseTransfer: (transferId: string) =>
    api.post(`/transfers/${transferId}/reverse`),
};