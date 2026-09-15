import { NextResponse } from "next/server";

import { createAuditLog } from "@/backend/service/audit.service";

export async function GET(request) {
  try {
    const audit = await createAuditLog({
      userId: 1,
      username: "test-admin",
      role: "admin",
      action: "TEST_AUDIT",
      entity: "Test",
      entityId: "1",
      details: {
        message: "Testing audit log",
        source: "audit test endpoint",
      },
      ipAddress:
        request.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent:
        request.headers.get("user-agent") || null,
    });

    return NextResponse.json({
      success: true,
      message: "Test audit log berhasil",
      data: audit,
    });
  } catch (error) {
    console.error("TEST AUDIT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}