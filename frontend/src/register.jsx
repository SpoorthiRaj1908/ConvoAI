import { useState } from "react";

function Register({ onRegisterSuccess, openLogin }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  const handleRegister = async () => {

    if (!name || !email || !password) return;

    setLoading(true);

    try {

      const res = await fetch(`${API}/api/auth/register`, {  
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {

        localStorage.setItem("token", data.token);

        if (onRegisterSuccess) {
          onRegisterSuccess(data.token);
        }

        window.location.reload();

      } else {
        console.error("Register failed:", data);
      }

    } catch (err) {

      console.error("Error:", err);

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="authModal">

      <h2>Register</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleRegister()}
      />

      <button onClick={handleRegister} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      <p className="authSwitch">
        Already have an account?
        <span onClick={openLogin}> Login</span>
      </p>

    </div>

  );

}

export default Register;