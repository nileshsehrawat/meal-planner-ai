"use client";

import { useState } from "react";

type Ingredient = {
  name: string;
  quantity: string;
};

type Meal = {
  id: string;
  day: number;
  mealType: string;
  name: string;
  ingredients: Ingredient[];
};

export default function DashboardUI() {
  const [people, setPeople] = useState(1);
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isGroceriesModalOpen, setIsGroceriesModalOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const clampPeople = (value: number) => Math.max(1, value || 1);
  const clampDays = (value: number) => Math.min(7, Math.max(1, value || 1));

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);

    try {
      await fetch("/api/user/update", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ peopleCount: people }),
      });

      const res = await fetch("/api/meal-plan/generate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });

      const data = await res.json();

      if (!res.ok || !data?.mealPlan?.meals) {
        throw new Error("Could not generate a meal plan right now.");
      }

      // 👇 store meals
      setMeals(data.mealPlan.meals);
      setIsGroceriesModalOpen(false);
      setExpanded(null);
    } catch {
      setError("Could not generate a meal plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Group meals by day
  const groupedMeals = meals.reduce<Record<number, Meal[]>>((acc, meal) => {
    if (!acc[meal.day]) acc[meal.day] = [];
    acc[meal.day].push(meal);
    return acc;
  }, {});

  const orderedDays = Object.keys(groupedMeals)
    .map(Number)
    .sort((firstDay, secondDay) => firstDay - secondDay);

  // 🛒 Grocery aggregation
  const groceryMap: Record<string, number> = {};

  meals.forEach((meal) => {
    meal.ingredients.forEach((ing) => {
      const qty = Number.parseFloat(ing.quantity.replace(/[^0-9.]/g, "")) || 0;
      if (!groceryMap[ing.name]) groceryMap[ing.name] = 0;
      groceryMap[ing.name] += qty;
    });
  });

  const buildGroceryCopyText = () => {
    const entries = Object.entries(groceryMap)
      .sort(([firstName], [secondName]) => firstName.localeCompare(secondName))
      .map(([name, qty]) => `- ${name}: ${Math.round(qty)}g`);

    return [`FreshPrep Grocery List`, "", ...entries].join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildGroceryCopyText());
      setCopyMessage("Grocery list copied");
      setTimeout(() => setCopyMessage(null), 1800);
    } catch {
      setCopyMessage("Copy failed. Please try again.");
      setTimeout(() => setCopyMessage(null), 1800);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.78))] px-6 py-7 shadow-[0_20px_70px_rgba(45,106,79,0.10)] backdrop-blur-xl sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-[#0f5238]/8 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#fc8a40]/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-[#0f5238]/8 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f5238]">
              FreshPrep
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-[#1b1c19] sm:text-5xl">
              Meal Planner
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#404943] sm:text-base">
              Keep the interface calm and well spaced while you generate a plan,
              review meals, and pull groceries together.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsGroceriesModalOpen(true)}
              disabled={meals.length === 0}
              className="h-12 rounded-full border border-[#e4e2dd] bg-white px-5 text-sm font-medium text-[#1b1c19] transition hover:border-[#0f5238]/30 hover:bg-[#fbf9f4] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Open groceries
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="h-12 rounded-full bg-[#0f5238] px-5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,82,56,0.24)] transition hover:-translate-y-px hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating..." : "Generate plan"}
            </button>
          </div>
        </div>

        {meals.length === 0 && (
          <p className="relative z-10 mt-3 text-sm text-[#5c645f]">
            Generate a meal plan to unlock the grocery list modal.
          </p>
        )}

        {error && (
          <p className="relative z-10 mt-4 rounded-2xl border border-[#ba1a1a]/20 bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]">
            {error}
          </p>
        )}

        <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#e4e2dd] bg-white/85 px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#0f5238]/70">
              Current scope
            </p>
            <p className="mt-2 text-base font-semibold text-[#1b1c19]">
              {people} people · {days} days
            </p>
          </div>
          <div className="rounded-3xl border border-[#e4e2dd] bg-white/85 px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#0f5238]/70">
              Meals loaded
            </p>
            <p className="mt-2 text-base font-semibold text-[#1b1c19]">
              {meals.length}
            </p>
          </div>
          <div className="rounded-3xl border border-[#e4e2dd] bg-white/85 px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#0f5238]/70">
              Grocery items
            </p>
            <p className="mt-2 text-base font-semibold text-[#1b1c19]">
              {Object.keys(groceryMap).length}
            </p>
          </div>
        </div>
      </header>

      <section className="mt-8 grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="rounded-4xl border border-white/70 bg-white/88 p-7 shadow-[0_16px_60px_rgba(45,106,79,0.08)] backdrop-blur-xl">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-[#fc8a40]/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9b4500]">
              Setup
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-[#1b1c19]">
              Plan inputs
            </h2>
            <p className="text-sm leading-7 text-[#404943]">
              Set the number of people and days before generating a new plan.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#404943]">
                People
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPeople((currentPeople) => clampPeople(currentPeople - 1))}
                  className="h-12 w-12 rounded-2xl border border-[#e4e2dd] bg-[#fbf9f4] text-lg text-[#1b1c19] transition hover:border-[#0f5238]/30"
                  aria-label="Decrease people"
                >
                  -
                </button>
                <input
                  type="number"
                  value={people}
                  onChange={(e) => setPeople(clampPeople(Number(e.target.value)))}
                  min={1}
                  className="h-14 w-full rounded-2xl border border-[#e4e2dd] bg-[#fbf9f4] px-4 text-sm outline-none transition focus:border-[#0f5238] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setPeople((currentPeople) => clampPeople(currentPeople + 1))}
                  className="h-12 w-12 rounded-2xl border border-[#e4e2dd] bg-[#fbf9f4] text-lg text-[#1b1c19] transition hover:border-[#0f5238]/30"
                  aria-label="Increase people"
                >
                  +
                </button>
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#404943]">Days</span>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(clampDays(Number(e.target.value)))}
                min={1}
                max={7}
                className="h-14 w-full rounded-2xl border border-[#e4e2dd] bg-[#fbf9f4] px-4 text-sm outline-none transition focus:border-[#0f5238] focus:bg-white"
              />
              <div className="flex flex-wrap gap-2">
                {[3, 5, 7].map((quickDay) => (
                  <button
                    key={quickDay}
                    type="button"
                    onClick={() => setDays(quickDay)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] transition ${days === quickDay
                      ? "bg-[#0f5238] text-white"
                      : "bg-[#fbf9f4] text-[#404943]"
                      }`}
                  >
                    {quickDay} days
                  </button>
                ))}
              </div>
            </label>

            <div className="rounded-[28px] bg-[#0f5238]/6 p-5 text-sm text-[#404943]">
              <p className="font-medium text-[#1b1c19]">Current scope</p>
              <p className="mt-1">
                {people} people · {days} days
              </p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          {meals.length === 0 && !loading && (
            <section className="rounded-4xl border border-dashed border-[#d9d6d1] bg-white/70 p-8 text-center shadow-[0_10px_30px_rgba(45,106,79,0.06)]">
              <h2 className="text-2xl font-semibold text-[#1b1c19]">
                No meals yet
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[#404943]">
                Set your people and day count, then click Generate plan to get
                breakfast, lunch, and dinner suggestions with ingredients.
              </p>
            </section>
          )}

          {loading && (
            <section className="rounded-4xl border border-white/70 bg-white/88 p-7 shadow-[0_16px_60px_rgba(45,106,79,0.08)]">
              <p className="text-sm font-medium text-[#404943]">
                Building your meal plan...
              </p>
            </section>
          )}

          <section className="space-y-4">
            {orderedDays.map((day) => {
              const mealsForDay = groupedMeals[day];
              return (
                <div
                  key={day}
                  className="rounded-4xl border border-white/70 bg-white/88 p-7 shadow-[0_16px_60px_rgba(45,106,79,0.08)] backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-[#e4e2dd] pb-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[#0f5238]/70">
                        Day {day}
                      </p>
                      <h2 className="mt-1 text-2xl font-semibold text-[#1b1c19]">
                        Meals
                      </h2>
                    </div>
                    <span className="rounded-full bg-[#fc8a40]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#9b4500]">
                      {mealsForDay.length} meals
                    </span>
                  </div>

                  <div className="mt-6 grid gap-5">
                    {mealsForDay.map((meal) => (
                      <article
                        key={meal.id}
                        className="rounded-[28px] border border-[#e4e2dd] bg-[#fbf9f4] p-6"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#0f5238]/70">
                              {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                            </p>
                            <h3 className="mt-1 text-lg font-semibold text-[#1b1c19]">
                              {meal.name}
                            </h3>
                          </div>

                          <button
                            onClick={() =>
                              setExpanded(expanded === meal.id ? null : meal.id)
                            }
                            className="h-11 rounded-full border border-[#e4e2dd] bg-white px-5 text-sm font-medium text-[#1b1c19] transition hover:border-[#0f5238]/30 hover:bg-white"
                          >
                            {expanded === meal.id
                              ? "Hide ingredients"
                              : "Show ingredients"}
                          </button>
                        </div>

                        {expanded === meal.id && (
                          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                            {meal.ingredients.map((ing, i) => (
                              <li
                                key={i}
                                className="rounded-[22px] bg-white px-4 py-3 text-sm text-[#404943]"
                              >
                                {ing.name} · {ing.quantity}
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </section>

      {isGroceriesModalOpen && meals.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b130f]/45 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setIsGroceriesModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Grocery list"
        >
          <section
            className="w-full max-w-3xl rounded-4xl border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,255,255,0.86))] p-5 shadow-[0_28px_90px_rgba(45,106,79,0.20)] sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-[#e4e2dd] pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#0f5238]/70">
                  FreshPrep
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#1b1c19]">
                  Grocery list
                </h2>
                <p className="mt-1 text-sm text-[#404943]">
                  Everything aggregated from your current meal plan.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopy}
                  className="h-10 rounded-full border border-[#e4e2dd] bg-white px-4 text-sm font-medium text-[#1b1c19] transition hover:border-[#0f5238]/30"
                >
                  Copy
                </button>
                <button
                  onClick={() => setIsGroceriesModalOpen(false)}
                  className="h-10 rounded-full border border-[#e4e2dd] bg-white px-4 text-sm font-medium text-[#1b1c19] transition hover:border-[#0f5238]/30"
                >
                  Close
                </button>
              </div>
            </div>

            {copyMessage && (
              <p className="mt-3 rounded-xl bg-[#0f5238]/8 px-3 py-2 text-sm text-[#0f5238]">
                {copyMessage}
              </p>
            )}

            <div className="mt-5 max-h-[65vh] overflow-y-auto pr-1">
              <div className="mb-4 inline-flex rounded-full bg-[#0f5238]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f5238]">
                {Object.keys(groceryMap).length} items
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(groceryMap).map(([name, qty]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-3xl border border-[#e4e2dd] bg-[#fbf9f4] px-5 py-4"
                  >
                    <span className="font-medium text-[#1b1c19]">{name}</span>
                    <span className="text-sm text-[#404943]">{Math.round(qty)}g</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
