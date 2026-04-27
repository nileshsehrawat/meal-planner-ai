import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { generateMeals } from "@/lib/meal-generator";
import type { MealPlanDay } from "@/lib/meal-generator";
import { generateMealsAI } from "@/lib/ai";

const corsHeaders = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as {
    user?: {
      id?: string;
    };
  } | null;

  if (!session?.user?.id) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: corsHeaders },
    );
  }
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return Response.json(
      { error: "User not found" },
      { status: 404, headers: corsHeaders },
    );
  }

  const { days } = await req.json();

  if (!days || days < 1 || days > 7) {
    return Response.json(
      { error: "Days must be between 1 and 7" },
      { status: 400, headers: corsHeaders },
    );
  }

  // generate meals
  let generated: MealPlanDay[];

  try {
    generated = await generateMealsAI(days, user.peopleCount);
  } catch (err) {
    console.error("AI failed, using fallback:", err);
    generated = generateMeals(days);
  }

  // create meal plan
  const mealPlan = await db.mealPlan.create({
    data: {
      userId: session.user.id,
      days,
      meals: {
        create: generated.flatMap((dayPlan) => [
          {
            day: dayPlan.day,
            mealType: "BREAKFAST",
            name: dayPlan.meals.breakfast.name,
            ingredients: dayPlan.meals.breakfast.ingredients,
          },
          {
            day: dayPlan.day,
            mealType: "LUNCH",
            name: dayPlan.meals.lunch.name,
            ingredients: dayPlan.meals.lunch.ingredients,
          },
          {
            day: dayPlan.day,
            mealType: "DINNER",
            name: dayPlan.meals.dinner.name,
            ingredients: dayPlan.meals.dinner.ingredients,
          },
        ]),
      },
    },
    include: {
      meals: true,
    },
  });

  return Response.json({ mealPlan }, { headers: corsHeaders });
}
