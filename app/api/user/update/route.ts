import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

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
  const session = (await getServerSession(authOptions)) as
    | {
        user?: {
          id?: string;
        };
      }
    | null;

  if (!session?.user?.id) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: corsHeaders },
    );
  }

  const { peopleCount } = await req.json();

  if (!peopleCount || peopleCount < 1 || peopleCount > 10) {
    return Response.json(
      { error: "Invalid people count" },
      { status: 400, headers: corsHeaders },
    );
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { peopleCount },
  });

  return Response.json({ user }, { headers: corsHeaders });
}
