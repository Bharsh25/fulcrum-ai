    import { useState } from "react";
    import { useNavigate, Link } from "react-router-dom";
    import "./Login.css";
    import fulcrumLogo from "./assets/fulcrumlogo.png"; // adjust path if needed

    export default function Login({setToken }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok && data.token) {

            localStorage.setItem("token", data.token);
            setToken(data.token);
            navigate("/"); // go to main app

        } else {
            alert(data.message || "Login failed");
        }

        } catch (err) {
        console.error(err);
        alert("Server error");
        }
    };

    return (
        <div className="login-container">

        <form onSubmit={handleLogin} className="login-box">

            {/* Logo + Title */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
                src={fulcrumLogo}
                alt="Fulcrum AI"
                style={{ width: "28px", height: "28px", filter: "invert(1)" }}
            />
            <h2>Fulcrum AI</h2>
            </div>

            {/* Subtitle */}
            <p className="tagline">
            Your intelligent assistant for conversations, ideas and productivity.
            </p>

            {/* Email */}
            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            />

            {/* Password */}
            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
            />

            {/* Button */}
            <button type="submit">
            Login
            </button>

            {/* Footer */}
            <p>
            New user?{" "}
            <Link to="/register">
                Create account
            </Link>
            </p>

        </form>

        </div>
    );
    }