import "../../css/Navbar.css";
import Link from "next/link";

export default function Navbar({ storeName = "Toko Iqbal", userName, onLogout }) {
  return (
    <header className="navbar">
      <span className="navbar-store">{storeName}</span>

      <div className="navbar-user">
        {userName && <span className="navbar-username">{userName}</span>}
        <Link href="/auth/login">
        <button className="navbar-logout" onClick={onLogout}>
          Keluar
        </button>
        </Link>
      </div>
    </header>
  );
}
