"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import styles from "../../../frontend/css/User.module.css";

export default function UsersPageClient() {
  const [form, setForm] = useState({
  username: "",
  password: "",
  role: "cashier",
});

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    const response = await fetch("/api/v1/users");

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal mengambil data user");
    }

    return data.data || [];
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);

        const data = await fetchUsers();

        setUsers(data);
      } catch (error) {
        console.error("FETCH USERS ERROR:", error);

        toast.error(error.message || "Gagal mengambil data user");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // =========================
  // INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // TAMBAH / EDIT USER
  // =========================
  const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {
    let url = "/api/v1/users/register";
    let method = "POST";

    // EDIT USER
    if (editingId) {
      url = `/api/v1/users/${editingId}`;
      method = "PUT";
    }

    console.log("DATA YANG DIKIRIM:", form);

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const contentType = response.headers.get("content-type");

    let data;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();

      console.error("SERVER RESPONSE:", text);

      throw new Error(
        `Server mengembalikan response bukan JSON (${response.status})`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          (editingId
            ? "Gagal mengubah user"
            : "Gagal menambahkan user")
      );
    }

    toast.success(
      editingId
        ? "User berhasil diubah!"
        : "User berhasil ditambahkan!"
    );

    setForm({
      username: "",
      password: "",
      role: "cashier",
    });

    setEditingId(null);

    const usersData = await fetchUsers();
    setUsers(usersData);

  } catch (error) {
    console.error("USER ERROR:", error);

    toast.error(
      error.message || "Terjadi kesalahan"
    );

  } finally {
    setLoading(false);
  }
};

  const handleEdit = (user) => {
    setEditingId(user.id);

    setForm({
      username: user.username,
      password: "",
      role: user.role || "cashier",
    });

    // Scroll ke form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);

    setForm({
      username: "",
      password: "",
      role: "cashier",
    });
  };


const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Hapus User?",
    text: "User yang dihapus tidak dapat dikembalikan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    setDeleting(true);

    const response = await fetch(`/api/v1/users/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Gagal menghapus user"
      );
    }

    await Swal.fire({
      title: "Berhasil!",
      text: "User berhasil dihapus.",
      icon: "success",
      timer: 1200,
      showConfirmButton: false,
    });

    window.location.reload();

  } catch (error) {
    Swal.fire({
      title: "Gagal!",
      text: error.message,
      icon: "error",
      confirmButtonText: "OK",
    });
  } finally {
    setDeleting(false);
  }
};

  return (
    <main className={styles.container}>
      {/* =========================
          FORM TAMBAH / EDIT USER
      ========================= */}
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>{editingId ? "Edit User" : "Tambah User"}</h1>

          <p>
            {editingId
              ? "Ubah informasi user."
              : "Tambahkan user baru ke sistem kasir."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              name="username"
              placeholder="Masukkan username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder={
                editingId
                  ? "Kosongkan jika tidak ingin mengubah password"
                  : "Masukkan password"
              }
              value={form.password}
              onChange={handleChange}
              required={!editingId}
              minLength={editingId ? undefined : 6}
            />
          </div>

          <div className={styles.formGroup}>
  <label htmlFor="role">
    Role
  </label>

  <select
    id="role"
    name="role"
    value={form.role}
    onChange={handleChange}
    required
  >
    <option value="cashier">
      Kasir
    </option>

    <option value="admin">
      Admin
    </option>
  </select>
</div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.button} disabled={loading}>
              {loading
                ? "Procesing..."
                : editingId
                  ? "Simpan Perubahan"
                  : "Tambah User"}
            </button>

            {editingId && (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancelEdit}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      <div className={styles.userTableCard}>
        <div className={styles.tableHeader}>
          <div>
            <h2>Daftar User</h2>

            <p>Daftar user yang terdaftar dalam sistem kasir.</p>
          </div>

          <span className={styles.userCount}>{users.length} User</span>
        </div>

        {loadingUsers ? (
          <div className={styles.loading}>Memuat data user...</div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>Belum ada user.</div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Dibuat</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>

                    <td>{user.id}</td>

                    <td>
                      <strong>{user.username}</strong>
                    </td>

                    <td>
                      <span
                        className={
                          user.role === "admin"
                            ? styles.adminBadge
                            : styles.kasirBadge
                        }
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("id-ID")
                        : "-"}
                    </td>

                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>

                        <button
  type="button"
  className={styles.deleteButton}
  disabled={deleting}
  onClick={() => handleDelete(user.id)}
>
  {deleting ? "Prosecing..." : "Delete"}
</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
