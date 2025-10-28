// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate, useLocation } from "react-router-dom";
// import { io } from "socket.io-client";
// import api from "../services/api";
// import "./UserChat.css";
// import { useAuth } from "../context/AuthContext";
// import {
//   FaMicrophone,
//   FaStop,
//   FaCheck,
//   FaTimes,
//   FaArrowLeft,
//   FaPaperPlane,
//   FaSmile,
//   FaVideo,
//   FaPhoneSlash,
// } from "react-icons/fa";
// import EmojiPicker from "emoji-picker-react"; // install: npm i emoji-picker-react

// export default function UserChat({ currentUserId: propCurrentUserId }) {
//   const { posterId, jobId, acceptedUserId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();
//   const currentUserId = propCurrentUserId || user?._id;
//   const { posterName } = location.state || {};

//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);

//   const [recording, setRecording] = useState(false);
//   const [audioBlob, setAudioBlob] = useState(null);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [recordTime, setRecordTime] = useState(0);

//   const messagesEndRef = useRef(null);
//   const socketRef = useRef(null);
//   const audioChunksRef = useRef([]);
//   const timerRef = useRef(null);

//   // 🔹 VIDEO CALL STATES & REFS
//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerConnectionRef = useRef(null);
//   const [inCall, setInCall] = useState(false);
//   const [incomingCall, setIncomingCall] = useState(null); // { from, signal }

//   const otherUserId = currentUserId === posterId ? acceptedUserId : posterId;
//   const [otherUserOnline, setOtherUserOnline] = useState(false);

//   // --- Socket.IO online status ---
//   useEffect(() => {
//     if (!socketRef.current || !otherUserId || !currentUserId) return;
//     socketRef.current.emit("userOnline", currentUserId);

//     socketRef.current.on("updateUserStatus", (onlineUsers) => {
//       setOtherUserOnline(!!onlineUsers[otherUserId]);
//     });

//     return () => socketRef.current.off("updateUserStatus");
//   }, [socketRef.current, otherUserId, currentUserId]);

//   // --- Socket.IO messages ---
//   useEffect(() => {
//     if (!posterId || !acceptedUserId || !jobId) return;
//     if (socketRef.current) return;

//     const roomId = [posterId, acceptedUserId, jobId].sort().join("-");
//     socketRef.current = io("http://localhost:5000");

//     socketRef.current.emit("joinRoom", roomId);
//     socketRef.current.emit("registerUser", currentUserId);

//     // 🔹 VIDEO CALL SOCKET LISTENERS
//     socketRef.current.on("callIncoming", ({ from, signal, name }) => {
//       setIncomingCall({ from, signal, name });
//     });

//     socketRef.current.on("callAccepted", (signal) => {
//       peerConnectionRef.current?.setRemoteDescription(
//         new RTCSessionDescription(signal)
//       );
//     });

//     socketRef.current.on("callRejected", () => {
//       alert("Call rejected by the user");
//       setIncomingCall(null);
//       endCall(true);
//     });

//     socketRef.current.on("callEnded", () => {
//       alert("The call has been ended by the other user");
//       setIncomingCall(null);
//       endCall(true);
//     });

//     socketRef.current.on("newMessage", (msg) => {
//       if (msg.text || msg.file) {
//         setMessages((prev) => [...prev, msg]);
//       }
//     });

//     return () => {
//       socketRef.current.emit("leaveRoom", roomId);
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     };
//   }, [posterId, acceptedUserId, jobId, currentUserId]);

//   // --- Fetch initial messages ---
//   useEffect(() => {
//     if (!posterId || !acceptedUserId || !jobId) return;
//     const fetchMessages = async () => {
//       try {
//         const res = await api.get(`/chat/${posterId}/${jobId}/${acceptedUserId}`);
//         setMessages(res.data);
//       } catch (err) {
//         console.error(err);
//         setMessages([]);
//       }
//     };
//     fetchMessages();
//   }, [posterId, acceptedUserId, jobId]);

//   // --- Scroll to bottom ---
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // --- Send text message ---
//   const handleInputChange = (e) => setNewMsg(e.target.value);

//   const handleSend = async () => {
//     if (!newMsg.trim()) return;

//     const msgData = {
//       posterId,
//       acceptedUserId,
//       jobId,
//       senderId: currentUserId,
//       text: newMsg.trim(),
//       file: "",
//       fileType: "",
//     };

//     setNewMsg("");

//     try {
//       const res = await api.post("/chat", msgData);
//       const savedMessage = res.data[res.data.length - 1];
//       setMessages((prev) => [...prev, savedMessage]);

//       socketRef.current.emit("sendMessage", savedMessage);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // --- Emoji Picker ---
//   const handleEmojiClick = (emojiObject) => {
//     setNewMsg((prev) => prev + (emojiObject?.emoji || ""));
//   };

//   const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);

//   // --- Voice message ---
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       setMediaRecorder(recorder);
//       audioChunksRef.current = [];
//       setRecording(true);
//       setRecordTime(0);

//       timerRef.current = setInterval(() => setRecordTime((t) => t + 1), 1000);

//       recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

//       recorder.onstop = () => {
//         const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
//         setAudioBlob(blob);
//         clearInterval(timerRef.current);
//       };

//       recorder.start();
//     } catch (err) {
//       console.error("Microphone access denied", err);
//     }
//   };

//   const stopRecording = () => {
//     mediaRecorder?.stop();
//     setRecording(false);
//   };

//   const cancelRecording = () => {
//     setAudioBlob(null);
//     setRecording(false);
//     clearInterval(timerRef.current);
//   };

//   const sendAudio = async () => {
//     if (!audioBlob) return;

//     const file = new File([audioBlob], `voice-${Date.now()}.webm`, {
//       type: "audio/webm",
//     });
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const res = await api.post("/chat/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const fileUrl = res.data.url;

//       const msgData = {
//         posterId,
//         acceptedUserId,
//         jobId,
//         senderId: currentUserId,
//         file: fileUrl,
//         fileType: "audio",
//         text: "",
//       };

//       const savedMessages = await api.post("/chat", msgData);
//       setMessages((prev) => [
//         ...prev,
//         savedMessages.data[savedMessages.data.length - 1],
//       ]);
//       setAudioBlob(null);
//     } catch (err) {
//       console.error("Voice message upload failed", err);
//     }
//   };

//   // 🔹 VIDEO CALL HANDLER FUNCTIONS
//   const startVideoCall = async () => {
//     const pc = new RTCPeerConnection();
//     peerConnectionRef.current = pc;
//     setInCall(true);

//     const localStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     localVideoRef.current.srcObject = localStream;
//     localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

//     pc.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current.emit("iceCandidate", {
//           candidate: event.candidate,
//           to: otherUserId,
//         });
//       }
//     };

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     socketRef.current.emit("callUser", {
//       userToCall: otherUserId,
//       signal: offer,
//       from: socketRef.current.id,
//       name: user?.name || "User",
//     });
//   };

//   const handleVideoOffer = async ({ offer, from }) => {
//     const pc = new RTCPeerConnection();
//     peerConnectionRef.current = pc;
//     setInCall(true);

//     const localStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     localVideoRef.current.srcObject = localStream;
//     localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

//     pc.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current.emit("iceCandidate", {
//           candidate: event.candidate,
//           to: from,
//         });
//       }
//     };

//     await pc.setRemoteDescription(new RTCSessionDescription(offer));
//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);
//     socketRef.current.emit("videoAnswer", { answer, to: from });
//   };

//   const handleVideoAnswer = async ({ answer }) => {
//     await peerConnectionRef.current.setRemoteDescription(
//       new RTCSessionDescription(answer)
//     );
//   };

//   const handleIceCandidate = async ({ candidate }) => {
//     try {
//       await peerConnectionRef.current.addIceCandidate(
//         new RTCIceCandidate(candidate)
//       );
//     } catch (err) {
//       console.error("Error adding received ICE candidate", err);
//     }
//   };

//   const handleEndCall = () => {
//     endCall();
//   };

//   const endCall = (remote = false) => {
//     setInCall(false);
//     setIncomingCall(null);

//     if (peerConnectionRef.current) {
//       peerConnectionRef.current.close();
//       peerConnectionRef.current = null;
//     }

//     if (localVideoRef.current?.srcObject) {
//       localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
//       localVideoRef.current.srcObject = null;
//     }

//     if (remoteVideoRef.current?.srcObject) {
//       remoteVideoRef.current.srcObject = null;
//     }

//     if (!remote && socketRef.current) {
//       socketRef.current.emit("endCall", { to: otherUserId });
//     }
//   };

//   const acceptCall = async () => {
//     setInCall(true);
//     const pc = new RTCPeerConnection();
//     peerConnectionRef.current = pc;

//     const localStream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });
//     localVideoRef.current.srcObject = localStream;
//     localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

//     pc.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current.emit("iceCandidate", {
//           candidate: event.candidate,
//           to: incomingCall.from,
//         });
//       }
//     };

//     await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.signal));
//     const answer = await pc.createAnswer();
//     await pc.setLocalDescription(answer);

//     socketRef.current.emit("answerCall", {
//       signal: answer,
//       to: incomingCall.from,
//     });
//     setIncomingCall(null);
//   };

//   const rejectCall = () => {
//     socketRef.current.emit("rejectCall", { to: incomingCall.from });
//     setIncomingCall(null);
//   };

//   // --- Render messages ---
//   const renderMessage = (m) => {
//     if (m.text) return <span>{m.text}</span>;
//     if (m.fileType === "image")
//       return <img src={m.file} alt="sent" className="chat-file" />;
//     if (m.fileType === "video")
//       return <video src={m.file} controls className="chat-file" />;
//     if (m.fileType === "audio" && m.file)
//       return <audio controls src={m.file} />;
//     return null;
//   };

//   return (
//     <div className="user-chat">
//       <div className="chat-header">
//         <button className="back-btn" onClick={() => navigate(-1)}>
//           <FaArrowLeft />
//         </button>

//         <div className="user-info">
//           <span className="username">{posterName || otherUserId}</span>
//           <span
//             className={`user-status ${otherUserOnline ? "online" : "offline"}`}
//           >
//             {otherUserOnline ? "Online" : "Offline"}
//           </span>
//         </div>

//         {!inCall ? (
//           <button className="video-btn" onClick={startVideoCall}>
//             <FaVideo />
//           </button>
//         ) : (
//           <button className="end-btn" onClick={endCall}>
//             <FaPhoneSlash />
//           </button>
//         )}
//       </div>

//       <div className="chat-body">
//         {messages.map((m, idx) => (
//           <div
//             key={m._id || idx}
//             className={`chat-msg-wrapper ${
//               m.senderId === currentUserId ? "me-wrapper" : "them-wrapper"
//             }`}
//           >
//             <div
//               className={`chat-msg ${
//                 m.senderId === currentUserId ? "me" : "them"
//               }`}
//             >
//               {renderMessage(m)}
//             </div>

//             {m.senderId === currentUserId && m.seen && idx === messages.length - 1 && (
//               <div className="seen-label-below">Seen</div>
//             )}
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* 🔹 VIDEO DISPLAY SECTION */}
//       {inCall && (
//         <div className="video-call-container">
//           <video
//             ref={localVideoRef}
//             autoPlay
//             muted
//             playsInline
//             className="local-video"
//           />
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             className="remote-video"
//           />
//         </div>
//       )}

//       <div className="chat-input">
//         <div className="input-row">
//           <input
//             type="text"
//             value={newMsg}
//             onChange={handleInputChange}
//             placeholder="Type a message..."
//             onKeyDown={(e) => e.key === "Enter" && handleSend()}
//           />
//           <button className="emoji-btn" onClick={toggleEmojiPicker}>
//             <FaSmile />
//           </button>
//           <button className="send-btn" onClick={handleSend}>
//             <FaPaperPlane />
//           </button>
//           {!recording && (
//             <button className="record-btn" onClick={startRecording}>
//               <FaMicrophone />
//             </button>
//           )}
//           {recording && (
//             <button className="stop-btn" onClick={stopRecording}>
//               <FaStop /> ({recordTime}s)
//             </button>
//           )}
//         </div>

//         {showEmojiPicker && (
//           <div className="emoji-picker-wrapper">
//             <button className="close-emoji-btn" onClick={toggleEmojiPicker}>
//               ×
//             </button>
//             <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
//           </div>
//         )}

//         {audioBlob && (
//           <div className="voice-preview">
//             <audio controls src={URL.createObjectURL(audioBlob)} />
//             <button className="send-audio-btn" onClick={sendAudio}>
//               <FaCheck />
//             </button>
//             <button className="cancel-audio-btn" onClick={cancelRecording}>
//               <FaTimes />
//             </button>
//           </div>
//         )}
//       </div>

//       {/* ✅ Incoming Call Popup */}
//       {incomingCall && !inCall && (
//         <div className="incoming-call-popup">
//           <p>{incomingCall.name || "Someone"} is calling...</p>
//           <div className="popup-buttons">
//             <button className="accept-btn" onClick={acceptCall}>
//               <FaCheck />
//             </button>
//             <button className="reject-btn" onClick={rejectCall}>
//               <FaTimes />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import "./UserChat.css";
import { useAuth } from "../context/AuthContext";
import {
  FaMicrophone,
  FaStop,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaPaperPlane,
  FaSmile,
  FaVideo,
  FaPhoneSlash,
} from "react-icons/fa";
import EmojiPicker from "emoji-picker-react"; // install: npm i emoji-picker-react

export default function UserChat({ currentUserId: propCurrentUserId }) {
  const { posterId, jobId, acceptedUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const currentUserId = propCurrentUserId || user?._id;
  const { posterName } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordTime, setRecordTime] = useState(0);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // 🔹 VIDEO CALL STATES & REFS
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [inCall, setInCall] = useState(false);
  // ✅ Incoming call state
  const [incomingCall, setIncomingCall] = useState(null); // { from, signal }

  const otherUserId = currentUserId === posterId ? acceptedUserId : posterId;
  const [otherUserOnline, setOtherUserOnline] = useState(false);

  // --- Socket.IO online status ---
  useEffect(() => {
    if (!socketRef.current || !otherUserId || !currentUserId) return;
    socketRef.current.emit("userOnline", currentUserId);

    socketRef.current.on("updateUserStatus", (onlineUsers) => {
      setOtherUserOnline(!!onlineUsers[otherUserId]);
    });

    return () => socketRef.current.off("updateUserStatus");
  }, [socketRef.current, otherUserId, currentUserId]);

  // --- Socket.IO messages ---
  useEffect(() => {
    if (!posterId || !acceptedUserId || !jobId) return;
    if (socketRef.current) return;

    const roomId = [posterId, acceptedUserId, jobId].sort().join("-");
    socketRef.current = io("http://localhost:5000");

    socketRef.current.emit("registerUser", currentUserId);

    // Listen for the list of all online users
    socketRef.current.on("onlineUsers", (onlineUsers) => {
      setOtherUserOnline(onlineUsers.includes(otherUserId));
    });

    // 🔹 VIDEO CALL SOCKET LISTENERS
    socketRef.current.on("callIncoming", ({ from, signal, name }) => {
      setIncomingCall({ from, signal, name });
    });

    socketRef.current.on("callAccepted", (signal) => {
      peerConnectionRef.current?.setRemoteDescription(
        new RTCSessionDescription(signal)
      );
    });

    socketRef.current.on("callRejected", () => {
      alert("Call rejected by the user");
      setIncomingCall(null);
      endCall(true);
    });

    socketRef.current.on("callEnded", () => {
      alert("The call has been ended by the other user");
      setIncomingCall(null);
      endCall(true);
    });

    socketRef.current.on("newMessage", (msg) => {
      if (msg.text || msg.file) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socketRef.current.emit("leaveRoom", roomId);
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [posterId, acceptedUserId, jobId, currentUserId]);

  // --- Fetch initial messages ---
  useEffect(() => {
    if (!posterId || !acceptedUserId || !jobId) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/${posterId}/${jobId}/${acceptedUserId}`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [posterId, acceptedUserId, jobId]);

  // --- Scroll to bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Send text message ---
  const handleInputChange = (e) => setNewMsg(e.target.value);

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    const msgData = {
      posterId,
      acceptedUserId,
      jobId,
      senderId: currentUserId,
      text: newMsg.trim(),
      file: "",
      fileType: "",
    };

    setNewMsg("");

    try {
      const res = await api.post("/chat", msgData);
      const savedMessage = res.data[res.data.length - 1];
      setMessages((prev) => [...prev, savedMessage]);
      socketRef.current.emit("sendMessage", savedMessage);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Emoji Picker ---
  const handleEmojiClick = (emojiObject) => {
    setNewMsg((prev) => prev + (emojiObject?.emoji || ""));
  };

  const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);

  // --- Voice message ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      audioChunksRef.current = [];
      setRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => setRecordTime((t) => t + 1), 1000);

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        clearInterval(timerRef.current);
      };

      recorder.start();
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    setRecording(false);
    clearInterval(timerRef.current);
  };

  const sendAudio = async () => {
    if (!audioBlob) return;

    const file = new File([audioBlob], `voice-${Date.now()}.webm`, {
      type: "audio/webm",
    });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/chat/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = res.data.url;

      const msgData = {
        posterId,
        acceptedUserId,
        jobId,
        senderId: currentUserId,
        file: fileUrl,
        fileType: "audio",
        text: "",
      };

      const savedMessages = await api.post("/chat", msgData);
      setMessages((prev) => [
        ...prev,
        savedMessages.data[savedMessages.data.length - 1],
      ]);
      setAudioBlob(null);
    } catch (err) {
      console.error("Voice message upload failed", err);
    }
  };

  // 🔹 VIDEO CALL HANDLER FUNCTIONS
  const startVideoCall = async () => {
    const pc = new RTCPeerConnection();
    peerConnectionRef.current = pc;
    setInCall(true);

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = localStream;
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("iceCandidate", {
          candidate: event.candidate,
          to: otherUserId,
        });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketRef.current.emit("callUser", {
      userToCall: otherUserId,
      signal: offer,
      from: socketRef.current.id,
      name: user?.name || "User",
    });
  };

  const handleVideoOffer = async ({ offer, from }) => {
    const pc = new RTCPeerConnection();
    peerConnectionRef.current = pc;
    setInCall(true);

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = localStream;
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("iceCandidate", {
          candidate: event.candidate,
          to: from,
        });
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketRef.current.emit("videoAnswer", { answer, to: from });
  };

  const handleVideoAnswer = async ({ answer }) => {
    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
  };

  const handleIceCandidate = async ({ candidate }) => {
    try {
      await peerConnectionRef.current.addIceCandidate(
        new RTCIceCandidate(candidate)
      );
    } catch (err) {
      console.error("Error adding received ICE candidate", err);
    }
  };

  const handleEndCall = () => {
    endCall();
  };

  const endCall = (remote = false) => {
    setInCall(false);
    setIncomingCall(null);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject = null;
    }

    if (!remote && socketRef.current) {
      socketRef.current.emit("endCall", { to: otherUserId });
    }
  };

  // ✅ Accept incoming call
  const acceptCall = async () => {
    setInCall(true);
    const pc = new RTCPeerConnection();
    peerConnectionRef.current = pc;

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = localStream;
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("iceCandidate", {
          candidate: event.candidate,
          to: incomingCall.from,
        });
      }
    };

    await pc.setRemoteDescription(
      new RTCSessionDescription(incomingCall.signal)
    );
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socketRef.current.emit("answerCall", {
      signal: answer,
      to: incomingCall.from,
    });
    setIncomingCall(null);
  };

  // ✅ Reject incoming call
  const rejectCall = () => {
    socketRef.current.emit("rejectCall", { to: incomingCall.from });
    setIncomingCall(null);
  };

  // --- Render messages ---
  const renderMessage = (m) => {
    if (m.text) return <span>{m.text}</span>;
    if (m.fileType === "image")
      return <img src={m.file} alt="sent" className="chat-file" />;
    if (m.fileType === "video")
      return <video src={m.file} controls className="chat-file" />;
    if (m.fileType === "audio" && m.file)
      return <audio controls src={m.file} />;
    return null;
  };

  return (
    <div className="user-chat">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>

        <div className="user-info">
          <span className="username">{posterName || otherUserId}</span>
          <span
            className={`user-status ${otherUserOnline ? "online" : "offline"}`}
          >
            {otherUserOnline ? "Online" : "Offline"}
          </span>
        </div>

        {!inCall ? (
          <button className="video-btn" onClick={startVideoCall}>
            <FaVideo />
          </button>
        ) : (
          <button className="end-btn" onClick={endCall}>
            <FaPhoneSlash />
          </button>
        )}
      </div>

      <div className="chat-body">
        {messages.map((m, idx) => (
          <div
            key={m._id || idx}
            className={`chat-msg-wrapper ${
              m.senderId === currentUserId ? "me-wrapper" : "them-wrapper"
            }`}
          >
            <div
              className={`chat-msg ${
                m.senderId === currentUserId ? "me" : "them"
              }`}
            >
              {renderMessage(m)}
            </div>

            {m.senderId === currentUserId &&
              m.seen &&
              idx === messages.length - 1 && (
                <div className="seen-label-below">Seen</div>
              )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 🔹 VIDEO DISPLAY SECTION */}
      {inCall && (
        <div className="video-call-container">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="local-video"
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
        </div>
      )}

      <div className="chat-input">
        <div className="input-row">
          <input
            type="text"
            value={newMsg}
            onChange={handleInputChange}
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="emoji-btn" onClick={toggleEmojiPicker}>
            <FaSmile />
          </button>
          <button className="send-btn" onClick={handleSend}>
            <FaPaperPlane />
          </button>
          {!recording && (
            <button className="record-btn" onClick={startRecording}>
              <FaMicrophone />
            </button>
          )}
          {recording && (
            <button className="stop-btn" onClick={stopRecording}>
              <FaStop /> ({recordTime}s)
            </button>
          )}
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker-wrapper">
            <button className="close-emoji-btn" onClick={toggleEmojiPicker}>
              ×
            </button>
            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
          </div>
        )}

        {audioBlob && (
          <div className="voice-preview">
            <audio controls src={URL.createObjectURL(audioBlob)} />
            <button className="send-audio-btn" onClick={sendAudio}>
              <FaCheck />
            </button>
            <button className="cancel-audio-btn" onClick={cancelRecording}>
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* ✅ Incoming Call Popup */}
      {incomingCall && !inCall && (
        <div className="incoming-call-popup">
          <p>{incomingCall.name || "Someone"} is calling...</p>
          <div className="popup-buttons">
            <button className="accept-btn" onClick={acceptCall}>
              <FaCheck />
            </button>
            <button className="reject-btn" onClick={rejectCall}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
