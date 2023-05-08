const testName = document.getElementById('test-name')
const testButtons = document.getElementsByClassName("test-button")
const aboutTest = document.getElementById("about-test")
const popUp = document.getElementById('pop-up')
const popUpText = document.querySelector('#pop-up #pop-up-text')
const popUpHeading = document.querySelector('#pop-up h1')
const inputField = document.forms[0][0]
const buttonWrapper = document.getElementById("button-wrapper")
let test = "Nikto"

var api = "http://127.0.0.1:8000"
var apiSocket = "ws://127.0.0.1:8000"


const endpoints = {
    "Nikto":{
        aboutLink:"https://www.cirt.net/Nikto2",
        apiEndPoint:apiSocket+"/niktoreport",
        value:"Nikto"
    },
    "Nmap":{
        aboutLink:"https://sqlmap.org/",
        apiEndPoint:apiSocket+"/nmap",
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
        apiEndPoint:api+"/getUploadUrl",
        value:"Upload file",
    },
}

function parseUrl(url){
    if(url.search("http://")==0 || url.search("https://")==0){
        url = url.replace("http://","")
        url = url.replace("https://","")
    }
    console.log(url.search("www"))
    if(url.search("www.")==0){
        url = url.replace('www.','')
    }
    console.log(url)
    return url
}


const addButtons = () => {
    Object.values(endpoints).forEach((i)=>{
        buttonWrapper.innerHTML+= `
        <button
            value = ${i.value}
            class="test-button inline-flex items-center justify-center h-12 px-6 font-semibold tracking-wide text-teal-900 transition duration-200 rounded shadow-md md:w-auto hover:text-deep-purple-900 bg-teal-accent-400 hover:bg-teal-accent-700 focus:shadow-outline focus:outline-none"
            style="background-color: #1DEBB8;"
            type="button"
            onClick="changeTestName(event)"
            aria-about=${i.aboutLink}
            >
            ${i.value}
        </button>
        `
    })
}


const changeTestName = (e)=>{
    testName.innerHTML = e.target.value
    test = e.target.value
    console.log(test)
    buttons = [].slice.call(buttonWrapper.children)

    buttons.forEach((i)=>{
        i.classList.remove('active')
    })
    e.target.classList.add('active')

    inputField.setAttribute('type','text')
    inputField.classList.remove("pt-2")
    if(test=="Upload"){
        inputField.setAttribute('type','file')
        
        inputField.style.backgroundColor = "white"
        inputField.classList.add("pt-2")
    }
    aboutTest.setAttribute('href',endpoints[test].aboutLink)
}


function init(){
    addButtons()
    buttonWrapper.children[0].classList.add('active')
    testName.innerHTML = test 
    aboutTest.setAttribute("href","https://www.cirt.net/Nikto2")
}

function closePopUp(){
    popUp.classList.add("hidden")
}


function renderHtml(data){
    popUp.innerText += JSON.stringify(data)
}

function uploadFile(file,req){
    const formData = new FormData();
    formData.append('key', file.name);
    formData.append("x-amz-algorithm",req.fields["x-amz-algorithm"])
    formData.append("x-amz-credential",req.fields["x-amz-credential"])
    formData.append("x-amz-date",req.fields["x-amz-date"])
    formData.append("policy",req.fields["policy"])
    formData.append("x-amz-signature",req.fields["x-amz-signature"])
    formData.append("file",file) 
    
    fetch(req.url,{
        method:"POST",
        mode:"cors",
        headers: {
            "Content-Type":"multipart/form-data"
        },
        body:formData}).then((res)=>res.json()).then((data)=>{
            console.log(data)
        })

}


async function submitForm(e){
    e.preventDefault();
    popUpText.innerText = ""
    popUpHeading.innerText = ""
    let url = e.target[0].value;

    popUp.classList.remove("hidden")
    popUpHeading.innerText = test 

    if(test=="Scan"){
        console.log("hello")
        const socket = new WebSocket(endpoints[test].apiEndPoint)
        socket.onopen = (e)=>{
            socket.send(url)
        }
        socket.onmessage = (e)=>{
            popUpText.innerText += JSON.stringify(e.data)
            popUpText.innerHTML += "<br/>"
        }
        return 
    }

    if(test=="Upload"){
        console.log("inside")
        console.log(e.target[0].files[0].name)
        const sendFile = await fetch(endpoints[test].apiEndPoint,{
            // mode:'cors',
            headers:{
                "content-type":"application/json"
            },
            method:"post",
            body: JSON.stringify({"filename":e.target[0].files[0].name})
            
        }).then((res)=>res.json()).then(data=>uploadFile(e.target[0].files[0],data))
        return         
    }
    console.log("outside")
    if(test=="Nikto" || test=="Nmap" || test=="Scan"){
        if(test!="Scan")  url = parseUrl(url)
        const socket = new WebSocket(endpoints[test].apiEndPoint)
        socket.onopen = (e)=>{
            socket.send(url)
        }
        socket.onclose = (e)=>{
            console.log("socket is closed")
            popUpText.innerHTML+=`<form action="POST" action = "/getReport">
            <button
            class="test-button inline-flex items-center margin auto justify-center h-12 px-6 font-semibold tracking-wide text-teal-900 transition duration-200 rounded shadow-md md:w-auto hover:text-deep-purple-900 bg-teal-accent-400 hover:bg-teal-accent-700 focus:shadow-outline focus:outline-none"
            style="background-color: #1DEBB8;"
            type="submit"
            onClick="changeTestName(event)"
            >
            Download Report
        </button>
            </form>`
        }
        socket.onmessage = (e)=>{
            popUpText.innerText += JSON.stringify(e.data)
            popUpText.innerHTML += "<br/>"
        }
    }
    else{
        const response = await fetch(endpoints[test].apiEndPoint,{
            method:"POST",
            mode:"cors",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify({url:url})
        })
        const data = await response.json()
        console.log(data)
        popUpText.innerText = data
    }
}

init()