import "../../css/Navbar.css";

/**
 * Navbar atas — nama toko, user aktif, tombol logout.
 *
 * Props:
 * - storeName: string
 * - userName: string
 * - onLogout: () => void
 */
export default function Navbar({ storeName = "Toko Iqbal", userName, onLogout }) {
  return (
    <header className="navbar">
      <span className="navbar-store">{storeName}</span>

      <div className="navbar-user">
        {userName && <span className="navbar-username">{userName}</span>}
        <button className="navbar-logout" onClick={onLogout}>
          Keluar
        </button>
      </div>
    </header>
  );
}
