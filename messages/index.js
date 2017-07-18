/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-luis
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, './locale'));

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
//var makerKey= process.env.IftttMakerKey;

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;


var onUrl='';
var offUrl='';

bot.dialog('settings', [
    function (session) {
        builder.Prompts.text(session, 'Hello... What\'s the on Url?');
    },
    function (session, results) {
        onUrl=results.response;
        session.userData.onUrl = onUrl;
        builder.Prompts.text(session, 'What\'s the off Url?');
    },
    function (session, results) {
        offUrl= results.response;
        session.userData.offUrl =offUrl;
        session.endDialog('Got it... ' + 'you are all set');
    }
]);


 
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);

var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.matches('turn off', [
    function (session) {
       if(offUrl!=='')
       {
            var request = require('request');
            request(offUrl, function (error, response, body) {
                
                if( response.statusCode==200)
                {
                    session.say("It's off now", "It's off now", null)
                    .endDialog();
                }
                else
                {
                    session.send('something went wrong'); 
                }
            
            });
        }
       else
       {
        builder.Prompts.text(session, 'What\'s the off Url?');
       }
       
    },
    function (session, results) {
        offUrl= results.response;
        session.userData.offUrl =offUrl;
         var request = require('request');
            request(offUrl, function (error, response, body) {
                
                if( response.statusCode==200)
                {
                    session.say("It's off now", "It's off now", null)
                    .endDialog();
                }
                else
                {
                    session.send('something went wrong'); 
                }
            
            });
    }
])
.matches('turn on', [
    function (session) {
       if(onUrl!=='')
       {
            var request = require('request');
            request(onUrl, function (error, response, body) {
                
                if( response.statusCode==200)
                {
                    session.say("It's on now", "It's on now", null)
                    .endDialog();
                }
                else
                {
                    session.send('something went wrong'); 
                }
            
            });
        }
       else
       {
        builder.Prompts.text(session, 'What\'s the on Url?');
       }
       
    },
    function (session, results) {
        onUrl= results.response;
        session.userData.onUrl =onUrl;
         var request = require('request');
            request(onUrl, function (error, response, body) {
                
                if( response.statusCode==200)
                {
                    session.say("It's on now", "It's on now", null)
                    .endDialog();
                }
                else
                {
                    session.send('something went wrong'); 
                }
            
            });
    }
])
.matches('turn off old', [
        (session) => {
            
            //todo refactor - extract to method
            
            var request = require('request');
            request(onUrl, function (error, response, body) {
            
              if( response.statusCode==200)
              {
                  session.say("It's off now", "It's off now", null)
                  .endDialog();
              }
              else
              {
                    session.send('something went wrong'); 
              }
              
            });

            
        }
    ])

.matches('turn on old', [

  (session) => {
            
            //todo refactor - extract to method
            
            var request = require('request');
            request(onUrl, function (error, response, body) {
            
              if( response.statusCode==200)
              {
                   session.send("It's on now").endDialog();
              }
              else
              {
                    session.send('something went wrong'); 
              }
              
            });

            
        }
       
    ])
.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    


if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

