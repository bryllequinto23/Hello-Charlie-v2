

const axios = require('axios');
const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/.netlify/functions/helloWorld', router);

router.get('/', (req, res) => {
  res.json({
    'path': 'Home',
    'firstName': 'Brylle',
    'lastName': 'Quinto'
  });
});

router.post('/', async (req,res) => {
  const {tkn} = req.body;

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.REACT_APP_SECRET_KEY}&response=${tkn}`,
    {
      method: "POST"
    }
  )
  
  const data = await response.json();
  const isSuccess = data.success;

  res.json({
    'path': 'Secret',
    'firstName': 'Brylle',
    'lastName': 'Quinto',
    'successful': isSuccess,
    'key': process.env.REACT_APP_SECRET_KEY,
    'token': req.body.token
  })
})

module.exports.handler = serverless(app)