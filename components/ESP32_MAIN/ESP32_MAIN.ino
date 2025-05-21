#include <WiFi.h>
#include <WebSocketsClient.h>

// WiFi credentials
const char* ssid = "marts_2.4";
const char* password = "M@rtewifi1803";

// WebSocket server details
const char* serverAddress = "13.210.151.196";  // Replace with your server's IP address
const int serverPort = 4000;

WebSocketsClient webSocket;

void setup() {
    Serial.begin(115200);
    Serial1.begin(115200);  // Initialize serial communication
    delay(1000);

    // Connect to WiFi
    Serial.print("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connecting...");
    }
    Serial.println("Connected to WiFi");

    // Configure WebSocket server and events
    webSocket.begin(serverAddress, serverPort, "/");
    webSocket.onEvent(webSocketEvent);
}

void loop() {
    webSocket.loop();  // Handle WebSocket events
}

void sendStatusToServer(String data) {
    if (webSocket.isConnected()) {
        webSocket.sendTXT(data);  // Send data to WebSocket server
        Serial.println("Sent data to server: " + data);
    } else {
        Serial.println("WebSocket not connected. Data not sent.");
    }
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_CONNECTED:
            Serial.println("Connected to WebSocket server");
            break;
        case WStype_TEXT:
            Serial.printf("Received message: %s\n", payload);
            forwardToATmega(payload, length);  // Correctly passing payload and length
            break;
        case WStype_DISCONNECTED:
            Serial.println("Disconnected from WebSocket server");
            break;
        default:
            break;
    }
}

void forwardToATmega(uint8_t *data, size_t length) {
    // Send data to ATmega via Serial1
    Serial1.write(data, length);
}
