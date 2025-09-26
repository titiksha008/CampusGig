<<<<<<< HEAD
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api";
// import { useAuth } from "../context/AuthContext";

// export default function ChatList() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [chats, setChats] = useState([]);

//   // useEffect(() => {
//   //   const fetchChats = async () => {
//   //     if (!user?._id) return; // safety check
//   //     try {
//   //       const res = await api.get(`/chat/user/${user._id}`);
//   //       setChats(res.data);
//   //     } catch (err) {
//   //       console.error("Error fetching chats:", err);
//   //     }
//   //   };

//   //   fetchChats();
//   // }, [user?._id]);

//   useEffect(() => {
//   const fetchChats = async () => {
//     if (!user?._id) return;
//     try {
//       const res = await api.get(`/chat/user/${user._id}`);
//       // Only keep chats where posterId and acceptedUserId are populated
//       const populatedChats = res.data.filter(
//         (chat) => chat.posterId?.name && chat.acceptedUserId?.name
//       );
//       setChats(populatedChats);
//     } catch (err) {
//       console.error("Error fetching chats:", err);
//     }
//   };

//   fetchChats();
// }, [user?._id]);


//   const handleChatClick = (chat) => {
//     const otherUser =
//     chat.posterId._id === user._id ? chat.acceptedUserId : chat.posterId;

//     navigate(
//     `/chat/${chat.posterId._id}/${chat.jobId}/${chat.acceptedUserId._id}`,
//     { state: { posterName: otherUser.name } } // show correct name
//     );
//   };

//   return (
//     <div className="chat-list">
//       <h2>Chats</h2>
//       {chats.length === 0 && <p>No chats yet.</p>}
//       {chats.map((chat) => {
//         const otherUser =
//           chat.posterId._id === user._id ? chat.acceptedUserId : chat.posterId;

//         return (
//           <div
//             key={chat._id}
//             className="chat-item"
//             onClick={() => handleChatClick(chat)}
//           >
//             <strong>{otherUser?.name || "Unknown User"}</strong>
//             {/* <p>{chat.messages?.[chat.messages.length - 1]?.text || "No messages yet"}</p> */}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
=======
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client";
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6

export default function ChatList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
<<<<<<< HEAD

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?._id) return;
      try {
        const res = await api.get(`/chat/user/${user._id}`);

        // Keep only chats with valid posterId and acceptedUserId
        const validChats = res.data.filter(
          (chat) =>
            chat?.posterId?._id &&
            chat?.posterId?.name &&
            chat?.acceptedUserId?._id &&
            chat?.acceptedUserId?.name
        );
        setChats(validChats);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
=======
  const socketRef = useRef();

  // Fetch chats from API
  const fetchChats = async () => {
    if (!user?._id) return;
    try {
      const res = await api.get(`/chat/user/${user._id}`);
      const validChats = res.data.filter(
        (chat) =>
          chat &&
          chat.posterId?.name &&
          chat.posterId?._id &&
          chat.acceptedUserId?.name &&
          chat.acceptedUserId?._id
      );
      setChats(validChats);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    if (!user?._id) return;

    fetchChats();

    // Connect Socket.IO
    socketRef.current = io("http://localhost:5000");

    // Listen for new messages
    socketRef.current.on("newMessage", () => {
      fetchChats(); // refresh chat list when a new message arrives
    });

    return () => {
      socketRef.current.disconnect();
    };
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
  }, [user?._id]);

  const handleChatClick = (chat) => {
    if (!chat?.posterId?._id || !chat?.acceptedUserId?._id) return;

<<<<<<< HEAD
    // Determine the "other user"
    const otherUser =
      chat.posterId._id.toString() === user._id
        ? chat.acceptedUserId
        : chat.posterId;

    // Filter chats with this other user
    const otherUserChats = chats.filter(
      (c) =>
        c?.posterId?._id === otherUser._id || c?.acceptedUserId?._id === otherUser._id
    );

    if (!otherUserChats.length) return;

    // Sort by latest message date
=======
    const otherUser =
      chat.posterId._id === user._id ? chat.acceptedUserId : chat.posterId;

    if (!otherUser?._id) return;

    const otherUserChats = chats.filter(
      (c) =>
        c?.posterId?._id === otherUser._id ||
        c?.acceptedUserId?._id === otherUser._id
    );

>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
    const latestChat = otherUserChats
      .filter((c) => c.messages?.length > 0)
      .sort((a, b) => {
        const aLast = a.messages[a.messages.length - 1]?.createdAt || 0;
        const bLast = b.messages[b.messages.length - 1]?.createdAt || 0;
        return new Date(bLast) - new Date(aLast);
      })[0];

    if (!latestChat || !latestChat.messages?.length) return;

    const latestJobId = latestChat.messages[latestChat.messages.length - 1]?.jobId;
    if (!latestJobId) return;

<<<<<<< HEAD
   navigate(
  `/chat/${latestChat.posterId._id}/${latestJobId}/${latestChat.acceptedUserId._id}`,
  { state: { posterName: otherUser.name || "Unknown User" } }
);

=======
    navigate(
      `/chat/${latestChat.posterId._id}/${latestJobId}/${latestChat.acceptedUserId._id}`,
      { state: { posterName: otherUser.name || "Unknown User" } }
    );
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
  };

  return (
    <div className="chat-list">
      <h2>Chats</h2>
<<<<<<< HEAD
      {chats.length === 0 ? (
=======
      {!user ? (
        <p>Please log in to see your chats.</p>
      ) : chats.length === 0 ? (
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
        <p>No chats yet.</p>
      ) : (
        chats.map((chat) => {
          if (!chat?.posterId?._id || !chat?.acceptedUserId?._id) return null;

          const otherUser =
<<<<<<< HEAD
            chat.posterId._id.toString() === user._id
              ? chat.acceptedUserId
              : chat.posterId;
=======
            chat.posterId._id === user._id ? chat.acceptedUserId : chat.posterId;

          if (!otherUser) return null;
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6

          return (
            <div
              key={chat._id || Math.random()}
              className="chat-item"
              onClick={() => handleChatClick(chat)}
            >
              <strong>{otherUser?.name || "Unknown User"}</strong>
            </div>
          );
        })
      )}
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 7b2b40d4c2d61e6fa17862dfd829936ae5af78b6
