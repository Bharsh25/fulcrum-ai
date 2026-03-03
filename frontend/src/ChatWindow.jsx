import './ChatWindow.css';
import Chat from './Chat';
import { MyContext } from './MyContext.jsx';
import { useContext, useState, useEffect } from 'react';
import { RingLoader } from 'react-spinners';
import { useNavigate } from "react-router-dom";
import logo from "./assets/fulcrum-logo2.png";
import { jwtDecode } from "jwt-decode";

export default function ChatWindow() {

    const {
        prompts, setprompts,
        reply, setReply,
        currentThreadId,
        prevChat, setPrevChat,
        setNewChat, setAllThreads
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();

    const suggestions = [
        "Help me brainstorm ideas for a new project",
        "Explain quantum computing in simple terms",
        "Write a Python script to automate tasks",
        "Analyze market trends for 2026"
    ];

    const getReply = async () => {

        if (!prompts.trim()) return;

        setLoading(true);
        setNewChat(false);

        const token = localStorage.getItem("token");

        try {
            const response = await fetch('http://localhost:8080/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: prompts,
                    threadId: currentThreadId
                })
            });

            const data = await response.json();
            setReply(data.reply);

            setAllThreads(prev => {
                const exists = prev.some(t => t.threadId === currentThreadId);
                if (exists) return prev;

                return [
                    {
                        threadId: currentThreadId,
                        title: prompts.slice(0, 30) || "New Chat"
                    },
                    ...prev
                ];
            });

        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    useEffect(() => {
        if (prompts && reply) {
            setPrevChat(prev => [
                ...prev,
                { role: 'user', content: prompts },
                { role: 'assistant', content: reply }
            ]);
        }
        setprompts('');
    }, [reply]
    

);

    const [user, setUser] = useState(null);
    
        useEffect(() => {
    
        const token = localStorage.getItem("token");
    
        if (token) {
            const decoded = jwtDecode(token);
                setUser(decoded);
        }

    }, []);

    const showWelcome = prevChat.length === 0;

    return (
        <div className="chatWindow">

            {/* NAVBAR */}
            <div className="navbar">

    <span className="logoText">FULCRUM AI</span>

    <div className="userMenu">

        <div
            className="userIcon"
            onClick={() => setIsOpen(!isOpen)}>
            {user?.username?.charAt(0).toUpperCase()}
        </div>

        {isOpen && (
            <div className="dropDown">
                <div className="dropDownItem">
                    Upgrade Plan <i className="fa-solid fa-up-right-from-square"></i>
                </div>

                <div className="dropDownItem">
                    Settings <i className="fa-solid fa-gear"></i>
                </div>

                <div
                    className="dropDownItem"
                    onClick={() => {
                        localStorage.removeItem("token");
                        setIsOpen(false);
                        navigate("/login");
                    }}
                >
                    Logout <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </div>
            </div>
        )}

    </div>

</div>
            {/* BODY */}
            <div className="chatBody">

                {showWelcome ? (
                    <div className="welcomeSection">

                        <div className="welcomeIcon"><img src={logo} alt="Logo" className="logo" /></div>

                        <h1>Welcome to FULCRUM AI</h1>

                        <p>
                            Your personal AI assistant for all your needs.
                            Start a new chat to explore the possibilities!
                        </p>

                        <div className="suggestions">
                            {suggestions.map((text, i) => (
                                <div
                                    key={i}
                                    className="suggestionCard"
                                    onClick={() => setprompts(text)}
                                >
                                    {text}
                                </div>
                            ))}
                        </div>

                    </div>
                ) : (
                    <Chat />
                )}
                </div>

<div className="loadWrapper">
                {loading && <RingLoader color="#ffffff" />}
            </div>

            {/* INPUT */}
            <div className="chatInput">

                <div className="inputBox">

                    <input
                        type="text"
                        placeholder="Type your message here..."
                        value={prompts}
                        onChange={(e) => setprompts(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && getReply()}
                    />

                    <div className="sendBtn" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>

                <p className="info">
                    Powered by OpenAI — Fulcrum AI can Make Mistakes Check Important Info. Cookie Preferences
                </p>

            </div>

        </div>
    );
}