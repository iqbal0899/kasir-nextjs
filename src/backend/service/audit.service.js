import { prisma } from "@/lib/prisma";

export async function createAuditLog({
  userId,
  username,
  role,
  action,
  entity,
  entityId,
  details,
  ipAddress,
  userAgent,
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: userId ? Number(userId) : null,
        username: username || null,
        role: role || null,
        action,
        entity: entity || null,
        entityId:
          entityId !== undefined && entityId !== null
            ? String(entityId)
            : null,
        details: details || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (error) {
    console.error("CREATE AUDIT LOG ERROR:", error);

    // Audit gagal tidak boleh membuat transaksi utama gagal
    return null;
  }
}