const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Placeholder users array 
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' },
]

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res){
 const username = req.body.username;
 const password = req.body.password;
 const userAuth = (username, password) =>{
    try {
        let validUsers = users.filter((user) => {
          return user.username === username && user.password === password;
        });
  
        if (validUsers.length > 0) {
          let accessToken = jwt.sign({
            data: password,
          }, 'fingerprint_customer', { expiresIn: 60 * 60 });
  
          req.session.authorization = {
            accessToken,
            username,
          };
  
          return res.status(200).send("User successfully logged in");
        } else {
          return res.status(401).json({ message: "Invalid Login. Check username and password" });
        }
      } catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      
    };
 
 userAuth(username,password)
    res.status(201).json("hello")
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
