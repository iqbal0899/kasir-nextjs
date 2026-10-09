export async function loginUser(username, password) {
  const response = await fetch("/api/v1/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ username, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Login gagal");
  }

  localStorage.setItem("user", JSON.stringify(result.user));

  return result;
}


export async function getMe() {
  const response = await fetch("/api/v1/auth/me", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      result.message || "Gagal memeriksa sesi"
    );
    error.status = response.status;
    throw error;
  }

  if (!result.success || !result.user) {
    const error = new Error("Sesi login tidak valid.");
    error.status = 401;
    throw error;
  }

  return result.user;
}

export async function logoutUser() {
  const response = await fetch("/api/v1/auth/logout", {
    method: "POST",
    credentials: "same-origin",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Logout gagal");
  }

  localStorage.removeItem("user");

  return result;
}

