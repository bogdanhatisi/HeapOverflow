import http from "http";
import WebSocket from "ws";
import app from "./app";
import { setWebSocketServer } from "./utils/websocket";

const PORT: number | string = process.env.PORT || 3000;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

setWebSocketServer(wss);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
