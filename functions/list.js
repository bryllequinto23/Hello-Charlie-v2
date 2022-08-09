const express = require('express');
const serverless = require('serverless-http');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const router = express.Router();

require('dotenv').config()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/.netlify/functions/list', router);

router.get('/', async (req, res) => {
  const key = '$2b$10$pC5WO8HVYid9mbSFiYI11eXP.mEI0l9cHbWwSGDHTwzYmbK72rDt6';
  const binID = '62f0ff2c5c146d63ca647990'

  const response = await fetch(
    `https://api.jsonbin.io/v3/b/${binID}/latest`,
    {
      method: 'GET',
      headers: {
        'X-Access-Key' : key
      }
    }
  )
  
  const data = await response.json();

  res.json({data});
});

// router.post('/', async (req,res) => {
//   const tkn = req.body.token;
//   const response = await fetch(
//     `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.REACT_APP_SECRET_KEY}&response=${tkn}`,
//     {
//       method: "POST"
//     }
//   )
  
//   const data = await response.json();
//   const isSuccess = data.success;

//   res.json({
//     'successful': isSuccess,
//   })
// })

module.exports.handler = serverless(app)