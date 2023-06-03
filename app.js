require('dotenv').config()
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const qrcode = require("qrcode");
const nodemailer = require("nodemailer");

var key = process.env.encrypter_KEY;
var encryptor = require("simple-encryptor")(key); 

mongoose.connect("mongodb+srv://admin-keshaw:"+process.env.db_PASSWORD+"@atlascluster.wcjomd7.mongodb.net/ticketDB");

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
    { type: String, required: false }
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
//user end
.get("/",(req,res)=>{
   res.render("./Pages/Home/home");
})

//admin end
.get("/admin",(req,res)=>{
    res.render("./Pages/ADMIN/admin")
})

//DETAILS FORM FILL-UP
.post("/otp_page",(req,res)=>{
    
    console.log(req.body.phone);
    const ticket = new Ticket({
        Name :req.body.name,
        Phone : req.body.phone,
        Email: req.body.email,
        Aadhar : req.body.aadhar,
        Otp:generateOTP(),
        Qr: "NA"
    });
    ticket.save();
    
    console.log(ticket.Otp);
    res.render("./Pages/OTP/otp_page");
})

//OTP confirmation
.post("/Qr",async (req,res)=>{

    const {filled_otp , phone} = req.body;
    
    const user = await Ticket.findOne({Phone:phone});
    console.log(user);
    
    if(user.Otp == filled_otp){
        console.log("otp matched");
        //encrypting user object
        // adding qr to existing object in database
        const myJSON = JSON.stringify(user);
        const qr_data = encryptor.encrypt(myJSON);
        console.log(user);
        await Ticket.findOneAndUpdate({Phone:phone , Qr:"NA"},{Qr:qr_data},{new:true})
        .then((user)=>{
            console.log(user);
            qrcode.toDataURL(user.Qr,(err,src)=>{

                
                //test
                async function main() {
                    // Generate test SMTP service account from ethereal.email
                    // Only needed if you don't have a real mail account for testing
                    let testAccount = await nodemailer.createTestAccount();
                  
                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                      host: "smtp.ethereal.email",
                      port: 587,
                      secure: false, // true for 465, false for other ports
                      auth: {
                        user: "tabitha91@ethereal.email", // generated ethereal user
                        pass: "rDuhMrjmZqXQSPP5es", // generated ethereal password
                      },
                    });
                    
                    // send mail with defined transport object
                    let info = await transporter.sendMail({
                      from: '"Fred Foo 👻" <foo@example.com>', // sender address
                      to: "keshawjha400@gmail.com", // list of receivers
                      subject: "Hello ✔", // Subject line
                      text: "Hello world?", // plain text body
                      html: '<img  src="'+src+'"/>img', // html body
                    });
                    
                    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                  }
                  
                  main().catch(console.error);
                //test



                res.render("./Pages/QR/qr",{
                    qr_code : src
                });
            })  
        })
        .catch((res,req)=>{
            res.send(err);
        })
    }
    // IF OTP DOES NOT MATCHES LOGIC
    // else {
    // } 
})

.post("/admin",async (req,res)=>{
    const {filled_qr} = req.body;
    const string_json = encryptor.decrypt(filled_qr);
    const user = JSON.parse(string_json);
    const db_user = await Ticket.findOne({Qr:filled_qr});
    if(db_user){
        qrcode.toDataURL(db_user.Qr,(err,src)=>{
            res.render("./Pages/ADMIN/session_start",{
                qr_code : src,
                user: db_user
            });
        }) 
    }
})


app.listen((process.env.port||3000),()=>{
    console.log("app started on port 3000");
})