const async = require('async')
const Actor = require('./models/Actor.js');
const Script = require('./models/Script.js');
const User = require('./models/User.js');
const _ = require('lodash');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs')
var UAParser = require('ua-parser-js');
const util = require('util');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


mongoose.Promise = global.Promise;


//mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
//mongoose.connect(process.env.MONGOLAB_TEST || process.env.PRO_MONGOLAB_URI, { useMongoClient: true });
//mongoose.connect(process.env.MONGOLAB_TEST || process.env.PRO_MONGOLAB_URI, { useNewUrlParser: true });
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});
// id,body,picture,actor,time,class,experiment_group

const csvWriter = createCsvWriter({
  path: 'updatedposts.csv',
  header: [
      {id: 'body', title: 'body'},
      {id: 'picture', title: 'picture'},
      {id: 'actor', title: 'actor'},
      {id: 'time', title: 'time'},
      {id: 'class', title: 'class'},
      {id: 'experiment_group', title: 'experiment_group'}
  ]
});
/*
const records = [
  {body: 'a body', picture: 'pic.jpg', actor: 'Bob', 
  time: '111', class: '2', experiment_group: '2'}
]

csvWriter.writeRecords(records)
.then(() => 
{
  console.log('Done');
}) */

Script.find({}, function(err, posts) {
  
  console.log(posts);
  /*
  for (var i=0; i<posts.length; i++)
  {
    csvWriter.writeRecords(posts[i])
    .then(() => {
      console.log("Done");
    }) 
  } */

  if (err)
  {
    console.log(err);
  }
}) 

mongoose.connection.close();
console.log('end')
