export type Ingredient = {
  name: string;

  quantity: string;
};

export type Meal = {
  name: string;

  ingredients: Ingredient[];
};

export type MealPlanDay = {
  day: number;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
  };
};

const breakfastOptions: Meal[] = [
  {
    name: "Poha",

    ingredients: [
      { name: "Poha", quantity: "100g" },

      { name: "Onion", quantity: "1" },
    ],
  },

  {
    name: "Oats",

    ingredients: [
      { name: "Oats", quantity: "50g" },

      { name: "Milk", quantity: "200ml" },
    ],
  },
];

const lunchOptions: Meal[] = [
  {
    name: "Dal Rice",

    ingredients: [
      { name: "Rice", quantity: "200g" },

      { name: "Dal", quantity: "100g" },
    ],
  },

  {
    name: "Paneer Roti",

    ingredients: [
      { name: "Paneer", quantity: "150g" },

      { name: "Flour", quantity: "200g" },
    ],
  },
];

const dinnerOptions: Meal[] = [
  {
    name: "Khichdi",

    ingredients: [
      { name: "Rice", quantity: "100g" },

      { name: "Dal", quantity: "100g" },
    ],
  },

  {
    name: "Veg Curry",

    ingredients: [
      { name: "Mixed Veg", quantity: "200g" },

      { name: "Spices", quantity: "10g" },
    ],
  },
];

function getRandom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMeals(days: number): MealPlanDay[] {
  const result: MealPlanDay[] = [];

  for (let day = 1; day <= days; day++) {
    result.push({
      day,
      meals: {
        breakfast: getRandom(breakfastOptions),
        lunch: getRandom(lunchOptions),
        dinner: getRandom(dinnerOptions),
      },
    });
  }
  return result;
}
