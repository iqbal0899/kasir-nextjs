export async function loginUser({ username, password }) {
  const response = await fetch("/api/v1/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const result = await response.json();

  console.log("Login Status", response.status);
  console.log("Login Response", result);

  if (!response.ok) {
    throw new Error(
      result.message || "Login gagal"
    );
  }

  return result;
}