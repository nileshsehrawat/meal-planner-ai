import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ResponseSchema } from "@google/generative-ai";
import type { MealPlanDay } from "@/lib/meal-generator";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is required to generate meals with AI.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const ingredientSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    quantity: { type: SchemaType.STRING },
  },
  required: ["name", "quantity"],
} as ResponseSchema;

const mealSchema = {
  type: SchemaType.OBJECT,
  properties: {
    name: { type: SchemaType.STRING },
    ingredients: {
      type: SchemaType.ARRAY,
      items: ingredientSchema,
      minItems: 1,
    },
  },
  required: ["name", "ingredients"],
} as ResponseSchema;

const mealPlanSchema = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      day: { type: SchemaType.INTEGER },
      meals: {
        type: SchemaType.OBJECT,
        properties: {
          breakfast: mealSchema,
          lunch: mealSchema,
          dinner: mealSchema,
        },
        required: ["breakfast", "lunch", "dinner"],
      },
    },
    required: ["day", "meals"],
  },
  minItems: 1,
} as ResponseSchema;

export async function generateMealsAI(
  days: number,
  people: number,
): Promise<MealPlanDay[]> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: mealPlanSchema,
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  });

  const prompt = `Generate a strictly vegetarian ${days}-day meal plan for ${people} people. Return one breakfast, one lunch, and one dinner per day. Quantities should be realistic for a ${people}-person household and ingredients must be vegetarian only.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text) as MealPlanDay[];
}
