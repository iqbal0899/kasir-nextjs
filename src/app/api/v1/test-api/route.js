import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = performance.now();

  await prisma.$queryRaw`SELECT 1`;

  const duration = performance.now() - start;

  console.log(
    `DB SELECT 1: ${duration.toFixed(2)} ms`
  );

  return Response.json({
    success: true,
    duration: `${duration.toFixed(2)} ms`,
  });
}