import './App.css';
import Sidebar from './Sidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import Login from './Login.jsx';
import { MyContext } from './MyContext.jsx';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Register.jsx";

function App() {

  const [prompts, setprompts] = useState("");
  const [reply, setReply] = useState(null);
  const [currentThreadId, setCurrentThreadId] = useState(uuidv4());
  const [prevChat, setPrevChat] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  const providerValue = {
    prompts, setprompts,
    reply, setReply,
    currentThreadId, setCurrentThreadId,
    prevChat, setPrevChat,
    newChat, setNewChat,
    allThreads, setAllThreads
  };

  // Check login
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <BrowserRouter>

      <MyContext.Provider value={providerValue}>

        <Routes>

          {/* Login Route */}
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register setToken={setToken} />} /> 
          {/* Protected App Route */}
          <Route
            path="/"
            element={
              token ? (
                <div className="app">
                  <Sidebar />
                  <ChatWindow />
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          

        </Routes>

      </MyContext.Provider>

    </BrowserRouter>
  );
}

export default App;