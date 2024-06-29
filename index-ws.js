const express = require("express");
const app = express(); // Initialize the Express app
const server = require("http").createServer(); // Create the HTTP server and pass the Express app

app.get("/", function(req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(4000, function() {
  console.log("server started on port 3000");
});

const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({ server: server });

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("Clients connected", numClients);

  wss.broadcast(`current visitors : ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send(`welcome to my sever`);
  }

  ws.on(`close`, function close() {
    ws.broadcast(`current visitors : ${numClients}`);
    console.log(`A client has connected`);
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

// const express = require("express");
// const app = express(); // Initialize the Express app
// const http = require("http");
// const server = http.createServer(app); // Create the HTTP server and pass the Express app

// // Serve the HTML file
// app.get("/", function(req, res) {
//   res.sendFile("index.html", { root: __dirname });
// });

// // Start the server
// server.listen(3000, function() {
//   console.log("server started on port 3000");
// });

// const WebSocket = require("ws");
// const wss = new WebSocket.Server({ server }); // Create WebSocket server, share HTTP server

// // Handle WebSocket connections
// wss.on("connection", function connection(ws) {
//   const numClients = wss.clients.size;
//   console.log("Clients connected", numClients);

//   wss.broadcast(`current visitors : ${numClients}`);

//   if (ws.readyState === WebSocket.OPEN) {
//     ws.send(`welcome to my server`);
//   }

//   ws.on("close", function close() {
//     const numClients = wss.clients.size; // Update numClients after disconnection
//     wss.broadcast(`current visitors : ${numClients}`);
//     console.log("A client has disconnected");
//   });
// });

// // Broadcast helper function
// wss.broadcast = function broadcast(data) {
//   wss.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// };
