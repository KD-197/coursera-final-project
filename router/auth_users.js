const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();


const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
]

const isValid = ()=>{
  const username = req.body.username;
  const password = req.body.password;
    let validusers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
      return true;
    } else {
      return false;
    }  
  
  }

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Find the user in the 'users' array
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // If user is found, create a JWT for session authorization
    const accessToken = jwt.sign({ username: user.username }, 'secret_key', { expiresIn: '1h' });

    // Save the user credentials in the session
    req.session.authorization = {
      accessToken,
      username: user.username,
    };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    // Use return to ensure that no further code is executed after sending a response
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

regd_users.put("/review/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;

    // Check if the user is logged in (username stored in the session)
    const username = req.session.authorization?.username;

    if (!username) {
      return res.status(401).json({ message: "User not logged in" });
    }

    // Check if the book with the provided ISBN exists
    if (!books.hasOwnProperty(isbn)) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has already reviewed the book
    if (books[isbn].reviews.hasOwnProperty(username)) {
      // If the user has already reviewed, modify the existing review
      books[isbn].reviews[username] = reviewText;
      return res.status(200).json({ message: "Review modified successfully" });
    } else {
      // If the user has not reviewed, add a new review
      books[isbn].reviews[username] = reviewText;
      return res.status(201).json({ message: "Review added successfully" });
    }
  } catch (error) {
    console.error("Error in /auth/review/:isbn:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
regd_users.delete("/review/:isbn", (req, res) => {
  const requestedIsbn = parseInt(req.params.isbn);
  const username = req.session.authorization?.username;

  // Check if the book with the provided ISBN exists
  if (!books.hasOwnProperty(requestedIsbn)) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user is logged in (username stored in the session)
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Check if the user has a review for the book
  if (books[requestedIsbn].reviews.hasOwnProperty(username)) {
    // Delete the review for the user
    delete books[requestedIsbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});




module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
