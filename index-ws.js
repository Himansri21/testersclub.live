const http = require("http");
const WebSocketServer = require("ws").Server;
const sqlite = require("sqlite3");

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Set the response HTTP header with HTTP status and Content type
  res.writeHead(200, { "Content-Type": "text/plain" });

  // Send the response body "Hello, World!"
  res.end("Hello, World!\n");
});

// The server listens on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
});

/** Begin websocket */
const wss = new WebSocketServer({ server });

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  wss.clients.forEach(client => {
    client.close();
  });
  server.close(() => {
    shutdownDB();
    process.exit(0);
  });
});

wss.on("connection", ws => {
  const numClients = wss.clients.size;
  console.log("Clients connected:", numClients);

  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server");
  }

  db.run(
    `INSERT INTO visitors (count, time) VALUES (?, datetime('now'))`,
    [numClients],
    err => {
      if (err) {
        console.error("Error inserting into database:", err.message);
      }
    }
  );

  ws.on("close", () => {
    console.log("A client has disconnected");
    const updatedNumClients = wss.clients.size;
    wss.broadcast(`Current visitors: ${updatedNumClients}`);
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
};

/** End websocket */

/** Begin database */
const db = new sqlite.Database(":memory:");

db.serialize(() => {
  db.run(
    `
    CREATE TABLE visitors (
      count INTEGER,
      time TEXT
    )
  `,
    err => {
      if (err) {
        console.error("Error creating table:", err.message);
      }
    }
  );
});

function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    if (err) {
      console.error("Error fetching counts:", err.message);
    } else {
      console.log(row);
    }
  });
}

function shutdownDB() {
  console.log("Shutting down database...");
  getCounts();
  db.close(err => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database closed successfully.");
    }
  });
}
/** End database */
