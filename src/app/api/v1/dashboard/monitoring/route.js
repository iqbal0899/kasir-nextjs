import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  const start = performance.now();

  try {

    // validasi sudah login

    const cookieStore = await cookies();
    
        const token = cookieStore.get("token")?.value;
    
        if (!token) {
          return NextResponse.json(
            {
              success: false,
              message: "Unauthorized",
            },
            {
              status: 401,
            }
          );
        }
    
        const user = jwt.verify(
          token,
          process.env.JWT_SECRET
        );

    await prisma.$queryRaw`SELECT 1`;

    const dbResponseTime = Math.round(performance.now() - start);

    const [products, transactions] = await Promise.all([
      prisma.product.count({
        where: {
          isActive: true,
        },
      }),
      prisma.transaction.count(),
    ]);

    const responseTime = Math.round(performance.now() - start);

    return NextResponse.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),

      server: {
        status: "healthy",
        responseTime: `${responseTime}ms`,
      },

      database: {
        status: "healthy",
        responseTime: `${dbResponseTime}ms`,
      },

      application: {
        products,
        transactions,
      },
    });
  } catch (error) {
    console.error("MONITORING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        status: "unhealthy",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}