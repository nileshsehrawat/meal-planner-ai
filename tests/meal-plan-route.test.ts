import { beforeEach, describe, expect, it, vi } from "vitest";

// Keep mocks tiny and explicit so the route behavior is easy to read.
const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findUnique: vi.fn(),
  mealPlanCreate: vi.fn(),
  generateMealsAI: vi.fn(),
  generateMeals: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: mocks.findUnique,
    },
    mealPlan: {
      create: mocks.mealPlanCreate,
    },
  },
}));

vi.mock("@/lib/ai", () => ({
  generateMealsAI: mocks.generateMealsAI,
}));

vi.mock("@/lib/meal-generator", () => ({
  generateMeals: mocks.generateMeals,
}));

import { POST } from "@/app/api/meal-plan/generate/route";

describe("meal plan API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServerSession.mockReset();
    mocks.findUnique.mockReset();
    mocks.mealPlanCreate.mockReset();
    mocks.generateMealsAI.mockReset();
    mocks.generateMeals.mockReset();
  });

  it("creates a meal plan for a signed-in user", async () => {
    // Pretend the request already has a logged-in session.
    mocks.getServerSession.mockResolvedValue({
      user: { id: "user-1" },
    });

    // The route loads the user to read peopleCount before asking AI.
    mocks.findUnique.mockResolvedValue({
      id: "user-1",
      peopleCount: 4,
    });

    // Return one very small plan so the response is easy to inspect.
    mocks.generateMealsAI.mockResolvedValue([
      {
        day: 1,
        meals: {
          breakfast: {
            name: "Poha",
            ingredients: [{ name: "Poha", quantity: "100g" }],
          },
          lunch: {
            name: "Dal Rice",
            ingredients: [{ name: "Rice", quantity: "200g" }],
          },
          dinner: {
            name: "Khichdi",
            ingredients: [{ name: "Rice", quantity: "100g" }],
          },
        },
      },
    ]);

    // Mirror the Prisma create result back so the handler can return it.
    mocks.mealPlanCreate.mockImplementation(async ({ data }) => ({
      id: "plan-1",
      ...data,
      meals: data.meals.create,
    }));

    const response = await POST(
      new Request("http://localhost/api/meal-plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: 1 }),
      }),
    );

    const body = (await response.json()) as {
      mealPlan: { id: string; meals: unknown[] };
    };

    expect(response.status).toBe(200);
    expect(mocks.generateMealsAI).toHaveBeenCalledWith(1, 4);
    expect(body.mealPlan.id).toBe("plan-1");
    expect(body.mealPlan.meals).toHaveLength(3);
  });
});
