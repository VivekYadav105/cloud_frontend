const express = require("express")
const app = express()
const cors = require('cors')
const AWS = require('aws-sdk');
const fs = require('fs');

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:true}))
require('dotenv').config()
const path = require("path")

const apiSocket = process.env.apiSocket
const api = process.env.api
const port = process.env.port || 3000



const endpoints = {
    "Nikto":{
        aboutLink:"https://www.cirt.net/Nikto2",
        apiEndPoint: apiSocket+"/nikto",
        value:"Nikto"
    },
    "Nmap":{
        aboutLink:"https://sqlmap.org/",
        apiEndPoint:api+"/Nmap",
        value:"Nmap"
    },
    "WhatWeb":{
        aboutLink:"https://www.cirt.net/whatweb",
        apiEndPoint:api+"/whatweb",
        value:"WhatWeb",
    },
    "Whois":{
        aboutLink:"https://www.cirt.net/Nikto2",
        apiEndPoint:api+"/whois",
        value:"Whois Lookup"
    },
    "Scan":{
        aboutLink:"https://www.crit.net/Nikto2",
        apiEndPoint:apiSocket+"/scanfile",
        value:"Scan file"
    },
    "Upload":{
        aboutLink:"https://www.cirt.net/Nikto2",
        apiEndPoint:api+"/uploadfile",
        value:"Upload file",
    },
}

app.set("view engine",'ejs')
app.use("/static",express.static(path.join(__dirname,"static")))

app.get("/",(req,res,next)=>{
    res.render("landing page.ejs")
})

app.get("/scan",(req,res,next)=>{
    res.render("scanBar.ejs")
})

app.get("/uploadtoS3",(req,res,next)=>{
//aadd your keys
// Upload the file to the S3 bucket
s3.upload(uploadParams, (err, data) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`File uploaded successfully. File location: ${data.Location}`);
    res.json({
        data:{
            url:data.Location,
            dataObject:data
        }
    })
  }
});
})

app.get("/downloadReport",(req,res,next)=>{
    res.sendFile("http://localhost:8000/download/niktoreport/1683491314/report.html")
})

app.listen(port,()=>{
    console.log("connected to port ")
})