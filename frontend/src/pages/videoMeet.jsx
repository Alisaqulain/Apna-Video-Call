import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import io from "socket.io-client";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import styles from "../styles/videoComponent.module.css"
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import IconButton from '@mui/material/IconButton';
import CallEndIcon from '@mui/icons-material/CallEnd'; // Import CallEndIcon
import MicIcon from '@mui/icons-material/Mic'; // Import MicIcon
import MicOffIcon from '@mui/icons-material/MicOff'; // Import MicOffIcon
import ScreenShareIcon from '@mui/icons-material/ScreenShare'; // Import ScreenShareIcon
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'; // Import StopScreenShareIcon
import { Badge } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat'; // Import ChatIcon
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';




const server_url = "http://localhost:9000";
var connections = {};
const peerConfigConnection = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export default function VideoMeetComponent() {
  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState({});
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModel, setModel] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermissions = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoPermissions) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }
      const audioPermissions = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioPermissions) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPermissions();
  }, []);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.log(err);
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;
    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
          })
          .catch((error) => { console.log(error); });
      });
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (err) {
        console.log(err);
      }
      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

      for (let id in connections) {
        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
            })
            .catch((error) => { console.log(error); });
        });
      }
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((err) => console.error(err));
    } else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    if (video !== undefined || audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId === socketIdRef.current) return;

    if (signal.sdp) {
      connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
        if (signal.sdp.type === "offer") {
          connections[fromId].createAnswer().then((description) => {
            connections[fromId].setLocalDescription(description).then(() => {
              socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: connections[fromId].localDescription }));
            }).catch(err => { console.log(err); });
          }).catch(err => { console.log(err); });
        }
      }).catch(err => { console.log(err); });
    }

    if (signal.ice) {
      connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(err => { console.log(err); });
    }
  };

  let addMessage = (data,sender,socketIdSender) => {
    setMessages((preMessage)=>[
      ...preMessage,
      {sender:sender,data:data}
    ])
    if(socketIdSender !== socketIdRef.current) {
      setNewMessages((preMessages)=> preMessages+1)
    }

  
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
      });
      socketRef.current.on("user-joined", (id, clients) => {
        console.log("user-joined");
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnection);
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
            }
          };
          connections[socketListId].onaddstream = (event) => {
            let videoExists = videoRef.current.find(video => video.socketId === socketListId);
            if (videoExists) {
              setVideos(videos => {
                const updateVideos = videos.map((video) =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updateVideos;
                return updateVideos;
              });
            } else {
              let newVideo = { socketId: socketListId, stream: event.stream, autoPlay: true, playsInline: true };
              setVideos((videos) => {
                const updateVideos = [...videos, newVideo];
                videoRef.current = updateVideos;
                return updateVideos;
              });
            }
          };
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) {
              continue;
            }
            try {
              connections[id2].addStream(window.localStream);
            } catch (err) {
              console.log(err);
            }
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit("signal", id2, JSON.stringify({ sdp: connections[id2].localDescription }));
                })
                .catch((err) => {
                  console.log(err);
                });
            });
          }
        }
      });
    });
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };
  const navigate = useNavigate();
  const connect = () => {
    setAskForUsername(false);
    getMedia();
  };
  let handleVideo = () => {
  setVideo(!video);
  }
  let handleAudio = () => {
 setAudio(!audio);
  }
  let getDisplayMediaSuccess = (stream) => {
    try{
      window.localStream.getTracks().forEach(track => track.stop());
    }catch(e){
      console.log(e)
    }
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;
    for(let id in connections){
    if(id===socketIdRef.current)continue
    connections[id].addStream(window.localStream);
    connections[id].createOffer().then((description) => {
      connections[id].setLocalDescription(description)
        .then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
        })
        .catch((err) => {
          console.log(err);
        });
    })
    }
    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false);
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (err) {
        console.log(err);
      }
      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream;

     getUserMedia()
    });
  

  }
  let  getDisplayMedia=()=>{
    if(screen){
      if(navigator.mediaDevices.getDisplayMedia){
        navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
        .then(getDisplayMediaSuccess)
        .then((stream)=>{})
        .catch((err)=>{console.log(err)})

      }
    }
  }
  useEffect(() =>
  {
if(screen !==undefined){
  getDisplayMedia()
}
  },[screen])
let handleScreen = () => {
setScreen(!screen);
}

let sendMessage = () => {
socketRef.current.emit("chat-message",message,username);

setMessage("")

}
let handleEndCall=()=>{
  try{
    let tracks=localVideoRef.current.srcObject.getTracks();
    tracks.forEach(track => track.stop());

  }
  catch(e){
    console.log(e)
  }
  navigate("/home")
}
  return (
    <div>
      {askForUsername === true ?
        <div>
          <h2>Enter in Lobby</h2>
          <TextField id="filled-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <Button variant="contained" onClick={connect}>Join call</Button>
          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
        :
        <div className={styles.meetVideoContainer}>      
        {showModel ?<div className={styles.chatRoom}>
<div className={styles.chatContainer}>
<h1>Chat Area</h1>
<div className={styles.chattingDisplay}>
  {messages.length>0 ?messages.map((item,index)=>{
    return(
  <div key={index} style={{marginBottom:"20px"}}>
<p style={{fontWeight:"900", fontSize:"25px"}}>{item.sender}</p>
<p>{item.data}</p>
  </div>
    )
  }):<p>No Messgae Yet</p>}

</div>
<div className={styles.chattingArea}>
<TextField 
                id="outlined-basic" 
                label="Enter Your Message" 
                variant="outlined" 
                value={message}  
                onChange={e => setMessage(e.target.value)}
            />
            <Button variant="outlined" onClick={sendMessage}>
                Send Message
            </Button>
</div>
</div>

        </div>:<></>}
        
            
          <div className={styles.buttonContainers}>
       <IconButton style={{color:"white"}} onClick={handleVideo}>
       {(video ===true)? <VideocamIcon /> : <VideocamOffIcon />}
       </IconButton>

       <IconButton style={{color:"red"}} onClick={handleEndCall}  > 
        <CallEndIcon />
        </IconButton>
        <IconButton style={{color:"white"}} onClick={handleAudio}>
       {audio === true ? <MicIcon /> : <MicOffIcon />}
        </IconButton>
        {screenAvailable=== true?
      <IconButton style={{color:"white"}} onClick={handleScreen}>
        {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
        </IconButton>  
        :<></>
      }
      <Badge badgeContent={newMessages} max={999} color='secondary' >

      <IconButton style={{ color: "white" }} onClick={() =>setModel(!showModel)}>
      {showModel ? <CloseIcon /> : <ChatIcon />}
        </IconButton>
      </Badge>
          </div>  
          <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>
        <div className={styles.conferenceView}>
          {videos.map((video) => (
            <div key={video.socketId}>
              {/* <h3>{video.socketId}</h3> */}
              <video
              
  key={video.socketId} 
  data-socket={video.socketId} 
  ref={(el) => {
    if (el && video.stream) {
      el.srcObject = video.stream; 
    }
  }} 
  autoPlay
  muted
></video>
            </div>
          ))}
          </div>
        </div>}
    </div>
  );
}