const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws'); // Import WebSocket library
const app = express();

app.use(bodyParser.json());

// Example data (initial status)
let statuses = {
  app1: false,
  app2: false,
  app3: false
};

// Create an HTTP server
const server = app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  // Send initial status when a client connects
  ws.send(JSON.stringify(statuses));
  
  // Example: Receive data from ESP32 and broadcast to all connected clients
  ws.on('message', (data) => {
    try {
      const parsedData = JSON.parse(data);

      if (parsedData.hasOwnProperty('app1')) {
        statuses.app1 = parsedData.app1;
      }
      if (parsedData.hasOwnProperty('app2')) {
        statuses.app2 = parsedData.app2;
      }
      if (parsedData.hasOwnProperty('app3')) {
        statuses.app3 = parsedData.app3;
      }

      // Broadcast updated statuses to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(statuses));
        }
      });
    } catch (error) {
      console.error('Error parsing data:', error);
    }
  });
});

// Endpoint to get current statuses
app.get('/update', (req, res) => {
  res.json(statuses);
});
