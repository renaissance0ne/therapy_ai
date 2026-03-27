#include <ESP8266WiFi.h>
#include <WiFiUdp.h>
#include <DHT.h>

// WiFi Credentials
const char* ssid = "349";
const char* password = "12341234";

// UDP Settings
const char* udpAddress = "192.168.1.181"; // The IP of your phone/client
const int udpPort = 8081;

#define DHTPIN D3
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);
WiFiUDP udp;

void setup() {
  Serial.begin(115200);
  dht.begin();

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected.");
  Serial.print("Local IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  delay(2000);

  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Printing to Serial Monitor
  Serial.print("Temperature: "); Serial.print(temperature); Serial.println("°C");
  Serial.print("Humidity: "); Serial.print(humidity); Serial.println("%");

  // Sending data over UDP
  Serial.println("Sending data over UDP...");
  
  udp.beginPacket(udpAddress, udpPort);
  udp.print("Temperature: ");
  udp.print(temperature);
  udp.print("°C, Humidity: ");
  udp.print(humidity);
  udp.print("%");
  udp.endPacket();

  Serial.println("Data Sent over UDP!");
}