import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export const SocketProvider = (props) => {
  const { children } = props;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const connection = io();
    setSocket(connection);
  }, []);

  socket?.on("connect_error", async (err) => {
    console.log("connection error at the client side", err);
    await fetch("/api/socket");
  });

  console.log("socket", socket?.id);
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
