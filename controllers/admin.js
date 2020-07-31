const Script = require('../models/Script.js');
const User = require('../models/User');
const Notification = require('../models/Notification');
const _ = require('lodash');
const Actor = require('../models/Actor.js');
const study = require('../study.json');


exports.getActors = (req, res, next) => {
  Actor.find()
    .sort('username')
    .exec(function (err, actors) {
      if (err) {
        return next(err);
      }
      res.render('admin_actors', {actors: actors, study: study});
    });
};

exports.newActor = (req, res, next) => {
  console.log("###########NEW ACTOR###########");
  console.log("Username is "+req.body.username);

  //Make sure the file exists
  if (req.file)
  {
    const actor = new Actor({
      class: req.body.class,
      username: req.body.username,
      profile: {
        name: req.body.profilename,
        //gender: String,
        age: req.body.age,
        location: req.body.location,
        bio: req.body.bio,
        //fakepic: String,
        picture: req.file.filename
      }
    });

    actor.save((err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Actor has been added.'});
      res.redirect('/actors');
    });
  }

  else
  {
    console.log("@#@#@#@#@#@#@#ERROR: Oh Snap, Made a admin post but there is no file!")
    req.flash('errors', { msg: 'ERROR: There is no post file.' });
    res.redirect('/');
  }
};

exports.deleteActor = (req, res, next) => {
  Actor.findOne({ 'username': req.body.username}, (err, actor) => {
    console.log("TRYING TO DELETE ACTOR: @"+req.body.username);
    //if actor doesn't exist
    if (err) {return next(err); }

    actor.delete((err) => {
      if (err) {
        return next(err);
      }
      res.send({result:"success"});
    });
  });
};

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
    //also save time
    var time_parts = req.body.updated_time.split(":"); //seperate day, hr, min
    var time_ms = (time_parts[0] * 86400000) + (time_parts[1] * 3600000) + (time_parts[2] * 60000); //day + hour + min in ms
    var time_rel = Date.now() - user.createdAt.getTime() - time_ms;//post time in ms since user creation
    Script.findOneAndUpdate( {_id: req.body.postID }, { body: req.body.updated_caption, likes: req.body.updated_likes, time: time_rel, experiment_group: req.body.expGroup, class: req.body.postClass }, function(err, updated) {
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

exports.newPostAdmin = (req, res) => {

    console.log("###########NEW ADMIN POST###########");
    console.log("Text Body of Post is "+req.body.caption);

    //Make sure the file exists
    if (req.file)
    {
      //converting time
      var time_parts = req.body.time.split(":"); //seperate day, hr, min
      var time_ms = (time_parts[0] * 86400000) + (time_parts[1] * 3600000) + (time_parts[2] * 60000); //day + hour + min in ms
      var post_time = Date.now() - req.user.createdAt.getTime() - time_ms;//post time in ms since user creation

      //finding actor
      console.log("FILENAME IS:"+req.file.filename);
      Actor.findOne({ 'profile.name': req.body.user }, function(err, actor) {
        //console.log("IN FIND ONE: " + actor)
        Script.find()
          .sort('-post_id')
          .exec(function (err, script_feed) {
            console.log("max post id is: "+script_feed[0].post_id);
        //make the post
            const post = new Script({
              body: req.body.caption,
              post_id: script_feed[0].post_id+1,
              class: req.body.class,
              picture: req.file.filename,
              //highread: ,
              //lowread: ,
              likes: req.body.likes,
              experiment_group: req.body.expGroup,
              comments: [],
              //reply: ,
              time: post_time,
              actor: actor
            });

            post.save((err) => {
              if (err) {
                return next(err);
              }
              req.flash('success', { msg: 'Post has been added. Post ID is '+post.post_id });
              res.redirect('/');
            });
          });
      });
    }

    else
    {
      console.log("@#@#@#@#@#@#@#ERROR: Oh Snap, Made a admin post but there is no file!")
      req.flash('errors', { msg: 'ERROR: There is no post file.' });
      res.redirect('/');
    }
};

exports.deletePostAdmin = (req, res, next) => {
  Script.findById(req.body.postID, (err, post) => {
    console.log("TRYING TO DELETE POST: "+req.body.postID);
    //if post doesn't exist
    if (err) {return next(err); }

    post.delete((err) => {
      if (err) {
        return next(err);
      }
      res.send({result:"success"});
    });
  });
};
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
      for (var i=0; i<req.body.saveComments.length; i+=4)
      {
        for (var j=0; j<post.comments.length; j++)
        {

          if (post.comments[j]._id == req.body.saveComments[i])
          {
            //save body
            post.comments[j].body = req.body.saveComments[i+1];
            //save likes
            post.comments[j].likes = req.body.saveComments[i+2];
            //save time
            var time_parts = req.body.saveComments[i+3].split(":"); //seperate day, hr, min
            var time_ms = (time_parts[0] * 86400000) + (time_parts[1] * 3600000) + (time_parts[2] * 60000); //day + hour + min in ms
            post.comments[j].time = Date.now() - user.createdAt.getTime() - time_ms;//post time in ms since user creation);

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
