const express = require('express');
const fetch = require('node-fetch');
const redis = require('redis')

const PORT = process.env.PORT || 3000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);
////////////////
// client.on("error",function(err){
//     console.error('error encountered',err)
// })
// client.on("connect",function(res){
//     console.log('connection established')
// })
// client.set("UserName","barath",redis.print);
// client.get("UserName",redis.print);
////////////////

const app = express()
const path = require('path')
console.log('In index.js')
app.use(express.json());      
  
  // Make request to Github for data
  async function getRepos(req, res, next) {
    try {
      console.log('Fetching Data...');
  
      const { username } = req.query;
  
      const response = await fetch(`https://api.github.com/users/${username}`);
  
      const data = await response.json();
  
      const repos = data.public_repos;
  
      client.setex(username, 3600, repos);
  
      res.render('index.ejs', { username,repos });
    } catch (err) {
      console.error(err);
      res.status(500);
    }
  }
  
  // Cache middleware
  function cache(req, res, next) {
    const { username } = req.query;
  
    client.get(username, (err, data) => {
      if (err) throw err;
  
      if (data !== null) {
        res.render('index.ejs', { username,repos:data });
      } else {
        next();
      }
    });
  }
  

app.get("/",(req,res)=>{
    console.log(path.join(__dirname + '/file.html'))
    res.sendFile(path.join(__dirname + '/file.html'));
})
app.get("/login" ,cache,getRepos);
app.listen(3000,(res)=>{
    console.log('Listening to server... yes')
})