import './Chat.css';
import { MyContext } from './MyContext.jsx';
import { useContext,useState } from 'react';
import ReactMarkdown from 'react-markdown';
import RehypeHighlight from 'rehype-highlight';
import "highlight.js/styles/github-dark.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Chat(){

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, []);

    const { newChat, prevChat, reply } = useContext(MyContext);
    const [latestResponse, setLatestResponse] = useState(null);

    useEffect(() => {
        if(reply === null){
                setLatestResponse(null); // Reset latestResponse when reply is null
                return;// If reply is null, we don't want to update the latestResponse
        }  

        if (!prevChat?.length) return;

            const content=reply.split(" ");// Split the reply into words
            let idx=0;
            const interval=setInterval(() => {
                setLatestResponse(content.slice(0, idx + 1).join(" ")); // Update the latestResponse with the most recent response from the AI
                idx++;
                if (idx >= content.length) {
                    clearInterval(interval); // Clear the interval when all words have been processed
                }

            },40);
            // Set an interval to update the latestResponse every 40 milliseconds
            return () => clearInterval(interval); // Clear the interval when the component unmounts or when reply changes
    }
    , [prevChat,reply]);// This effect runs whenever prevChat or reply changes. It checks if prevChat has any messages, and if so, it splits the reply into words and updates the latestResponse state with the most recent response from the AI. This allows us to keep track of the latest response for rendering in the chat interface.

    return (
        <>
        {newChat ? <div className="welcomeScreen">
            <h1>Welcome to FULCRUM AI</h1>
            <p>Your personal AI assistant for all your needs. Start a new chat to explore the possibilities!</p>
        </div> : ''}

        <div className="chats">

            {
                Array.isArray(prevChat) && prevChat.slice(0, -1).map((chat, index) => ( //not need to render the last message as it is being typed
                    <div className={chat.role === 'user' ? "userDiv" : "gptDiv"} key={index}>
                        {
                            chat.role === 'user' ? 
                            <p className="userMessage"> {chat.content}</p>
                            : <ReactMarkdown rehypePlugins={[RehypeHighlight]}>{chat.content}</ReactMarkdown>
                        }
                        
                    </div>
                ))
            }

            {
                prevChat.length>0 && 
                (
                    <>
                    {
                        latestResponse === null ?(
                            <div className="gptDiv" key={"non-typing"}>
                        <ReactMarkdown rehypePlugins={[RehypeHighlight]}>{prevChat[prevChat.length - 1].content}</ReactMarkdown>
                    </div>
                    ) : (
                    <div className="gptDiv" key={"typing"}>
                        <ReactMarkdown rehypePlugins={[RehypeHighlight]}>{latestResponse}</ReactMarkdown>
                    </div>
                    ) 
                    }
                </>
                )
                    }
        </div>
        </>

    )
}