import React, { useContext, useState }  from "react";
import withAuth from "../utils/withAuth.jsx";      
import { useNavigate } from "react-router-dom"; // Navigation Hook
import { IconButton, Button } from "@mui/material"; // MUI Components
import RestoreIcon from "@mui/icons-material/Restore"; 
import "../App.css"
import VideoCallIcon from '@mui/icons-material/VideoCall';
import TextField from "@mui/material/TextField";
import { motion } from "framer-motion"; 


import { AuthContext } from "../contexts/AuthContext.jsx";

 function HomeComponent(){   
    let navigate=useNavigate();  
    const [meetingCode,setMeetingCode]=useState("")


    
    const {addToUserHistory}=useContext(AuthContext)    

    let handleJoinVideoCall=async ()=>{
await addToUserHistory(meetingCode)
navigate(`/${meetingCode}`)


    }
    return (
        <div className="video-call-container">
        {/* Navbar */}
        <motion.div
            className="navbar"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="logo-section">
                <VideoCallIcon className="logo-icon" />
                <h2>Apne Video Call</h2>
            </div>
            <div className="nav-actions">
                <IconButton className="icon-button" onClick={
()=>{
    navigator("/history")
}

                }>
                    <RestoreIcon />
                </IconButton>
               <Button variant="contained" onClick={()=>{navigate("/history")}} className="history-button">
                History
               </Button>
                <Button
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/auth");
                    }}
                    className="logout-button"
                >
                    Log Out
                </Button>
            </div>
        </motion.div>

        {/* Main Content */}
        <div className="content">
            {/* Left Panel */}
            <motion.div
                className="left-panel"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <h2 className="title">Seamless Video Calls, Anytime, Anywhere.</h2>
                <div className="input-container">
                    <TextField
                        onChange={(e) => setMeetingCode(e.target.value)}
                        id="filled-basic"
                        label="Enter Your Room ID"
                        variant="filled"
                        className="text-field"
                    />
                    <Button
                        onClick={handleJoinVideoCall}
                        variant="contained"
                        className="join-button"
                    >
                        Join
                    </Button>
                </div>
            </motion.div>

            {/* Right Panel */}
            <motion.div
                className="right-panel"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <img
                    srcSet="/logo2.png"
                    alt="Video Call Illustration"
                    className="illustration"
                />
            </motion.div>
        </div>
    </div>
);
};
export default withAuth(HomeComponent);