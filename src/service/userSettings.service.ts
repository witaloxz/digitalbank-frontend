import { api } from "../lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
}

export interface TransferKey {
  id: string;
  type: "EMAIL" | "PHONE" | "CPF";
  value: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UserPreferences {
  language: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
}

export const userSettingsService = {
  getCurrentUser: () =>
    api.get<UserProfile>("/api/v1/users/me").then((res) => res.data), 

  updateProfile: (data: UpdateProfileData) =>
    api.put<UserProfile>("/api/v1/users/me", data).then((res) => res.data),

  updatePassword: (data: UpdatePasswordData) =>
    api.put("/api/v1/users/me/password", data),

  updatePreferences: (preferences: UserPreferences) =>
    api.put("/api/v1/users/me/preferences", preferences),
};