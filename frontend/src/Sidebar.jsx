import "./Sidebar.css"
import {MyContext} from "./MyContext.jsx"
import { useState,useContext,useEffect } from "react";
import {v4 as uuidv4} from 'uuid';
import { jwtDecode } from "jwt-decode";


export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
    const {allThreads, setAllThreads,currentThreadId,setNewChat,setprompts,setReply,setCurrentThreadId,setPrevChat} = useContext(MyContext);

    const getThreads=async()=>{
        
        try{
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/threads`);
            const data = await response.json();
            const filteredData=data.map(thread=>({
                threadId: thread.threadId,
                title: thread.title
            }));
            console.log("Fetched threads:", filteredData);
            setAllThreads(filteredData);
            
        }
        catch(error){
            console.error("Error fetching threads:", error);
        }
    };

    useEffect(()=>{
        getThreads();
    },[currentThreadId]);// This effect runs whenever the currentThreadId changes. It calls the getThreads function to fetch the list of threads from the server and updates the allThreads state with the fetched data. By including currentThreadId in the dependency array, we ensure that the thread list is refreshed whenever a different thread is selected, allowing us to display the most up-to-date list of threads in the sidebar.

    const handleNewChat = () => {
    setNewChat(true);
    setprompts("");
    setReply(null);
    setCurrentThreadId(uuidv4()); // Set the state
    setPrevChat([]);
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
};

const changeThread = async (newthreadId) => {
    console.log("Clicked:", newthreadId);
    setCurrentThreadId(newthreadId); 
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/threads/${newthreadId}`);
            const data = await response.json();
            setPrevChat(data);
            setNewChat(false);
            setReply(null);
            if (window.innerWidth <= 768) setIsSidebarOpen(false);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    
};

const handleDeleteThread = async (threadId) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/threads/${threadId}`, {method: 'DELETE'});
            const data = await response.json();
        
            // Remove the thread from local state
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            // If the deleted thread was the current one, reset the chat window
            if (currentThreadId === threadId) {
                handleNewChat();
            }

        }catch (error) {
        console.error("Error deleting thread:", error);
    }
};
    const [user, setUser] = useState(null);

    useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {
        const decoded = jwtDecode(token);
            setUser(decoded);
    }

}, []);


    return (
        <>
            {isSidebarOpen && (
                <div 
                    className="sidebar-backdrop" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
            <section className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>

        {/* TOP */}
        <div className="topSection">

            <div className="newChatRow">

                <div className="newChatBtn" onClick={handleNewChat}>
                    <i className="fa-solid fa-plus"></i>
                </div>
                <span className="newChatText">New Chat</span>
            </div>

            <p className="recentLabel">RECENT</p>

            <ul className="history">

                {allThreads?.map((thread) => (

                    <li
                        key={thread.threadId}
                        onClick={() => changeThread(thread.threadId)}
                        className={thread.threadId === currentThreadId ? "highlighted" : ""}
                    >
                        <span className="threadTitle">{thread.title}</span>

                        <i
                            className="fa-solid fa-trash deleteIcon"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteThread(thread.threadId);
                            }}
                        ></i>

                    </li>

                ))}

            </ul>

        </div>


        {/* PROFILE */}
        <div className="profileSection">

            <div className="profileCard">

                <div className="avatar">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>

                <div className="userInfo">
                    <h3>{user?.username}</h3>
                    <p>{user?.email}</p>
                </div>

                <i className="fa-solid fa-gear settingsIcon"></i>

            </div>

        </div>

    </section>
    </>
);
};