const express = require('express');
const axios = require('axios');
const config = require('../config.json');
const router = express.Router();
const hookUrl = process.env.MERGE_REQUEST_HOOK_URL;

router.post('/', function(req, res, next) {
  const isNewRequest = req.body.object_attributes.action !== 'update';
  const isResolveWIPStatus = !isNewRequest && 
    !req.body.object_attributes.work_in_progress &&
    (req.body.changes && req.body.changes.title && req.body.changes.title.previous.includes('WIP'));
  console.log('REQUEST BODY: ', JSON.stringify(req.body), `Is new: ${isNewRequest}`, `Is resolve WIP status: ${isResolveWIPStatus}`)
  if(isNewRequest || isResolveWIPStatus) {
    const assigneeName = req.body.assignees && req.body.assignees[0] && req.body.assignees[0].name || '';
    const message = (assigneeName ? `@${assigneeName} please` : 'Please') + ` [have a look](${req.body.object_attributes.url})`;
    const user = req.body.user;
    const body = {
      "activity": isNewRequest ? 'Merge Request Created' : isResolveWIPStatus ? 'Resolved WIP Status' : 'Merge Request Changed',
      "icon": user && user.avatar_url || '', 
      "body": `${user && user.name || 'Someone'} ${isResolveWIPStatus ? 'Resolved WIP Status' : 'submitted a new merge request'}.`,
      "attachments":[
        {
        "type":"Card",
        "fallback": `[Merge request](${req.body.object_attributes.url})`,
        "color": isNewRequest ? config.colors.new : config.colors.update,
        "fields":[
            {
              "title": `${req.body.object_attributes.title}`,
              "value": message,
              "style":"Long"
            },
            {
              "title": "Status",
              "value": req.body.object_attributes.merge_status,
              "style": "Short"
            },
            {
              "title": "Target branch",
              "value": req.body.object_attributes.target_branch,
              "style": "Short"
            }
          ]
        }
      ]
    }
  
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
  }
});

module.exports = router;
