'use strict';

require('dotenv').config();
const fetch = require('node-fetch');
const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const PORT = process.env.PORT || 1337;
const { translate } = require('./translate');



app.get('/', ((req, res) => {
    res.send(
        `<h1>Translate Buddy</h1>`
    );
}))

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"
        // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {
    // Parse the request body from the POST
    let body = req.body;
    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {
        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);
            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);
            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});




// Handles messages events
async function handleMessage(sender_psid, received_message) {
    try {
        let response;
        let setupStatus = false;
        // Check if the message contains text
        if (received_message.text == 'setup') {
            response = handleSetup(response);
        } else if (received_message.text && setupStatus) {
            // Create the payload for a basic text message

            // translate(input, fromLangCode, toLangCode,)
            let translatedResponse = await translate(received_message.text, 'en', 'zh');
            let translated = await translatedResponse.json();
            console.log(translated.outputs[0].output);
            response = {
                "text": `Translation: "${translated.outputs[0].output}" .`
            }
        }
        callSendAPI(sender_psid, response);
    } catch (error) {
        console.log(error)
    }

}

function handleSetup(response) {
    response = {
        "payload": {
            "template_type": "generic",
            "elements": [{
                "title": "Select Your Language",
                "subtitle": "Tap a button to answer.",
                // "image_url": attachment_url,
                "buttons": [{
                        "type": "postback",
                        "title": "English",
                        "payload": "en",
                    },
                    {
                        "type": "postback",
                        "title": "Chinese",
                        "payload": "zh",
                    },
                    {
                        "type": "postback",
                        "title": "Spanish",
                        "payload": "es",
                    }
                ],
            }]
        }
    }
    return response;
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'en') {
        response = { "text": "Translating from English" }
    } else if (payload === 'zh') {
        response = { "text": "Translating from Chinese" }
    } else if (payload === 'es') {
        response = { "text": "Translating from Spanish" }
    }
    // Send the message to acknowledge the postback
    callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}



// Sets server port and logs message on success
app.listen(PORT, () => console.log(`webhook is listening on port ${PORT}`));