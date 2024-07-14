import WebSocket from "ws";

let wss: WebSocket.Server;

export const setWebSocketServer = (server: WebSocket.Server): void => {
  wss = server;
};

export const broadcast = (message: any): void => {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
};
