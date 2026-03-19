import './App.css'
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import Login from "./login.jsx";
import Register from "./register.jsx";
import { MyContext } from './MyContext.jsx';
import { useState } from 'react';
import { v1 as uuidv1 } from "uuid";

function App() {

  const savedToken = localStorage.getItem("token");

  const [token,setToken] = useState(savedToken);

  const [prompt,setPrompt]=useState("");
  const [reply,setReply]=useState(null);
  const [prevChats,setPrevChats]=useState([]);
  const [newChat,setNewChat]=useState(true);
  const [currthreadid,setcurrthreadid]=useState(uuidv1());
  const [allThreads,setAllThreads]=useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  const [showRegister,setShowRegister]=useState(false);


  const handleLoginSuccess = (token) => {

    localStorage.setItem("token",token);
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
    setAllThreads
  };


  return (

    <MyContext.Provider value={providerValues}>


      <div className="app">

        <Sidebar />

        <ChatWindow />

      </div>



      {!token && !showRegister && (

        <div className="authOverlay">

          <Login
            onLoginSuccess={handleLoginSuccess}
            openRegister={()=>setShowRegister(true)}
          />

        </div>

      )}



      {!token && showRegister && (

        <div className="authOverlay">

          <Register
            openLogin={()=>setShowRegister(false)}
          />

        </div>

      )}

    </MyContext.Provider>

  );
}

export default App;