const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios')

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists. Choose a different one." });
  }

  const newUser = { username, password };
  users.push(newUser);

  return res.status(201).json({ message: `User ${username} created successfully!` });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  axios.get('/all-books') 
    .then(response => {
      const booksJsonString = JSON.stringify(response.data, null, 2);
      res.status(200).send(booksJsonString);
    })
    .catch(error => {
      console.error('Error fetching books:', error);
      res.status(500).send('Internal Server Error');
    });
});;

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const requestedIsbn = parseInt(req.params.isbn);

  try {
    const response = await axios.get(`/isbn/${requestedIsbn}`);

    if (response.data) {
      res.status(200).json(response.data);
    } else {
      res.status(404).json('Book not found for the given ISBN.');
    }
  } catch (error) {
    console.error('Error fetching book details:', error);
    res.status(500).json('Internal Server Error');
  }
});




  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // Use Axios to fetch book details based on author
    const response = await axios.get(`/author?author=${author}`); 
    const booksByAuthor = response.data;

    if (booksByAuthor.length > 0) {
      res.status(200).json(booksByAuthor);
    } else {
      res.status(404).json('No books found for the given author.');
    }
  } catch (error) {
    console.error('Error fetching books by author:', error);
    res.status(500).json('Internal Server Error');
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {    const response = await axios.get(`/title?title=${title}`);  
    const bookByTitle = response.data;

    if (bookByTitle) {
      res.status(200).json(bookByTitle);
    } else {
      res.status(404).json('No book found for the given title.');
    }
  } catch (error) {
    console.error('Error fetching book by title:', error);
    res.status(500).json('Internal Server Error');
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn);
  const booksArray = Object.values(books);

  const book = booksArray.find((book) => book.isbn === isbn);

  if (book) {
    const bookReviews = book.reviews || [];

    return res.status(200).json({ reviews: bookReviews });
  } 
  else {
    return res.status(404).json({ message: 'Book not found.' });
  }
});


module.exports.general = public_users;
