import Link from "next/link";
import "../../css/Sidebar.css";

/**
 * Sidebar navigasi utama
 *
 * Props:
 * - menuItems: [{ label, icon, href, active }]
 */
export default function Sidebar({ menuItems = [] }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">

        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`sidebar-item ${
              item.active ? "sidebar-item--active" : ""
            }`}
          >
            {item.icon && (
              <span className="sidebar-icon">
                {item.icon}
              </span>
            )}

            <span>{item.label}</span>
          </Link>
        ))}

      </nav>
    </aside>
  );
}