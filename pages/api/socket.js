import { Server } from "socket.io";

const socketHandler = (req, res) => {
  console.log("socketHandler api called");
  if (res.socket.server.io) {
    console.log("socket already running");
  } else {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    io.on("connection", (socket) => {
      console.log("client is connected to server", socket.id);
      socket.on("join-room", (roomId, userId) => {
        console.log(`A new user with ${userId} join room ${roomId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);
      });
      socket.on("user-toggle-audio", (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
      });
      socket.on("user-toggle-video", (userId, roomId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-toggle-video", userId);
      });
      socket.on("user-leave", (userId, roomId) => {
        socket.broadcast.to(roomId).emit("user-leave", userId);
      });
    });
  }
  res.end();
};

export default socketHandler;
