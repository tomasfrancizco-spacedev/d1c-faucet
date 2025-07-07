// app/api/recaptcha/route.ts

import { verifyRecaptcha } from "@/utils/recaptcha";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ message: "Only POST requests allowed" }),
      { status: 405 },
    );
  }

  const data = await req.json();
  const { token } = data;

  if (!token) {
    return new Response(JSON.stringify({ message: "Token not found" }), {
      status: 405,
    });
  }

  try {
    const isValid = await verifyRecaptcha(token);

    if (isValid) {
      return new Response(JSON.stringify({ message: "Success" }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ message: "Failed to verify" }), {
        status: 405,
      });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}