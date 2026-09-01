export async function loginUser(username, password) {
  console.log("AUTH API:", {
    username,
    passwordAda: !!password,
  });

  const response = await fetch(
    "/api/v1/users/login",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Login gagal"
    );
  }

  // Simpan data user untuk kebutuhan UI
  localStorage.setItem(
    "user",
    JSON.stringify(result.user)
  );

  return result;
}