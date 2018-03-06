var express = require("express")
var app = express()

var bodyParser = require("body-parser")
var fs         = require("fs")
var nodemailer = require("nodemailer")

/* Mailer */
var transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "gherrera@luckyintelligence.com",
		pass: "mundoweb666"
	}
})

app.use(bodyParser.urlencoded({
	extended: false
}))

app.use("/index/css", express.static(__dirname + "/css"))
app.use("/index/js", express.static(__dirname + "/js"))
app.use("/index/img", express.static(__dirname + "/img"))

app.use("/axtel/css", express.static(__dirname + "/axtel/css"))
app.use("/axtel/js", express.static(__dirname + "/axtel/js"))
app.use("/axtel/img", express.static(__dirname + "/axtel/img"))

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html")
})

app.get("/axtel", (req, res) => {
	res.sendFile(__dirname + "/axtel/index.html")
})

app.get("/internet", (req, res) => {
	res.sendFile(__dirname + "/axtel/Internet.html")
})

app.get("/tv", (req, res) => {
	res.sendFile(__dirname + "/axtel/tv.html")
})

app.post("/sendImage", (req, res) => {
	var b = req.body
	var img = decodeURIComponent(b.dataImage.replace(/^data:image\/\w+;base64,/, ""))
	var buf = new Buffer(img, "base64")
	//Writing image to local folder
	fs.writeFile(__dirname + "/ImagenesClientes/Contratacion.png", buf)

	//Sending email
	var mailOptions = {
		from: "4luch3rd1@gmail.com",
		to: "mgonzalez@luckyintelligence.com, gyaniz@luckyintelligence.com, gherrera@luckyintelligence.com, ksahali@luckyintelligence.com",
		subject: "Imagen de contratación Axtel",
		text: "Cuerpo de prueba del correo",
		attachments: [{
			filename: "Contratacion.jpg",
			content: img,
			encoding: "base64"
		}]
	}

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error)
			res.send("Error al enviar el correo")
		} else {
			console.log("Correo enviado")
		}
	})


	res.send("200")
})

app.listen(8080, () => console.log("Listening to 80"))