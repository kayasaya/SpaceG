var express = require("express")
var app = express()

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

app.listen(80, () => console.log("Listening to 80"))