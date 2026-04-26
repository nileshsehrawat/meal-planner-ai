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
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showGroceries, setShowGroceries] = useState(false);

  const handleGenerate = async () => {
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

      // 👇 store meals
      setMeals(data.mealPlan.meals);
      setShowGroceries(false);
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

  // 🛒 Grocery aggregation
  const groceryMap: Record<string, number> = {};

  meals.forEach((meal) => {
    meal.ingredients.forEach((ing) => {
      const qty = parseInt(ing.quantity); // simple parse
      if (!groceryMap[ing.name]) groceryMap[ing.name] = 0;
      groceryMap[ing.name] += qty;
    });
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Meal Planner</h2>

      {/* Inputs */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="number"
          value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
          min={1}
        />

        <input
          type="number"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          min={1}
          max={7}
        />

        <button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </div>

      {/* Grocery Button */}
      {meals.length > 0 && (
        <button onClick={() => setShowGroceries(!showGroceries)}>
          {showGroceries ? "Hide Groceries" : "Get Groceries"}
        </button>
      )}

      {/* Grocery List */}
      {showGroceries && (
        <div style={{ marginTop: 20 }}>
          <h3>🛒 Grocery List</h3>
          <ul>
            {Object.entries(groceryMap).map(([name, qty]) => (
              <li key={name}>
                {name} - {qty}g
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meals */}
      {Object.entries(groupedMeals).map(([day, meals]) => (
        <div key={day} style={{ marginTop: 20 }}>
          <h3>Day {day}</h3>

          {meals.map((meal) => (
            <div
              key={meal.id}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
              }}
            >
              <strong>
                {meal.mealType}: {meal.name}
              </strong>

              <br />

              <button
                onClick={() =>
                  setExpanded(expanded === meal.id ? null : meal.id)
                }
              >
                {expanded === meal.id ? "Hide Ingredients" : "Show Ingredients"}
              </button>

              {expanded === meal.id && (
                <ul>
                  {meal.ingredients.map((ing, i) => (
                    <li key={i}>
                      {ing.name} - {ing.quantity}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
