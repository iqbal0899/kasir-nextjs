import jwt from "jsonwebtoken";

const ROLE_LEVEL = {
  cashier: 1,
  admin: 2,
  super_admin: 3,
};

export function getTokenFromRequest(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  return token;
}

export function verifyToken(request) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return null;
    }

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("VERIFY TOKEN ERROR:", error);
    return null;
  }
}

export function hasRole(userRole, requiredRole) {
  return (
    ROLE_LEVEL[userRole] >= ROLE_LEVEL[requiredRole]
  );
}

export function isSuperAdmin(userRole) {
  return userRole === "super_admin";
}

export function isAdmin(userRole) {
  return (
    userRole === "admin" ||
    userRole === "super_admin"
  );
}

export function requireRole(request, allowedRoles = []) {
  const user = verifyToken(request);

  if (!user) {
    return {
      authorized: false,
      status: 401,
      message: "Unauthorized",
      user: null,
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      authorized: false,
      status: 403,
      message: "Akses ditolak",
      user,
    };
  }

  return {
    authorized: true,
    status: 200,
    message: "Authorized",
    user,
  };
}
