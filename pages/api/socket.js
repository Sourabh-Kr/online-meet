import { Server } from "socket.io";

const socketHandler = (req, res) => {
  console.log("socketHandler api called");
  if (res.socket.server.io) {
    console.log("socket already running");
  } else {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    io.on("connection", () => {
      console.log("server is connected");
    });
  }
  res.end();
};

export default socketHandler;
