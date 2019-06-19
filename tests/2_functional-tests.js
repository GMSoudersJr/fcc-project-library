/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoose = require('mongoose')
const MONGODB_CONNECTION_STRING = process.env.DB;
MongoClient.connect(MONGODB_CONNECTION_STRING, {useNewUrlParser: true}, function(err, db) {});
var db = mongoose.connection 

const Schema = mongoose.Schema;
const bookSchema = new Schema({
  title: String,
  comments: [String],
  commentcount: {type: Number, default: 0},
}, {timestamps: {createdAt: 'created_on', updatedAt: "updated_on"}});
var Book = db.model('Issue', bookSchema);

module.exports = function (app) {
//logger
  app.use(function(req, res, next){
    console.log(req.method +' '+ req.path  + ' - ' + req.ip)
    next()
  })
  
  app.route('/api/books')
  
    .get(function (req, res){
    mongoose.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true});
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log("Database connection successful! at GetI")
      Book.find().select('title commentcount').exec((err, books)=>{res.json(books)})
    });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
     mongoose.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true});

      var title = req.body.title;
    db.on('error', console.error.bind(console, 'connection error:'));
    title===''?res.json("Missing Title"):
    db.once('open', function() {
      console.log("Database connection successful! at post")
      var book = new Book({title : title});
        book.save('title _id', (err, book)=>{
          err?res.send(err):
        res.json({title: book.title, comments:book.comments, _id:book._id})
          console.log("%s's _id is %s",book.title, book._id)
        });
      
    });
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
         mongoose.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true})

    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log("Database connection successful! at delete")
    Book.deleteMany({},(err, deletedAll)=>{
      err?console.log(err):res.json("complete delete successful")
    
    });
    });
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
    mongoose.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true})

      var bookid = req.params.id;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log("Database connection successful! at getII")
      Book.findById(bookid,'_id title comments',(err, book)=>{
        if (book === null){
          res.json("this _id does not exist")
        } else
        err?res.json(err):res.json({_id:book._id, title:book.title, comments:book.comments})      
      });
    
    });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
    mongoose.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true})

      var bookid = req.params.id;
      var comment = req.body.comment;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log("Database connection successful! at post comment")
      Book.findByIdAndUpdate(bookid, {$push:{comments:{$each:[comment], $sort:1}}, $inc:{commentcount:1}},{new: true, useFindAndModify: false},(err,book)=>{
        err?console.log(err):res.json({_id:book._id, title:book.title, comments:book.comments})
        
      
      });
    
    });
      //json res format same as .get
    })
    
    .delete(function(req, res){
    mongoose.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true})

      var bookid = req.params.id;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log("Database connection successful! at deleteII")
      Book.findByIdAndDelete(bookid,(err, deleted)=>{
        
        err?res.json("failed to delete"):res.json("delete successful")      
      })
    });
      //if successful response will be 'delete successful'
    });
  
};
