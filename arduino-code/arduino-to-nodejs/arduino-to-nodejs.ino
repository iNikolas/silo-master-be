#include <EEPROM.h>
#include <ArduinoJson.h>

const int ledPin = 13;
bool ledState = false;

const int dimmerPin = 11;
int dimmerPinBrightness = 0;

const int EEPROM_LED_STATE_ADDRESS = 0;
const int EEPROM_DIMMER_STATE_ADDRESS = 1;

const int MAX_BRIGHTNESS = 255;
const int MAX_BRIGHTNESS_PERCENTAGE = 100;

const size_t bufferSize = JSON_OBJECT_SIZE(2);
StaticJsonDocument<bufferSize> jsonDoc;

void loadStateFromEEPROM();
void saveStateToEEPROM();
void processSerialInput();
void toggleLED();
void setLEDState(bool newState);
void setDimmerBrightnessPercentage(int brightnessPercentage);
void sendStateToGUI();
void sendErrorToGUI(const char* errorMessage);

void setup() {
  Serial.begin(115200);

  pinMode(ledPin, OUTPUT);
  pinMode(dimmerPin, OUTPUT);

  loadStateFromEEPROM();
}

void loop() {
  processSerialInput();
  delay(100);
}

void loadStateFromEEPROM() {
  ledState = EEPROM.read(EEPROM_LED_STATE_ADDRESS);
  digitalWrite(ledPin, ledState ? HIGH : LOW);

  dimmerPinBrightness = EEPROM.read(EEPROM_DIMMER_STATE_ADDRESS);
  analogWrite(dimmerPin, dimmerPinBrightness);
}

void saveStateToEEPROM() {
  EEPROM.update(EEPROM_LED_STATE_ADDRESS, ledState);
  EEPROM.update(EEPROM_DIMMER_STATE_ADDRESS, dimmerPinBrightness);
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
  } else if (command == "setLEDBrightness") {
    if (jsonDoc.containsKey("brightness")) {
      int brightnessPercentage = jsonDoc["brightness"];
      setDimmerBrightnessPercentage(brightnessPercentage);
    } else {
      sendErrorToGUI("Missing 'brightness' key");
    }
  } else if (command == "setLEDState") {
    if (jsonDoc.containsKey("state")) {
      bool newState = jsonDoc["state"];
      setLEDState(newState);
    } else {
      sendErrorToGUI("Missing 'state' key");
    }
  } else if (command == "getState") {
    sendStateToGUI();
  } else {
    sendErrorToGUI("Unknown command");
  }
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

void setDimmerBrightnessPercentage(int brightnessPercentage) {
  int newBrightness = map(brightnessPercentage, 0, MAX_BRIGHTNESS_PERCENTAGE, 0, MAX_BRIGHTNESS);
  dimmerPinBrightness = newBrightness;
  analogWrite(dimmerPin, dimmerPinBrightness);
  saveStateToEEPROM();
  sendStateToGUI();
}

void sendStateToGUI() {
  jsonDoc.clear();
  jsonDoc["ledState"] = ledState;
  jsonDoc["dimmerState"] = map(dimmerPinBrightness, 0, MAX_BRIGHTNESS, 0, MAX_BRIGHTNESS_PERCENTAGE);
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
