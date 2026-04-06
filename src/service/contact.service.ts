import { api } from "../lib/api";

export interface RecentContact {
  accountId: string;
  name: string;
  accountNumber: string;
  avatarLetter: string;
}

export const contactService = {
  getRecentContacts: () =>
    api.get<RecentContact[]>("/transfers/contacts/recent"),
};