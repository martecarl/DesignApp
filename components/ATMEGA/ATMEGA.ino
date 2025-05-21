// Define output pins connected to devices
const int outputPins[3] = {13, 12, 11}; // Output pins for state

void setup() {
  Serial.begin(115200); // Initialize serial communication
  for (int i = 0; i < 3; i++) {
    pinMode(outputPins[i], OUTPUT);
  }
}

void loop() {
  if (Serial.available()) {
    String receivedData = Serial.readStringUntil('\n');
    Serial.print("Received data from ESP32: ");
    Serial.println(receivedData);

    // Debugging: Print received data length
    Serial.print("Received data length: ");
    Serial.println(receivedData.length());

    // Parse JSON-like data
    bool app1Status = false;
    bool app2Status = false;
    bool app3Status = false;

    // Example: Parse JSON-like data
    if (receivedData.length() > 0) {
      if (receivedData.indexOf("app1\":true") > 0) {
        app1Status = true;
      }
      if (receivedData.indexOf("app2\":true") > 0) {
        app2Status = true;
      }
      if (receivedData.indexOf("app3\":true") > 0) {
        app3Status = true;
      }
    }

    // Debugging: Print parsed statuses
    Serial.print("App1 Status: ");
    Serial.println(app1Status ? "On" : "Off");
    Serial.print("App2 Status: ");
    Serial.println(app2Status ? "On" : "Off");
    Serial.print("App3 Status: ");
    Serial.println(app3Status ? "On" : "Off");

    // Determine the state based on app1Status, app2Status, and app3Status
    byte state = 0;
    if (!app1Status && !app2Status && !app3Status) {
      state = 0; // 000
    } else if (app1Status && !app2Status && !app3Status) {
      state = 1; // 001
    } else if (!app1Status && app2Status && !app3Status) {
      state = 2; // 010
    } else if (!app1Status && !app2Status && app3Status) {
      state = 3; // 011
    } else if (app1Status && app2Status && !app3Status) {
      state = 4; // 100
    } else if (!app1Status && app2Status && app3Status) {
      state = 5; // 101
    } else if (app1Status && !app2Status && app3Status) {
      state = 6; // 110
    } else if (app1Status && app2Status && app3Status) {
      state = 7; // 111
    }

    // Output the current state to pins 13, 12, and 11
    for (int i = 0; i < 3; i++) {
      digitalWrite(outputPins[2 - i], (state >> i) & 0x01); // Output the corresponding bit to each pin
    }

    // Print the state of pins 11, 12, and 13
    Serial.print("Pin 11 state: ");
    Serial.println(digitalRead(11) == HIGH ? "HIGH" : "LOW");
    Serial.print("Pin 12 state: ");
    Serial.println(digitalRead(12) == HIGH ? "HIGH" : "LOW");
    Serial.print("Pin 13 state: ");
    Serial.println(digitalRead(13) == HIGH ? "HIGH" : "LOW");
  }
}
