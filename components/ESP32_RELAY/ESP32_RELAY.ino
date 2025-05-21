#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "marts_2.4";
const char* password = "M@rtewifi1803";

// WebSocket server details
const char* serverAddress = "192.168.1.5";  // Replace with your server's IP address
const int serverPort = 4000;

WebSocketsClient webSocket;

// Relay pin
const int relayPin = 21;

// Local status variable for app1
bool app1Status = false;

void setup() {
    Serial.begin(115200);
    Serial1.begin(115200);  // Initialize serial communication
    delay(1000);

    // Initialize relay pin
    pinMode(relayPin, OUTPUT);
    digitalWrite(relayPin, LOW);  // Ensure relay is off initially

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
            handleWebSocketMessage((char *)payload, length);
            forwardToATmega((char *)payload, length);  // Assuming Serial1 is connected to ATmega
            break;
        case WStype_DISCONNECTED:
            Serial.println("Disconnected from WebSocket server");
            break;
        default:
            break;
    }
}

void handleWebSocketMessage(char* message, size_t length) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message, length);
    if (error) {
        Serial.print("Failed to parse message: ");
        Serial.println(error.c_str());
        return;
    }

    // Update app1 status
    if (doc.containsKey("app1")) {
        app1Status = doc["app1"];
        Serial.print("app1 status: ");
        Serial.println(app1Status ? "true" : "false");
        digitalWrite(relayPin, app1Status ? HIGH : LOW);
    }
}

void forwardToATmega(char * data, size_t length) {
    // Send data to ATmega via Serial1
    Serial1.write(data, length);
}
