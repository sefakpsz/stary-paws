import { apiRequest, isApiConfigured } from "./client";
import { mockResponse } from "./mock";

export type AuthUser = {
  email: string;
  name: string;
};

export async function demoLogin() {
  if (isApiConfigured()) {
    return apiRequest<AuthUser>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ mode: "demo" }),
    });
  }

  return mockResponse({
    email: "demo@straypaws.app",
    name: "Demo volunteer",
  } satisfies AuthUser);
}
