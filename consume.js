var consume = function (config) {
    var xhttp = new XMLHttpRequest()

    xhttp.open(
        "POST",
        config.url,
        true
    )

    xhttp.setRequestHeader("Content-type", "application/json")

    xhttp.send(JSON.stringify(config.params))
    
    return new Promise ( function (resolve, reject) {
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var jsonRes = JSON.parse(xhttp.response)
                
                if (jsonRes) {
                    resolve(jsonRes)
                } else {
                    reject("Error al consumir el servicio")
                }
            }
        }
    })
}