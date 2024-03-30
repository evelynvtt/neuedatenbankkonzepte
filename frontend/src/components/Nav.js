import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import "./all.css";
import { AuthContext } from "../contexts/AuthContext";

function Nav() {
  const { isLoggedIn, logout, userId } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white top">
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navMainMenu"
        aria-controls="navMainMenu"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <div id="navMainMenu" className="navbar-collapse collapse">
        <div className="navbar-nav">
          <NavLink
            to="/"
            exact
            className="nav-item nav-link"
            activeClassName="active"
          >
            Home
          </NavLink>
          <NavLink
            to="/tweets"
            className="nav-item nav-link"
            activeClassName="active"
          >
            Posts
          </NavLink>

          {!isLoggedIn && (
            <NavLink
              to="/register"
              className="nav-item nav-link"
              activeClassName="active"
            >
              Register
            </NavLink>
          )}

          {isLoggedIn ? (
            <>
              <NavLink
                to={`/profile/${userId}`}
                className="nav-item nav-link"
                activeClassName="active"
              >
                Profile
              </NavLink>
              <button
                onClick={logout}
                className="nav-item nav-link btn btn-link"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="nav-item nav-link"
              activeClassName="active"
            >
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Nav;
