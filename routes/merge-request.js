var express = require('express');
var axios = require('axios');
var router = express.Router();
var hookUrl = process.env.MERGE_REQUEST_HOOK_URL;

router.post('/', function(req, res, next) {
  const assigneeName = req.body.object_attributes && req.body.object_attributes.assignee && req.body.object_attributes.name || '';
  const message = (assigneeName ? `@${assigneeName} please` : 'Please') + ` [have a look](${req.body.object_attributes.url})`;
  const user = req.body.user;
  const body = {
    "activity": "Merge request",
    "icon": user && user.avatar_url || '', 
    "title": `${user && user.name || 'Someone'} submitted a new merge request. \n **${req.body.object_attributes.title}**`,
    "body": message,
    "attachments":[
      {
       "type":"Card",
       "fallback":"The attachments are not supported by your client.",
       "color":"#9C1A22",
       "fields":[
        {
         "title":"Beer",
         "value": JSON.stringify(req.body),
         "style":"Long"
        }]
      }
    ]
  };
  
  axios.post(hookUrl, body)
  .then((response) => {
    res.status(200);
    res.end('Hook send successfully');
  })
  .catch((error) => {
    console.error(error);
    res.status(400)
    res.end('Hood sending failed');
  })
});

module.exports = router;
