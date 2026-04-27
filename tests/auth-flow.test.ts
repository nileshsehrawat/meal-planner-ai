import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  compare: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: mocks.findUnique,
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: mocks.compare,
  },
}));

// Make the credentials provider return the config object as-is.
// That lets the test call the real authorize callback from the route.
vi.mock("next-auth/providers/credentials", () => ({
  default: (config: unknown) => config,
}));

// Mock NextAuth so route handler doesn't break
vi.mock("next-auth", () => ({
  default: vi.fn(() => ({ GET: vi.fn(), POST: vi.fn() })),
}));

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

describe("auth flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts valid credentials and normalizes the email", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      password: "hashed-password",
    });

    mocks.compare.mockResolvedValue(true);

    type CredentialsProviderLike = {
      authorize?: (credentials: {
        email?: string;
        password?: string;
      }) => Promise<{ id: string; email: string } | null>;
      options?: {
        authorize?: (credentials: {
          email?: string;
          password?: string;
        }) => Promise<{ id: string; email: string } | null>;
      };
    };

    const provider = authOptions.providers[0] as CredentialsProviderLike;

    const authorize = provider?.authorize ?? provider?.options?.authorize;

    if (!authorize) {
      throw new Error("Credentials authorize function was not found.");
    }

    const user = await authorize({
      email: "  TEST@example.com  ",
      password: "secret",
    });

    expect(mocks.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });

    expect(mocks.compare).toHaveBeenCalledWith("secret", "hashed-password");

    expect(user).toEqual({
      id: "user-1",
      email: "test@example.com",
    });
  });
});
