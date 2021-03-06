const Script = require('../models/Script.js');
const User = require('../models/User');
const Notification = require('../models/Notification');
const _ = require('lodash');
const Actor = require('../models/Actor.js');


/**
 * POST /update_post_admin/
 * Update post ADMIN FEATURE
 */
exports.updatePostAdmin = (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    //somehow user does not exist here
    if (err) { return next(err); }

    console.log("@@@@@@@@@@@ TOP postID is  ", req.body.postID);

    //find the object from the right post in feed 
    var feedIndex = _.findIndex(user.feedAction, function(o) { return o.post == req.body.postID; });

    console.log("@@@ USER index is  ", feedIndex);

    if(feedIndex==-1)
    {
      console.log("$$$$$ERROR: Can not find POST ID: ", req.body.postID);

    }

    //we found the right post, and feedIndex is the right index for it
    console.log("##### FOUND post "+req.body.postID+" at index "+ feedIndex);

       
    // Save caption & like edits to the database
    Script.findOneAndUpdate( {_id: req.body.postID }, { body: req.body.updated_caption, likes: req.body.updated_likes }, function(err, updated) {
      if (err)
      {
        res.send(err);
        console.log("update didn't work in find one and update");
        return;
      }

    });


    // Save actor change in db
    Actor.findOne({ 'profile.name': req.body.actorName }, function(err, actor) {
      console.log("IN FIND ONE: " + actor)
      Script.findOneAndUpdate( {_id: req.body.postID }, {actor: actor._id}, function(err, updated) {
        if (err)
        {
          res.send(err);
          console.log("couldn't save new actor for post");
          return;
        }
      })
    }); 

  
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'Something in feedAction went crazy. You should never see this.' });

          return res.redirect('/');
        }
        console.log("ERROR ON FEED_ACTION SAVE")
        console.log(JSON.stringify(req.body));
        console.log(err);
        return next(err);
      }

      console.log("@@@@@@@@@@@ SAVED TO DB!!!!!!!!! ");
      res.send({result:"success"});
    });
  });
  }
// Save changes to post comments
// ** NEEDS TO BE IMPLEMENTED **
exports.updateCommentAdmin = (req, res, next) => {
  User.findById(req.user.id, (err, user) => {

    console.log("CALLED SAVE COMMENTS")
    //somehow user does not exist here
    if (err) { return next(err); }

    console.log("@@@@@@@@@@@ TOP postID is  ", req.body.postID);

    //find the object from the right post in feed 
    var feedIndex = _.findIndex(user.feedAction, function(o) { return o.post == req.body.postID; });

    console.log("@@@ USER index is  ", feedIndex);

    if(feedIndex==-1)
    {
      console.log("$$$$$ERROR: Can not find POST ID: ", req.body.postID);

    }

    //we found the right post, and feedIndex is the right index for it
    console.log("##### FOUND post "+req.body.postID+" at index "+ feedIndex);

    console.log(req.body.saveComments);

       
    // Save comments
    Script.findOne( {_id: req.body.postID }, function(err, post) {
      if (err)
      {
        res.send(err);
        console.log("update didn't work in find one and update");
        return;
      } 
      console.log(post.comments);
      for (var i=0; i<req.body.saveComments.length / 2; i+=2)
      {
        for (var j=0; j<post.comments.length; j++)
        {

          if (post.comments[j]._id == req.body.saveComments[i])
          {
            post.comments[j].body = req.body.saveComments[i+1];
          }
        }
      }

      post.save((err) => {
        if (err) {
          console.log(err);
          console.log("error saving comment")
        }
          res.send({result:"success"});
      });

    }); 
  });
};
  /*
##############
Change photo
#############
*/
exports.updatePostPhoto = (req, res) => {

  console.log("***ADMIN CONTROLLER****");
  console.log(req);

  /*
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }

    console.log("###########NEW POST###########");
    console.log("Text Body of Post is "+req.body.body);


  
    var post = new Object();
    post.body = req.body.body;
    post.absTime = Date.now();
    post.relativeTime = post.absTime - user.createdAt;


    //This is a new post - not comment or reply
    if (req.file)
    {
      console.log("Text PICTURE of Post is "+req.file.filename);
      post.picture = req.file.filename;

      user.numPosts = user.numPosts + 1;
      post.postID = user.numPosts;
      post.type = "user_post";
      post.comments = [];
      

      //Now we find any Actor Replies (Comments) that go along with it
      Notification.find()
        .where('userPost').equals(post.postID)
        .where('notificationType').equals('reply')
        .populate('actor')
        .exec(function (err, actor_replies) {
          if (err) { return next(err); }
          //console.log("%^%^%^^%INSIDE NOTIFICATION&^&^&^&^&^&^&");
          if (actor_replies.length > 0)
          {
            //we have a actor reply that goes with this userPost
            //add them to the posts array

            //console.log("@@@@@@@We have Actor Comments to add: "+actor_replies.length);
            for (var i = 0, len = actor_replies.length; i < len; i++) {
              var tmp_actor_reply = new Object();

              //actual actor reply information
              tmp_actor_reply.body = actor_replies[i].replyBody;
              //tmp_actor_reply.actorReplyID = actor_replies[i].replyBody;
              //might need to change to above
              user.numActorReplies = user.numActorReplies + 1;
              tmp_actor_reply.commentID = user.numActorReplies;
              tmp_actor_reply.actor = actor_replies[i].actor;

              tmp_actor_reply.time = post.relativeTime + actor_replies[i].time;

              //add to posts
              post.comments.push(tmp_actor_reply);

              

            }

            
          }//end of IF

          //console.log("numPost is now "+user.numPosts);
          user.posts.unshift(post);
          user.logPostStats(post.postID);
          //console.log("CREATING NEW POST!!!");

          user.save((err) => {
            if (err) {
              return next(err);
            }
            //req.flash('success', { msg: 'Profile information has been updated.' });
            res.redirect('/');
          });

        });//of of Notification

    }

    else
    {
      console.log("@#@#@#@#@#@#@#ERROR: Oh Snap, Made a Post but not reply or Pic")
      req.flash('errors', { msg: 'ERROR: Your post or reply did not get sent' });
      res.redirect('/');
    }

  });
  */
};

  
  