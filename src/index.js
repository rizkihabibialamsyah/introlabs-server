const express = require('express');
const session = require('express-session');
const fs = require('fs');
const http = require('http');
const path = require('path');
const bcrypt = require('bcrypt');
const WebSocket = require('ws');
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

// Deklarasi port untuk komunikasi serial
const port = new SerialPort({
    path: '/dev/serial0',
    baudRate: 115200,
  })

// Membuat express app dan server
const app = express();
const server = http.createServer(app);

// Menggunakan format urlencoded untuk menerima data dari browser
app.use(express.urlencoded({ extended: false }));

// Set konfigurasi session
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 600000 }, resave: true, saveUninitialized: true}))

// Variabel untuk menyimpan data user
let users = [];
let controlUserCount = 0, viewUserCount = 0;

// Data hasil pengukuran
let sensorData = {
	r:0,
	t:0,
	p:0
};

// Data perintah user
let order = {
	r:0,	// rotation speed
	t:0,	// temperature
	a:0,	// pneumatic A
	b:0,	// pneumatic B
	c:0,	// pneumatic C
	k:1,	// kp
	i:0,	// ki
	d:0,	// kd
	o:3,	// offset bang-bang
	s:90	// servo position
};

let rTimeoutID, tTimeoutID, pTimeoutID;

// Baca database user dan password
fs.readFile('./admin/users.json', 'utf8', (err, jsonString) => {
	if (err) {
	    console.log("File read failed:", err)
	    return
	}
	users = JSON.parse(jsonString);
});

// Serving halaman login
app.get('/', (req, res) => {
	res.redirect('/login');
});

app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/login/index.html'))
});

app.get('/login/*', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', req.path))
});

// Serving node_modules
app.get('/node_modules/*', (req, res) => {
	res.sendFile(path.join(__dirname, req.path));
});

// Serving logo
app.get('/logo.png', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/logo.png'))
});

// Proses pengecekan login/autentikasi user
app.post('/login', async (req, res) => {
  try{
      let foundUser = users.find((data) => req.body.username === data.username);
      if (foundUser) {

          let submittedPass = req.body.password;
          let storedPass = foundUser.password;

          const passwordMatch = await bcrypt.compare(submittedPass, storedPass);
          if (passwordMatch) {
              let usrname = foundUser.username;
		if (foundUser.type == 'control' && controlUserCount < 1) {
				controlUserCount++;
				req.session.user = foundUser; //set cookie session
				if(req.session.prevUrl) res.redirect(req.session.prevUrl);
				res.redirect('/control');
				console.log(foundUser.username + " logged in");
		}
		else if (foundUser.type == 'view' && controlUserCount < 4){
			viewUserCount++;
			req.session.user = foundUser; //set cookie session
			if(req.session.prevUrl) res.redirect(req.session.prevUrl);
			res.redirect('/view');
		console.log(foundUser.username + " logged in");
		}
		else {
			res.send("<div align ='center'><h2>Maximum user reached</h2></div>");
		}
          } else {
              res.send("<div align ='center'><h2>Invalid username or password</h2></div><br><br><div align ='center'><a href='/login'>Back to login page</a></div>");
          }
      }
      else {
          res.send("<div align ='center'><h2>Invalid username or password</h2></div><br><br><div align='center'><a href='/login'>Back to login page<a><div>");
      }
  } catch (e){
      res.send("Internal server error");
			console.log(e);
  }
});

// Fungsi untuk mengecek apakah user telah login
function requireLogin(req, res, next){
  if (!req.session.user) {
          req.session.prevUrl = req.body.url;
          if(req.xhr) res.send({"err":"usrErr"});
          else res.redirect('/');
  }
  else next();
}

// Serving halaman control
app.get('/control', requireLogin, (req, res) => {
	res.sendFile(path.join(__dirname, 'public/control/index.html'));
});

// Serving halaman view
app.get('/view', requireLogin, (req, res) => {
	res.sendFile(path.join(__dirname, 'public/view/index.html'));
});

// Serving common file
app.get('/common/*', requireLogin, (req, res) => {
	res.sendFile(path.join(__dirname, 'public', req.path));
});


// Menerima data perintah dari browser
app.post('/control/data', requireLogin, (req, res) => {
	res.sendStatus(204);

	// Clear sequence lama
	clearTimeout(rTimeoutID);
	clearTimeout(tTimeoutID);
	clearTimeout(pTimeoutID);

	// Set konstanta PID dan offset bang-bang
	if (req.body.k[0] === '')
		order.k = 1;
	else
		order.k = parseFloat(req.body.k[0]);
	if (req.body.k[1] === '')
		order.i = 0
	else
		order.i = parseFloat(req.body.k[1]);
	if (req.body.k[2] === '')
		order.d = 0;
	else
		order.d = parseFloat(req.body.k[2]);
	if (req.body.o === '')
		order.o = 3;
	else
		order.o = parseInt(req.body.o);

	function setR(value) {
		if (value === '')
			order.r = 0;
		else {
			order.r = parseInt(value);
		}
	}

	function setT(value) {
		if (value === '')
			order.t = 0;
		else {
			order.t = parseInt(value);
		}
	}

	function setP(a, b, c) {
		order.a = a == 'on' ? 1 : 0;
		order.b = b == 'on' ? 1 : 0;
		order.c = c == 'on' ? 1 : 0;
	}

	// Set kecepatan, suhu, dan pneumatik awal
	setR(req.body.r[0]);
	setT(req.body.t[0]);
	setP(req.body.a1, req.body.b1, req.body.c1);

	// Buat sequence
	rTimeoutID = setTimeout(() => {
		setR(req.body.r[1]);
		rTimeoutID = setTimeout(() => {
			setR(req.body.r[2]);
			rTimeoutID = setTimeout(() => {
				setR(req.body.r[3]);
				rTimeoutID = setTimeout(() => {
					setR(req.body.r[4]);
					rTimeoutID = setTimeout(() => {
						setR(0);
					}, 1000 * req.body.rD[4]);
				}, 1000 * req.body.rD[3]);
			}, 1000 * req.body.rD[2]);
		}, 1000 * req.body.rD[1]);
	}, 1000 * req.body.rD[0]);

	tTimeoutID = setTimeout(() => {
		setT(req.body.t[1]);
		tTimeoutID = setTimeout(() => {
			setT(req.body.t[2]);
			tTimeoutID = setTimeout(() => {
				setT(req.body.t[3]);
				tTimeoutID = setTimeout(() => {
					setT(req.body.t[4]);
					tTimeoutID = setTimeout(() => {
						setT(0);
					}, 1000 * req.body.tD[4]);
				}, 1000 * req.body.tD[3]);
			}, 1000 * req.body.tD[2]);
		}, 1000 * req.body.tD[1]);
	}, 1000 * req.body.tD[0]);

	pTimeoutID = setTimeout(() => {
		setP(req.body.a2, req.body.b2, req.body.c2);
		pTimeoutID = setTimeout(() => {
			setP(req.body.a3, req.body.b3, req.body.c3);
			pTimeoutID = setTimeout(() => {
				setP(req.body.a4, req.body.b4, req.body.c4);
				pTimeoutID = setTimeout(() => {
					setP(req.body.a5, req.body.b5, req.body.c5);
					pTimeoutID = setTimeout(() => {
						setP(0, 0, 0);
					}, 1000 * req.body.pD[4]);
				}, 1000 * req.body.pD[3]);
			}, 1000 * req.body.pD[2]);
		}, 1000 * req.body.pD[1]);
	}, 1000 * req.body.pD[0]);

});

// Menerima perintah kontrol kamera dari browser
app.post('/control/cam', requireLogin, (req, res) => {
	if (req.body.camera == 'center')
		order.s = 90;
	else if ((order.s == 30 && req.body.camera > 0) || (order.s == 150 && req.body.camera < 0) || (order.s > 30 && order.s < 150))
		order.s += parseInt(req.body.camera);
	res.sendStatus(204);
});

// User logout
app.get('/logout',(req,res) => {
	if (req.session.user.type == 'control')
		controlUserCount--;
	else
		viewUserCount--;
	console.log(req.session.user.username + " logged out");
  req.session.destroy();
  res.redirect('/login');

});

// Listen HTTP server
server.listen(8080, () => {
	console.log("Server is listening on port 8080");
});

// Buat websocket server
const wss = new WebSocket.Server({
  port: 8081
});

// Proses saat koneksi websocket telah terhubung
wss.on('connection', function connection(ws) {
	// Error handling
	ws.on("error", (err) => {
		console.log(err.stack);
	});

	// Pengiriman data hasil pengukuran
	function sendData() {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(sensorData))
		}
	}

	// Set interval pengiriman data hasil pengukuran
	setInterval(sendData, 1000);
});


// Bagian komunikasi serial

//Parse JSON dan Error Checking
function tryParseJSONObject (jsonString){
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object",
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === "object") {
            return true;
        }
    }
    catch (e) { }

    return false;
};


//Initiate Parser, Read Serial
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
parser.on('data', function (data) {

    if(data == "break"){
        //If STM32 Cannot Parse Data
        console.log("breaking");
    }else if(tryParseJSONObject(data)){
        //Masuk Jika Parse JSON berhasil
        sensorData = JSON.parse(data);
        console.log("Sensor data Received ",data);
        console.log(sensorData.r);
        console.log(sensorData.t);
        console.log(sensorData.p);

        //Stringify and then send
        const jsonData = JSON.stringify(order);
        console.log("data will be sent -> ",jsonData);
        port.write(jsonData);
        port.write('\n');

    }else{
        //Other Data Handler
        console.log("Data Not Recognized");
        console.log("data : ",data);
    }
})
//Console.log buat status sama debugging
//Clearing CMD
//process.stdout.write('\033c');
