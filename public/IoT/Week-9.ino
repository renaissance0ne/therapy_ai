#include <ESP8266WiFi.h>
#include <DHT.h>

// Replace with your WiFi credentials
const char* ssid = "YOUR_WIFI_SSID"; 
const char* password = "YOUR_WIFI_PASSWORD";

// Define the port for the TCP Server
WiFiServer wifiServer(8080);

// DHT sensor setup
#define DHTPIN D3
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  dht.begin();
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.print("Connected to WiFi. IP: ");
  Serial.println(WiFi.localIP());

  // Start the TCP Server
  wifiServer.begin();
}

void loop() {
  // Check if a client (mobile app) has connected
  WiFiClient client = wifiServer.available();

  if (client) {
    while (client.connected()) {
      // Check if the client sent any data/request
      while (client.available() > 0) {
        // Read sensor data
        float h = dht.readHumidity();
        float t = dht.readTemperature();

        // Check if readings are valid
        if (isnan(h) || isnan(t)) {
          client.println("Failed to read from DHT sensor!");
        } else {
          // Send data to the Mobile App (Client)
          client.print("Humidity: ");
          client.print(h);
          client.print("%  Temperature: ");
          client.print(t);
          client.println("°C");
          
          // Also print to Serial Monitor for debugging
          Serial.print("Sent: H:"); Serial.print(h); Serial.print(" T:"); Serial.println(t);
        }
        delay(2000); // Wait 2 seconds before next reading
      }
    }
    client.stop();
    Serial.println("Client disconnected");
  }
}