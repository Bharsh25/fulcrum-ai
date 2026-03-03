    import { use, useState } from "react";
    import { useNavigate, Link } from "react-router-dom";
    import "./Login.css";

    export default function Register({setToken}) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    const navigate = useNavigate();

        const handleRegister = async (e) => {
    e.preventDefault();

    try {

        const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (res.ok && data.token) {

        localStorage.setItem("token", data.token);
        setToken(data.token);
        navigate("/");

        } else {

        alert(data.message);

        }

    } catch (err) {
        console.error(err);
    }
};

    return (
        <div className="login-container">
        <form onSubmit={handleRegister} className="login-box">

            <h2>Create Account</h2>


            <input
            type="username"
            placeholder="Username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            required
            />

            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            />

            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
            />

            <button type="submit">Register</button>

            <p>
            Already have an account? <Link to="/login">Login</Link>
            </p>

        </form>
        </div>
    );
    }