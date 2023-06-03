require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const qrcode = require("qrcode");

mongoose.connect("mongodb+srv://admin-keshaw:"+process.env.db_PASASWORD+"@atlascluster.wcjomd7.mongodb.net/ticketDB");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine','ejs');

const ticketSchema = new mongoose.Schema({
    Name: String,
    Phone: Number,
    Email: String,
    Aadhar: Number,
    Otp: 
    { type: Number, required: false },
    Qr: 
    { type: Number, required: false },
})

// const otpSchema = new mongoose.Schema({
//     Phone: Number,
//     Otp: Number
// })


const Ticket = mongoose.model("Ticket",ticketSchema);
// const Otp = mongoose.model("Otp",otpSchema);

// to generate the otp
const generateOTP = ()=>{
    var digits ='0123456789';
    let OTP = '';
    for(let i = 0  ; i<4 ; i++){
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

//to encrypt data



// to check the otp at the otp page
const check_otp=(filled_otp,otp)=>{ 
    if(filled_otp != otp){
        console.log(req.body.filled_otp);
    alert("otp does not match");
    res.render("./Pages/OTP/otp_page") 
    }}



// BACK END LOGIC AND RENDERING

app

.get("/",(req,res)=>{
   res.render("./Pages/Home/home");
})

//DETAILS FORM FILL-UP
.post("/",(req,res)=>{
    
    console.log(req.body.phone);
    const ticket = new Ticket({
        Name :req.body.name,
        Phone : req.body.phone,
        Email: req.body.email,
        Aadhar : req.body.aadhar,
        Otp:generateOTP()
    });
    ticket.save();
    
    console.log(ticket.Otp);
    res.render("./Pages/OTP/otp_page");
})

//OTP confirmation
.post("/otp_page",async (req,res)=>{

    const {filled_otp , phone} = req.body;
    
    const user = await Ticket.findOne({Phone:phone});
    console.log(user);
    if(user.Otp == filled_otp){
        console.log("otp matched");
        const myJSON = JSON.stringify(user);

        qrcode.toDataURL(myJSON,(err,src)=>{
            res.render("./Pages/QR/qr",{
                qr_code : src
            });
        })


        
    }

    // IF OTP DOES NOT MATCHES LOGIC
    // else {

    // } 
})







app.listen((process.env.port||3000),()=>{
    console.log("app started on port 3000");
})