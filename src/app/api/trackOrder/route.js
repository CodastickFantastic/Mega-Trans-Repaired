import prisma from "@/helpers/prismaClient";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    // Check if requested order exists
    let order = await prisma.order.findUnique({
      where: {
        orderId: id,
      },
      include: {
        packages: {
          select: { commodityName: true },
        },
        user: {
          select: { company: true },
        },
        courier: {
          select: { name: true, phone: true },
        },
      },
    });

    if (order) {
      order = {
        orderId: order.orderId,
        user: order.user,
        status: order.status,
        deliveryDate: order.deliveryDate,
        orderPostCode: order.orderPostCode,
        orderFlatNumber: order.orderFlatNumber,
        currency: order.currency,
        orderStreet: order.orderStreet,
        orderStreetNumber: order.orderStreetNumber,
        orderCity: order.orderCity,
        orderCountry: order.orderCountry,
        packages: order.packages,
        orderPayment: order.orderPayment,
        courier: order.courier,
        orderPaymentType: order.orderPaymentType,
        orderPrice: order.orderPrice,
      };

      return new Response(JSON.stringify({ order }), { status: 200 });
    } else {
      throw new Error("Nie znaleziono zamówienia o podanym numerze");
    }
  } catch (error) {
    // Send Error response
    console.error("Track Order Error: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
