const { Server } = require("socket.io");
let io;
function createSocketsServer(server) {
  if (!io) {
    io = new Server(server, {
      cors: "*",
    });
  }
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  });
}
function emitReviewEvent(data) {
  io.emit("giveFeedback", data);
}
module.exports = { createSocketsServer, emitReviewEvent };
