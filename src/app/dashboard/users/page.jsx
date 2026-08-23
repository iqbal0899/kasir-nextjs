import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

import UsersPageClient from "./UsersPageClient";

export default async function UsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (user.role !== "admin") {
      redirect("/dashboard");
    }

    return <UsersPageClient />;
  } catch (error) {
    console.error("USER AUTH ERROR:", error);

    redirect("/login");
  }
}