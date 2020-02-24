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

       
    // Update caption & likes by the admin 
    Script.findOneAndUpdate( {_id: req.body.postID }, { body: req.body.updated_caption, likes: req.body.updated_likes }, function(err, updated) {
      console.log("hello??");
      if (err)
      {
        res.send(err);
        console.log("update didn't work in find one and update");
        return;
      }

    });

  
    //console.log("@@@@@@@@@@@ ABOUT TO SAVE TO DB on Post ", req.body.postID);
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
  
  