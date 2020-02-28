var express = require('express');
var url = require('url');
var querystring = require('querystring');
var http = require('http');
var router = express.Router();
var hookUrlRaw = process.env.MERGE_REQUEST_HOOK_URL;

router.post('/', function(req, res, next) {
  const hookUrl = new URL(hookUrlRaw);
  const assigneeName = req.body.object_attributes.assignee.name;
  const messageBody = (assigneeName ? `@${assigneeName} please` : 'Please ') + `[have a look](${req.body.object_attributes.url})`;
  const body = querystring.stringify({
    "activity": "Merge request",
    "icon": req.body.user.avatar_url,
    "title": `${req.body.user.name} submitted a new merge request`,
    "body": messageBody
  });

  const options = {
    hostname: hookUrl.hostname,
    port: hookUrl.port || 80,
    path: hookUrl.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  }

  const request = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => {
      console.log(`BODY: ${chunk}`);
    });
  })

  request.on('error', (e) => console.error(`Problem with request to hook: ${e.message}`))
  request.write(body);
  request.end()
  res.status(200);
  res.end();
});

module.exports = router;
