var mysql = require('mysql'); //Módulo de conexión con MySQL
var express = require('express'); //Módulo de servidor web
var session = require('express-session'); //Módulo administrador de sesiones para Express
var bodyParser = require('body-parser'); //Facilita la lectura del body de las peticiones
var path = require('path'); //Permite la lectura del directorio

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'nodelogin'
});//Se define la conexión con MySQL

var app = express(); //Se crea una instancia de Express

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
})); //Se definen opciones de la sesión


app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json()); //Parsea la petición como JSON

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
}); //Entrega la página principal a petición

app.post('/auth', function(request, response) { //Ejecuta la validación al enviar la petición por POST a /auth
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Usuario o contraseña incorrecta');
			}			
			response.end();
		});
	} else {
		response.send('Por favor ingresa usuario y contraseña.'); //Solo se envía en peticiones no validadas por la página
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Bienvenido, ' + request.session.username + '!');
	} else {
		response.send('Inicia sesión para ver esta página.');
	}
	response.end();
}); //Entrega /home a petición

app.listen(8081);
console.log("Servidor iniciado en http://localhost:8081 . Ctrl + C para detener.");