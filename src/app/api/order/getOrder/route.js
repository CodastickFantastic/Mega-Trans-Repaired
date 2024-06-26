import { verifyJwt } from "@/helpers/generateJwToken";
import prisma from "@/helpers/prismaClient";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // Check if user is authorized to call this endpoint
  const accessToken = req.headers.get("Authorization");

  if (!accessToken || !verifyJwt(accessToken)) {
    console.error("JwtError:Get Order Error");
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    // Check if requested order exists
    const order = await prisma.order.findUnique({
      where: {
        orderId: id,
      },
      include: {
        packages: true,
        user: {
          select: {
            company: true,
            phone: true,
          },
        },
      },
    });
    if (!order) {
      throw new Error("Nie znaleziono zamówienia");
    }

    // Check if user is authorized to view this order
    if ((order && order.userId === verifyJwt(accessToken).id.id) || verifyJwt(accessToken).id.role === "ADMIN") {
      return new Response(JSON.stringify({ order }), { status: 200 });
    } else {
      throw new Error("Nie jestesteś upoważniony do wyświetlenia tego zamówienia");
    }
  } catch (error) {
    // Send Error response
    console.error("Get Order Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
