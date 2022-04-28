const mongoose = require('mongoose')
const {Schema} = mongoose

const Exe = new Schema({
  description: String, 
  duration: Number,
  date: Date,
})

const User = new Schema({
  username: {type: String, required: true}, 
  log: [Exe]
})

const Users = mongoose.model("User", User)
const Exes = mongoose.model("Exe", Exe)

exports.User = Users
exports.Exe = Exes