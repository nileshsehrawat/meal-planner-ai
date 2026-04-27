import { describe, expect, it, vi } from "vitest";
import { generateMeals } from "@/lib/meal-generator";

describe("meal generator fallback", () => {
  it("returns one plan item per requested day", () => {
    // Make the random picker deterministic so the test is easy to learn from.
    vi.spyOn(Math, "random").mockReturnValue(0);

    const mealPlan = generateMeals(2);

    expect(mealPlan).toHaveLength(2);
    expect(mealPlan[0]).toMatchObject({
      day: 1,
      meals: {
        breakfast: { name: "Poha" },
        lunch: { name: "Dal Rice" },
        dinner: { name: "Khichdi" },
      },
    });
  });
});
