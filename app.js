//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const mencrypt = require("mongoose-encryption")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")


app = express()
app.use(express.static("public"))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
const seltRound = 8
mongoose.connect(process.env.DB)

const userSchema =  new mongoose.Schema({
    email:String,
    password:String,
    secret:String
})

app.use(session({
    secret: process.env.LITTLE_SECRET,
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


userSchema.plugin(passportLocalMongoose);


const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());




//home
app.get("/", (req, res)=>{
    res.render("home");
})


//login

app.get("/login", (req, res)=>{
    res.render("login")
})
//Register

app.get("/register", (req, res)=>{
    res.render("register")
})
//secrets

app.get('/secrets', (req, res) => {
    User.find({"secret":{$ne:null}}, (err, founduser)=>{
        if(err){
            console.log(err);
        }else{
            if(founduser){
                res.render("secrets", {userSecs:founduser});
            }
        }
    })




    
    
});
//submit
app.get('/submit', (req, res) => {

    if(req.isAuthenticated()){
        res.render("submit");
    }else{
         res.redirect('/login');
    }
    
});

app.post('/submit', (req, res) => {
    const submited = req.body.secret

    User.findById(req.user.id, (err, fonduser)=>{
        if(err){
            console.log(err);
        }else{
            if(fonduser){
                fonduser.secret = submited
                fonduser.save(()=>{
                     res.redirect('/secrets');
                })
            }
        }
    })
    
});

//logout
app.get('/logout', (req, res) => {
    req.logiut();
     res.redirect('/');
    
});
//handling registers

app.post('/register', (req, res) => {

    User.register({username:req.body.username}, req.body.password, (err, user)=>{
        if (err){
            console.log(err);
            res.redirect('/register');
        }else{
            passport.authenticate("local")(req, res, ()=>{
                 res.redirect("/secrets");
            })
        }
    })
    





    // bcrypt.hash(req.body.password, seltRound, (err, hash)=>{
        // const newUser = new User({
        //     email:req.body.username,
        //     password:hash
        // })

    //     newUser.save((err)=>{
    //         if(err){
    //             res.send(err);
    //         }else{
    //             res.render('secrets');;
    //         }
    //     })

    // })

    
    
});

//handling login
app.post('/login', (req, res) => {

    const newUser = new User({
        email:req.body.username,
        password:hash
    })

    req.login(user, (err)=>{
        if(err){
            console.log(err);
             res.redirect('/login');
        }else{
            passport.authenticate("local")(req, res, ()=>{
                 res.redirect('/secrets');
            })
        }
    })








    // const email = req.body.username
    // const password = req.body.password

    // User.findOne({email:email}, (err, foundemail)=>{
    //     if (err){
    //         console.log(err);
    //     }else{
    //         if(foundemail){
    //             bcrypt.compare(password, foundemail.password, (err, result)=>{
    //                 if(result === true){
    //                     res.render("secrets");
    //                 }

    //             })
    //         }
    //     }
    // })
    
});
















app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});
