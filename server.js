const User = require('./model.js').User
const Exe = require('./model.js').Exe
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
  .post((req,res) => {
    const newPerson = new User({username: req.body.username})
    newPerson.save((err, data) => {
      if(err){
        res.send("User Name Taken")
      } else{
        res.json({"username": data.username, "_id": data.id})
      }
    })
  })

  .get((req, res) => {
    User.find({}, (err, data) => {
      if(!err){
        const formatData = data.map((user) => {
          return{
            username: user.username,
            '_id': user.id
          }
        })
        res.json(formatData)
      } else {
        console.log("Error")
      }
    });
  })

app.route('/api/users/:id/exercises')
  .post(async (req, res) => {
    const name = req.params.id
    User.findById(name, (err, data) => {
      if(err) {
        res.json({"Error": "There is no such user."})
      } else {
        if(req.body.date == undefined) {
          console.log("hello")
          const newExe = new Exe({
            duration: parseInt(req.body.duration),
            description: req.body.description,
            date: new Date() 
          })
        console.log(newExe)
          data.log.push(newExe)
          data.save((err, udata) => {
            if(err) {
              res.json({"Error" : "There was some error."})
            } else {
              res.json({
                username: data.username,
                "_id" : data._id,
                description: req.body.description,
                duration: parseInt(req.body.duration),
                date: new Date().toDateString() 
              })
            }
          })
           
        } else {
          
          const newExe = new Exe({
            duration: parseInt(req.body.duration),
            description: req.body.description,
            date: new Date(req.body.date)
          })
          console.log("hello 1")
        console.log(newExe)
          data.log.push(newExe)
          data.save((err, udata) => {
            if(err) {
              res.json({"Error" : "There was some error."})
            } else {
              res.json({
                username: data.username,
                "_id" : data._id,
                description: req.body.description,
                duration: parseInt(req.body.duration),
                date: new Date(req.body.date).toDateString() 
              })
            }
          })
          
        }
          
        }
    })
  })

app.get("/api/users/:_id/logs",async(req,res)=>{
  if(req.params._id){
    await User.findById(req.params._id,(err,result)=>{
      // console.log(result)
    if(!err){
      let responseObj={}
      responseObj["_id"]=result._id
      responseObj["username"]=result.username
      responseObj["count"]=result.log.length
      
      if(req.query.limit){
        responseObj["log"]=result.log.slice(0,req.query.limit)
      }else{
        responseObj["log"]=result.log.map(log=>({
        description:log.description,
        duration:log.duration,
        date: new Date(log.date).toDateString()
      }))
      }
      if(req.query.from||req.query.to){
        let fromDate=new Date(0)
        let toDate=new Date()
        if(req.query.from){
          fromDate=new Date(req.query.from)
        }
        if(req.query.to){
          toDate=new Date(req.query.to)
        }
        fromDate=fromDate.getTime()
        toDate=toDate.getTime()
        responseObj["log"]=result.log.filter((session)=>{
          let sessionDate=new Date(session.date).getTime()

          return sessionDate>=fromDate&&sessionDate<=toDate
        })
      }
      // console.log(responseObj)
      res.json(responseObj)
    }else{
      res.json({err:err})
    }
  })
  }else{
    res.json({user:"user not found with this id"})
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});