import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../redux/Slice/authSlice.js";

import "../styles/auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector(
    (state) => state.auth
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    dispatch(
      registerUser({
        name,
        email,
        password,
      })
    );
  };

  useEffect(() => {
    if (user) {
      alert(
        "Registration Successful! Please check your email for the Welcome OTP."
      );

      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Register</h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="btn"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        <p>
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;