const Script = require('../models/Script.js');
const User = require('../models/User');
const Notification = require('../models/Notification');
const _ = require('lodash');

/**
 * POST /update_post_admin/
 * Have to create this route in app.js!!
 * NEED TO FIX THIS
 * Update post ADMIN FEATURE
 */
exports.adminUpdatePost = (req, res, next) => {

    User.findById(req.user.id, (err, user) => {
      //somehow user does not exist here
      if (err) { return next(err); }
  
      console.log("@@@@@@@@@@@ TOP USER profile is  ", req.body.postID);
  
      //find the object from the right post in feed 
      var feedIndex = _.findIndex(user.posts, function(o) { return o.postID == req.body.postID; });
  
      console.log("User Posts index is  ", feedIndex);
  
      if(feedIndex==-1)
      {
        //User Post does  not exist yet, This is an error
        console.log("$$$$$ERROR: Can not find User POST ID: ", req.body.postID);
  
      }
  
     //create a new Comment
      else if(req.body.new_comment)
      {
          var cat = new Object();
          cat.new_comment = true;
          user.numReplies = user.numReplies + 1;
          cat.commentID = 900 + user.numReplies; //this is so it doesn't get mixed with actor comments
          cat.body = req.body.comment_text;
          cat.isUser = true;
          cat.absTime = Date.now();
          cat.time = cat.absTime - user.createdAt;
          user.posts[feedIndex].comments.push(cat);
          console.log("$#$#$#$#$#$$New  USER COMMENT Time: ", cat.time);
      }
  
      //Are we doing anything with a comment?
      else if(req.body.commentID)
      {
        var commentIndex = _.findIndex(user.posts[feedIndex].comments, function(o) { return o.commentID == req.body.commentID; });
  
        //no comment in this post-actions yet
        if(commentIndex==-1)
        {
          console.log("!!!!!!Error: Can not find Comment for some reason!");
        }
  
        //LIKE A COMMENT
        else if(req.body.like)
        {
  
          console.log("%^%^%^%^%^%User Post comments LIKE was: ", user.posts[feedIndex].comments[commentIndex].liked);
          user.posts[feedIndex].comments[commentIndex].liked = user.posts[feedIndex].comments[commentIndex].liked ? false : true;        
          console.log("^&^&^&^&^&User Post comments LIKE was: ", user.posts[feedIndex].comments[commentIndex].liked);
        }
  
        //FLAG A COMMENT
        else if(req.body.flag)
        {
          console.log("%^%^%^%^%^%User Post comments FLAG was: ", user.posts[feedIndex].comments[commentIndex].flagged);
          user.posts[feedIndex].comments[commentIndex].flagged = user.posts[feedIndex].comments[commentIndex].flagged ? false : true;
          console.log("%^%^%^%^%^%User Post comments FLAG was: ", user.posts[feedIndex].comments[commentIndex].flagged);
        }
  
      }//end of all comment junk
  
      else
      {
        //we found the right post, and feedIndex is the right index for it
        console.log("##### FOUND post "+req.body.postID+" at index "+ feedIndex);
  
  
          //array of likeTime is empty and we have a new (first) LIKE event
          if (req.body.like)
          { 
            
            console.log("!!!!!!User Post LIKE was: ", user.posts[feedIndex].liked);
            user.posts[feedIndex].liked = user.posts[feedIndex].liked ? false : true;
            console.log("!!!!!!User Post LIKE is now: ", user.posts[feedIndex].liked);
          }
  
  
        else
        {
          console.log("Got a POST that did not fit anything. Possible Error.")
        }
  
      }//else 
  
      //console.log("@@@@@@@@@@@ ABOUT TO SAVE TO DB on Post ", req.body.postID);
      user.save((err) => {
        if (err) {
          if (err.code === 11000) {
            req.flash('errors', { msg: 'Something in profile_feed went crazy. You should never see this.' });
  
            return res.redirect('/');
          }
          console.log(err);
          return next(err);
        }
        //req.flash('success', { msg: 'Profile information has been updated.' });
        //res.redirect('/account');
        //console.log("@@@@@@@@@@@ SAVED TO DB!!!!!!!!! ");
        res.send({result:"success"});
      });
    });
  }
  
  