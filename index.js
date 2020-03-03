const fetch = require('node-fetch')
const https = require('https')
const fs = require('fs')
const crypto = require("crypto")
var AWS = require('aws-sdk')
const proxyList = require("./proxylist")
var proxy = require('proxy-agent')

url = 'https://prnt.sc/'
regexp_full = /screenshot-image" src="(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
regexp_final = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
counter = 0

const downloadRandom = async() => {
    const id = crypto.randomBytes(3).toString('hex')
    console.log(id)

    await fetch(`${url}${id}`,{method: "get"})
    .then(res => res.text())
    .then(text => {
        if (text.match(regexp_full)) {
            const photo_url = text.match(regexp_full)[0].match(regexp_final)[0].replace('"','')
            const file = fs.createWriteStream(`./results/${counter++}_${id}.png`)
            https.get(photo_url, response => response.pipe(file))
            file.on('finish', () => file.close())
        }else{
            console.log(`Bad id "${id}"`)
        }
    })
}

const main = () => {
    i=0
    const id = setInterval(() => {
        AWS.config.update({
            httpOptions: { agent: proxy("http://" + proxyList[i].host) }
        })
        console.log(AWS.config.httpOptions.agent.proxyUri)
        downloadRandom()
        i>50 ?i =0: i++
        if (counter > 500) clearInterval(id)
    }, 2000);
}
main()



