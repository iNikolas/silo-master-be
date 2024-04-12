#include <EEPROM.h>
#include <ArduinoJson.h>

const int ledPin = 13;
bool ledState = false;

const size_t bufferSize = JSON_OBJECT_SIZE(2);

StaticJsonDocument<bufferSize> jsonDoc;

const int EEPROM_LED_STATE_ADDRESS = 0;

void loadStateFromEEPROM();
void saveStateToEEPROM();
void processSerialInput();
void toggleLED();
void setLEDState(bool newState);
void sendStateToGUI();
void sendErrorToGUI(const char* errorMessage);

void setup() {
  Serial.begin(9600);

  pinMode(ledPin, OUTPUT);

  loadStateFromEEPROM();
}

void loop() {
  processSerialInput();

  delay(100);
}

void loadStateFromEEPROM() {
  ledState = EEPROM.read(EEPROM_LED_STATE_ADDRESS);
  digitalWrite(ledPin, ledState ? HIGH : LOW);
}

void saveStateToEEPROM() {
  EEPROM.update(EEPROM_LED_STATE_ADDRESS, ledState);
}

void processSerialInput() {
  if (Serial.available() == 0) return;

  String input = Serial.readStringUntil('\n');
  DeserializationError error = deserializeJson(jsonDoc, input);

  if (error) {
    sendErrorToGUI("JSON parsing failed");
    return;
  }

  if (!jsonDoc.containsKey("command")) {
    sendErrorToGUI("Invalid JSON data");
    return;
  }

  String command = jsonDoc["command"];

  if (command == "toggleLED") {
    toggleLED();
    return;
  }

  if (command == "setLEDState") {
    if (jsonDoc.containsKey("state")) {
      bool newState = jsonDoc["state"];
      setLEDState(newState);
      return;
    }
    sendErrorToGUI("Missing 'state' key");
    return;
  }

  if (command == "getState") {
    sendStateToGUI();
    return;
  }

  sendErrorToGUI("Unknown command");
}

void toggleLED() {
  ledState = !ledState;
  digitalWrite(ledPin, ledState ? HIGH : LOW);
  saveStateToEEPROM();
  sendStateToGUI();
}

void setLEDState(bool newState) {
  ledState = newState;
  digitalWrite(ledPin, ledState ? HIGH : LOW);
  saveStateToEEPROM();
  sendStateToGUI();
}

void sendStateToGUI() {
  jsonDoc.clear();
  jsonDoc["ledState"] = ledState;
  String output;
  serializeJson(jsonDoc, output);
  Serial.println(output);
}

void sendErrorToGUI(const char* errorMessage) {
  jsonDoc.clear();
  jsonDoc["error"] = errorMessage;
  String output;
  serializeJson(jsonDoc, output);
  Serial.println(output);
}
