const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const mysql = require('mysql2');

const app = express();

app.use(cors({
  origin: 'http://13.210.151.196:3000', // Replace with your frontend URL
  methods: ['GET', 'POST'], // Allow GET and POST requests
}));

app.use(bodyParser.json());

let statuses = {
  app1: false,
  app2: false,
  app3: false
};

const server = app.listen(4000, () => {
  console.log('Server is running on http://13.210.151.196:4000');
});

const db = mysql.createPool({
  host: 'localhost',  
  user: 'root',  
  password: 'admindbpw',  
  database: 'DesignDB'  
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify(statuses)); // Send initial status when a client connects

  ws.on('message', (data) => {
    try {
      const parsedData = JSON.parse(data);
      console.log(parsedData);

      const app_id = Object.keys(parsedData)[0];
      const status = parsedData[app_id];

      // Check if the message is from the ESP32 by looking for voltage, current, or power keys
      const isESP32Message = parsedData.hasOwnProperty('voltage') || parsedData.hasOwnProperty('current') || parsedData.hasOwnProperty('power');

      // Handle messages from the frontend (status updates)
      if (['app1', 'app2', 'app3'].includes(app_id) && !isESP32Message) {
        if (statuses[app_id] !== status) { // Only proceed if the status has changed
          statuses[app_id] = status;

          // Insert the status into the appliance_status table
          const statusSql = 'INSERT INTO appliance_status (appliance_id, status) VALUES (?, ?)';
          db.query(statusSql, [app_id, status ? 'on' : 'off'], (err, result) => {
            if (err) {
              console.error('Error inserting status into database:', err);
            } else {
              console.log('Status inserted successfully:', result.insertId);
            }
          });

          // Broadcast updated statuses to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(statuses));
            }
          });
        }
      }

      // Handle messages from the ESP32 (sensor data)
      if (isESP32Message) {
        const { voltage, current, power } = parsedData;
        if (voltage !== undefined && current !== undefined && power !== undefined) {
          const readingsSql = 'INSERT INTO readings (appliance_id, voltage, current, power) VALUES (?, ?, ?, ?)';
          db.query(readingsSql, [app_id, voltage, current, power], (err, result) => {
            if (err) {
              console.error('Error inserting data into database:', err);
            } else {
              console.log('Data inserted successfully:', result.insertId);
            }
          });
        }
      }

    } catch (error) {
      console.error('Error parsing data:', error);
    }
  });
});

// Endpoint to get current statuses
app.get('/update', (req, res) => {
  res.json(statuses);
});

app.get('/power-consumption/:appliance_id', (req, res) => {
  const applianceId = req.params.appliance_id;

  const sql = 'SELECT * FROM power_consumption WHERE appliance_id = ?';
  db.query(sql, [applianceId], (err, results) => {
    if (err) {
      console.error('Error fetching power consumption:', err);
      res.status(500).json({ error: 'Database error' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Appliance not found' });
    } else {
      res.json(results[0]);
      console.log(results);
    }
  });
});
