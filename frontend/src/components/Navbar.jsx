import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/Slice/authSlice";

import "../styles/navbar.css";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.cartItems);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // 🔥 Redux logout
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img
            src="/ShopNestLogo.png"
            alt="ShopNest"
            style={{
              height: "36px",
              width: "36px",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
          ShopNest
        </Link>
      </div>

      <ul className="navbar-links">
        <li><Link to="/shop">Shop</Link></li>

        <li>
          <Link to="/cart">Cart ({cartItems.length})</Link>
        </li>

        {user ? (
          <>
            <li>
              <Link to="/profile">Hi, {user?.name}</Link>
            </li>

            {user?.role === "admin" && (
              <li><Link to="/admin">Admin</Link></li>
            )}

            <li>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/login">Login</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;