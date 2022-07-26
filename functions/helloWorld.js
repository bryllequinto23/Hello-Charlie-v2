

const axios = require('axios');
const { request } = require('express');
const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');

const app = express();
const router = express.Router();

app.use('/.netlify/functions/helloWorld', router);

router.get('/', (req, res) => {
  res.json({
    'path': 'Home',
    'firstName': 'Brylle',
    'lastName': 'Quinto'
  });
});

router.post('/', async (req,res) => {
  const {token} = req.body;

  url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.REACT_APP_SECRET_KEY}&response=${token}`;
  
  // request(url, (err, response, body) => {
  //   body. JSON.parse(body);
  // })

  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.REACT_APP_SECRET_KEY}&response=${token}`,
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
    'successful': isSuccess
  })
})

module.exports.handler = serverless(app)