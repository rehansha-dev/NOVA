import {
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  User,
  X,
} from "lucide-react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";

import { getCurrentUser, logoutUser } from "../utils/auth";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentUser = getCurrentUser();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const handleLogout = () => {
    logoutUser();
    setShowProfile(false);
    closeMobileMenu();
    navigate("/login");
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* BRAND */}
        <Link
          to="/"
          className="brand"
          onClick={closeMobileMenu}
        >
          <span className="brand-mark">
            <Sparkles size={15} />
          </span>

          <span>NOVA</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/discover">
            Discover
          </NavLink>

          <NavLink to="/calendar">
            Calendar
          </NavLink>

          <NavLink to="/saved">
            Saved
          </NavLink>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="nav-actions">

          <button
            className="search-button"
            aria-label="Search"
          >
            <Search size={17} />
          </button>

          <Link
            to="/create"
            className="create-button"
          >
            <Plus size={16} />
            Create Event
          </Link>

          {/* PROFILE */}
          {currentUser ? (
            <div className="profile-wrapper">

              <button
                className="profile-button"
                onClick={() =>
                  setShowProfile((current) => !current)
                }
                aria-label="Open profile"
              >
                {currentUser.name
                  .charAt(0)
                  .toUpperCase()}
              </button>

              {showProfile && (
                <div className="profile-menu">

                  <div className="profile-menu-user">
                    <div className="profile-menu-icon">
                      <User size={17} />
                    </div>

                    <div>
                      <strong>
                        {currentUser.name}
                      </strong>

                      <span>
                        {currentUser.department ||
                          "Student"}
                      </span>
                    </div>
                  </div>

                  <div className="profile-menu-divider" />

                  <button
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>

                </div>
              )}

            </div>
          ) : (
            <Link
              to="/login"
              className="profile-button"
              aria-label="Login"
            >
              K
            </Link>
          )}

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="mobile-menu-button"
          onClick={() =>
            setShowMobileMenu((current) => !current)
          }
          aria-label={
            showMobileMenu
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={showMobileMenu}
        >
          {showMobileMenu ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}
        </button>

      </div>

      {/* MOBILE MENU */}
      {showMobileMenu && (
        <div className="mobile-menu">

          <nav className="mobile-nav-links">

            <NavLink
              to="/"
              end
              onClick={closeMobileMenu}
            >
              Home
            </NavLink>

            <NavLink
              to="/discover"
              onClick={closeMobileMenu}
            >
              Discover
            </NavLink>

            <NavLink
              to="/calendar"
              onClick={closeMobileMenu}
            >
              Calendar
            </NavLink>

            <NavLink
              to="/saved"
              onClick={closeMobileMenu}
            >
              Saved
            </NavLink>

          </nav>

          <div className="mobile-menu-divider" />

          <Link
            to="/create"
            className="mobile-create-button"
            onClick={closeMobileMenu}
          >
            <Plus size={17} />
            Create Event
          </Link>

          {currentUser && (
            <div className="mobile-profile">

              <div className="mobile-profile-info">
                <div className="mobile-profile-avatar">
                  {currentUser.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {currentUser.name}
                  </strong>

                  <span>
                    {currentUser.department ||
                      "Student"}
                  </span>
                </div>
              </div>

              <button
                className="mobile-logout-button"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>

            </div>
          )}

        </div>
      )}
    </header>
  );
}

export default Navbar;