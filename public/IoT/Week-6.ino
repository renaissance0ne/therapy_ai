#include <ESP8266WiFi.h>
String apiKey = "NS5ELAWG7D1K06ZI";     
const char *ssid =  "Namaka Drohi";     
const char *pass =  "123456789";
const char* server = "api.thingspeak.com";
#define IRpin D4         
WiFiClient client;
int value; 
void setup() 
{
Serial.begin(115200);
pinMode(IRpin, INPUT); 
delay(1000);
Serial.println("Connecting to ");
Serial.println(ssid);
WiFi.begin(ssid, pass);
while (WiFi.status() != WL_CONNECTED)
{
delay(2000);
Serial.print(".");
}
Serial.println("   ");
Serial.println("WiFi connected");                                                     
}
void loop(){
 value = digitalRead(IRpin);           
Serial.println(value);
  if(value==0) 
  {
  Serial.print("object detected");
  }
  else
  {
  Serial.print("no object detected");
  }
if (client.connect(server,80))   
{
String postStr = apiKey;
postStr +="&field1=";
postStr += String(value);
postStr += "\r\n\r\n";

client.print("POST /update HTTP/1.1\n");
client.print("Host: api.thingspeak.com\n");
client.print("Connection: close\n");
client.print("X-THINGSPEAKAPIKEY: "+apiKey+"\n");
client.print("Content-Type: application/x-www-form-urlencoded\n");
client.print("Content-Length: ");
client.print(postStr.length());
client.print("\n\n");
client.print(postStr);
client.stop();

Serial.println("Waiting...");

delay(1000);
}
}
