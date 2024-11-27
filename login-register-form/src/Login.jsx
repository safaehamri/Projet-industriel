import React, { useState } from "react";
import axios from "axios";

export const Login = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:4000/login", {
        username,
        password
      });

      const { token, user_type, user_id } = response.data;

      // Save the token to the local storage
      localStorage.setItem("token", token);

      // Perform necessary actions with the token, user_type, user_id
      console.log("Token:", token);
      console.log("User Type:", user_type);
      console.log("User ID:", user_id);

      // Redirect to the dashboard and pass the token in the URL
      window.location.href = `http://127.0.0.1:5000?value=${encodeURIComponent(token)}`;
    } catch (error) {
      setError("Authorization Failed!");
      console.log("Error:", error);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Username"
          id="username"
          name="username"
        />
        <label htmlFor="password">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          id="password"
          name="password"
        />
        {error && <p>{error}</p>}
        <button type="submit">Log In</button>
      </form>
      <button
        className="link-btn"
        onClick={() => props.onFormSwitch("register")}
      >
        Don't have an account? Register here.
      </button>
    </div>
  );
};
