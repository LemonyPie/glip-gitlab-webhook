var express = require('express');
var axios = require('axios');
var router = express.Router();
var hookUrl = process.env.MERGE_REQUEST_HOOK_URL;

router.post('/', function(req, res, next) {
  const assigneeName = req.body.object_attributes.assignee.name;
  const message = (assigneeName ? `@${assigneeName} please` : 'Please ') + `[have a look](${req.body.object_attributes.url})`;
  const body = {
    "activity": "Merge request",
    "icon": req.body.user.avatar_url,
    "title": `${req.body.user.name} submitted a new merge request`,
    "body": message
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
