import { useSocket } from "@/context/socket";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";

// import peer from "peerjs";

const usePeer = () => {
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState("");
  const isPeerSet = useRef(false);
  const socket = useSocket();
  const roomId = useRouter().query.roomId;
  useEffect(() => {
    if (isPeerSet.current || !roomId || !socket) return;

    isPeerSet.current = true;
    (async function initPeer() {
      const myPeer = new (await import("peerjs")).default();
      setPeer(myPeer);
      myPeer.on("open", (id) => {
        console.log(`your peer id is ${id} `);
        console.log(`your socket id is ${socket.id}`);
        setMyId(id);
        socket?.emit("join-room", roomId, id);
      });
    })();
  }, [roomId, socket]);

  return { peer, myId };
};

export default usePeer;
