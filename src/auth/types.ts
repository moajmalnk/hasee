export type Role = "ADMIN" | "CUSTOMER";

export type FavoriteColors = string[];

export type OnboardingData = {
  name: string;
  location: string; // District in Kerala or City
  whatsappNumber: string;
  phoneNumber?: string;
  email?: string;
  favoriteColors?: FavoriteColors;
};

export type Session = {
  loggedIn: boolean;
  role?: Role;
  email?: string;
  onboardingComplete: boolean;
  onboarding?: OnboardingData;
};

