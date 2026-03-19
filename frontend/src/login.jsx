import { useState } from "react";

function Login({ onLoginSuccess, openRegister }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ API from env
  const API = import.meta.env.VITE_API_URL;

  const handleLogin = async () => {

    if (!email || !password) return;

    setLoading(true);

    try {

      const res = await fetch(`${API}/api/auth/login`, {   // ✅ FIXED
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {

        localStorage.setItem("token", data.token);

        if (onLoginSuccess) {
          onLoginSuccess(data.token);
        }

        window.location.reload();

      } else {
        console.error("Login failed:", data);
      }

    } catch (err) {

      console.error("Error:", err);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="authModal">

      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
      />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="authSwitch">
        Don't have an account?
        <span onClick={openRegister}> Register</span>
      </p>

    </div>

  );

}

export default Login;