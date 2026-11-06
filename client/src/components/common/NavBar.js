import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuIcon } from "@heroicons/react/solid";
import NAV_LINKS, { isActiveLink } from "./navLinks";

function NavItems({ pathname, onNavigate, itemClassName }) {
  return NAV_LINKS.map(({ to, label }) => (
    <li key={to} className={itemClassName}>
      <Link
        to={to}
        onClick={onNavigate}
        className={`px-4 py-2 hover:bg-blue-500 rounded ${isActiveLink(to, pathname) ? "bg-blue-500" : ""}`}
      >
        {label}
      </Link>
    </li>
  ));
}

export default function Navbar() {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-blue-600 w-full min-h-6">
      <nav className="bg-blue-600 p-4 hidden md:block">
        <ul className="flex justify-around text-white font-medium">
          <NavItems pathname={pathname} />
        </ul>
      </nav>

      <div className="md:hidden block p-4">
        <MenuIcon className="h-8 w-8 text-white cursor-pointer" onClick={() => setIsMenuOpen((open) => !open)} />
        {isMenuOpen && (
          <nav className="bg-blue-600 p-4">
            <ul className="text-white font-medium">
              <NavItems pathname={pathname} onNavigate={() => setIsMenuOpen(false)} itemClassName="mb-4" />
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
