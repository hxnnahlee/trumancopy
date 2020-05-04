## Fall 2019 Semester Progress

Admin Mode Feature
=======================

This feature we are implementing allows for admins to be able to edit any post, giving researchers the ability to directly manipulate the actors/scripts via the Truman UI. 

Any user set as an admin will be able to toggle the Admin Mode on & off. The button to toggle this mode will only appear for users who are set as admins.

We started this process by playing around with a test page to see what would be the best way to make posts editable. Initially, we had buttons for each component of the post that would change that component to an HTML form. This looked a bit cluttered, so we settled on using Semantic-UI's "contenteditable" feature as it appears clean and intuitive to use. 

When a user turns Admin Mode "on", a pop-up appears notifying the user of this switch. The captions, comments, like amounts, and photos of each post on the timeline can be edited when this mode is enabled. The admin can also change the author of the post by using the dropdown featuring all actors, directly on the post. Admins can change the photo of the post by clicking on the photo itself, and selecting a new photo.

There exists a "save" button that appears in Admin Mode. The user will click this once finished with their changes for that post. This will save all changes to the database. (Currently saves changes in: captions, # of likes, author, and comments)

I created a "export to CSV" icon in the header which will only show for users who are set to be admins, but this functionality has yet to be implemented. I tried to start an exporter in the file admin-export.js, but had issues getting it running correctly. 

Future Developments
=======================

* Save the edited time of post to the database
* Fix the ability to update the photo of a post
* Export the contents of the database as a CSV (fix admin-export.js)
* Refine actor dropdown feature (currently, it shows a dropdown of all actors for users who are set as admins, regardless if the admin mode is on)
* Clean up save comments functionality (the logic is currently quite messy, see: updateCommentAdmin function in the admin controller)


Truman Platform 
=======================

The Truman Platform is a fake social network for real results. This fake social network application allows researchers to create interesting and believable scenarios in a social network environment. Since the interactions that take place in a social setting and influence the outcome of an experiment, all content, users, interactions and notifications are “fake” and created by a set of digital actors. Each participant sees the same interactions and conversations, believe these to be unique to them. 

This allows any experiment to be completely replicated, and the tools can be repurposed for other studies. 

This current iteration is testing the bystander effect on cyberbullying. Future studies could be done on a number of other topics and issues. 

This project and software development was supported by the National Science Foundation through IIS-1405634. Special thanks to everyone at Cornell Social Media Lab in the Department of Communication. 

Also special thanks to Sahat Yalkabov and his [Hackathon Starter](https://github.com/sahat/hackathon-starter) project, which provided the basic organization for this project. 
