import './App.css'
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import Login from "./login.jsx";
import Register from "./register.jsx";
import SharePage from "./SharePage.jsx";
import { MyContext } from './MyContext.jsx';
import { useState, useEffect } from 'react';
import { v1 as uuidv1 } from "uuid";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {

  const savedToken = localStorage.getItem("token");
  const [token, setToken] = useState(savedToken);

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [currthreadid, setcurrthreadid] = useState(uuidv1());
  const [allThreads, setAllThreads] = useState([]);

  const [isTyping, setIsTyping] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLoginSuccess = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currthreadid,
    setcurrthreadid,
    newChat,
    setNewChat,
    prevChats,
    setPrevChats,
    allThreads,
    setAllThreads,

    isTyping,
    setIsTyping
  };

  return (
    <Router>

      <MyContext.Provider value={providerValues}>

        <Routes>

          <Route
            path="/"
            element={
              <>
                <div className="app">

                  {isMobile && (
                    <div
                      className="mobileMenuBtn"
                      onClick={() => setShowSidebar(!showSidebar)}
                    >
                      ☰
                    </div>
                  )}

                  {(showSidebar || !isMobile) && (
                    <Sidebar closeSidebar={() => setShowSidebar(false)} />
                  )}

                  <ChatWindow />
                </div>

                {!token && !showRegister && (
                  <div className="authOverlay">
                    <Login
                      onLoginSuccess={handleLoginSuccess}
                      openRegister={() => setShowRegister(true)}
                    />
                  </div>
                )}

                {!token && showRegister && (
                  <div className="authOverlay">
                    <Register
                      openLogin={() => setShowRegister(false)}
                    />
                  </div>
                )}
              </>
            }
          />

          <Route path="/share/:threadid" element={<SharePage />} />

        </Routes>

      </MyContext.Provider>

    </Router>
  );
}

export default App;