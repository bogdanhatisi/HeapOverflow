import WebSocket from "ws";

const socket = new WebSocket("ws://localhost:3000");

socket.on("open", () => {
  console.log("Connected to WebSocket server");
});

socket.on("message", (event: any) => {
  const message = JSON.parse(event.toString());
  if (message.type === "newAnswer") {
    console.log("New answer posted:", message.data);
    // Update the UI with the new answer (for now, we'll just log it)
  } else if (message.type === "newVote") {
    console.log("New vote posted:", message.data);
  } else if (message.type === "newQuestion") {
    console.log("New question posted:", message.data);
  }
});
