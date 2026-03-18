import type { OnboardingData, Role, Session } from "./types";

// Placeholder helpers. Real mock behavior is added in the `auth-mock-api` todo.

export async function login(_input: { email: string; password: string }): Promise<Session> {
  return {
    loggedIn: true,
    role: "CUSTOMER" as Role,
    email: _input.email,
    onboardingComplete: false,
  };
}

export async function completeOnboarding(_data: OnboardingData): Promise<Session> {
  return {
    loggedIn: true,
    role: "CUSTOMER" as Role,
    onboardingComplete: true,
    onboarding: _data,
    email: _data.email,
  };
}

