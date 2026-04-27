import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 },
    );
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        peopleCount: 1,
        allergies: [],
      },
    });

    return Response.json({
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return Response.json(
      { error: "Could not create account right now." },
      { status: 500 },
    );
  }
}
