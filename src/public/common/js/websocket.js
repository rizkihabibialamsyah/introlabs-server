// Koneksi websocket
const socket = new WebSocket('ws://'+ window.location.hostname + ':8081');

// Data hasil pengukuran
let sensorData = {  
	speed:0,
	temp:0,
	press:0
};

// Terima data
socket.addEventListener('message', (event) => {
  var d = JSON.parse(event.data);
  sensorData.speed = d.r;
  sensorData.temp = d.t;
  sensorData.press = d.p;
});
