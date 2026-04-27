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

// NextAuth is imported by the route file, so we return a tiny stub.
// This keeps the test focused on the credentials authorization logic.
vi.mock("next-auth", () => ({
  default: vi.fn(() => ({ GET: vi.fn(), POST: vi.fn() })),
}));

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

describe("auth flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findUnique.mockReset();
    mocks.compare.mockReset();
  });

  it("accepts valid credentials and normalizes the email", async () => {
    // Pretend the database already has a matching user.
    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      password: "hashed-password",
    });

    // Pretend bcrypt approves the password.
    mocks.compare.mockResolvedValue(true);

    const provider = authOptions.providers[0] as CredentialsProviderLike;
    const authorize = provider?.options?.authorize ?? provider?.authorize;

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
