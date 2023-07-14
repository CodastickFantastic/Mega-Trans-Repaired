import prisma from "@/helpers/prismaClient";
import Bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
  const requestBody = await request.json();

  try {
    // Check if all required fields are filled
    if (!requestBody.email) throw new Error("Please enter an email");
    if (!requestBody.password) throw new Error("Please enter a password");

    // Check if user already exists
    const user = await prisma.user.findUnique({
      where: {
        email: requestBody.email,
      },
    });
    if (!user) throw new Error("There is no user with this email");

    // Check if passwords match
    if (user && (await Bcrypt.compare(requestBody.password, user.password))) {
      const { password, ...userWithoutPassword } = user; 

      // Send Success response
      return NextResponse.json({ user: userWithoutPassword });
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    // Send Error response
    console.error("LoginPageError: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}