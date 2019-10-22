/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
// i18n library dependency, we use it below in a localisation interceptor
const i18n = require('i18next');
// i18n strings for all supported locales
const languageStrings = require('./languageStrings');

var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var dynamodb = new AWS.DynamoDB();

// Date params for Dynamo
var d = new Date();
var n = d.getTime();
var timespan = (n - 20000).toString();
//var timespan = (n - 2000000).toString();;
//var timespan = (n - 3600000).toString();;


// Params for Dynamo

var m =[];
// If you want to select all records
/*
var params = {
    ExpressionAttributeValues: {
     ":v1": {
       S: "test"
      }
    },
    KeyConditionExpression: "A11yHack_UserId = :v1",
    ProjectionExpression: "texts",
    TableName: "A11yHack"
   };
*/
var params = {
    ExpressionAttributeValues: {
     ":v1": {
       S: "test"
      },
      ":v2":{
          S: timespan
      }
    },
    KeyConditionExpression: "A11yHack_UserId = :v1 and A11yHack_timeStampRecord >= :v2",
    ProjectionExpression: "texts",
    TableName: "A11yHack"
   };

//Dynamo Function
/*
function callDynamo(handler){
dynamodb.query(params, function(err, data) {
         if (err) console.log(err, err.stack); // an error occurred
         else {
         //console.log("data from dynamo "+data.Items)
            let array = data.Items;
            var l =[];
                        array.forEach(function (item, index) {
                          l.push(item.texts.L[0]);
                                    });

            var filtered = l.filter(function (el) {
                            return el != null;
                          });

                        filtered.forEach(function (item, index) {
                                //console.log("push output "+item.S)
                                m.push(item.S)

                                });

                    const requestAttributes = handler.attributesManager.getRequestAttributes();
                    var attributes = handler.attributesManager.getSessionAttributes();

                    console.log("List in call dynamo function "+ m)

                    attributes.dynamoList = m;


                    handler.attributesManager.setSessionAttributes(attributes);


}} );
}
*/
// Populate list of alphabets
function genCharArray(charA, charZ) {
    var a = [], i = charA.charCodeAt(0), j = charZ.charCodeAt(0);
    for (; i <= j; ++i) {
        a.push(String.fromCharCode(i));
    }
    return a;
}
const letter = genCharArray('a', 'z');

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('WELCOME_MSG');





        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const SelectGameIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SelectGame';
    },
   async handle(handlerInput) {
        //const speakOutput = handlerInput.t('HELLO_MSG');
         const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
         var attributes = handlerInput.attributesManager.getSessionAttributes();
         const request = handlerInput.requestEnvelope.request;
        var gameType = request.intent.slots['gameType'].resolutions.resolutionsPerAuthority[0] ? request.intent.slots['gameType'].resolutions.resolutionsPerAuthority[0].values[0].value.name : null;
        //callDynamo(handlerInput);
       // await sleep(2000);



        if (gameType === 'numbers'){

            const speakOutput = handlerInput.t('WELCOME_NUMBER');
            var rand_number = Math.floor(Math.random() * Math.floor(10));
            const final_speech = speakOutput+ " "+ rand_number+'<audio src="soundbank://soundlibrary/voices/chorus/chorus_02"/>';
            const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
            var attributes = handlerInput.attributesManager.getSessionAttributes();

            attributes.rand_number = rand_number;
             handlerInput.attributesManager.setSessionAttributes(attributes);

                    return handlerInput.responseBuilder
                        .speak(final_speech)
                        //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                        .getResponse();

        }

        else if (gameType === 'alphabets'){

           const speakOutput = handlerInput.t('WELCOME_ALPHA');
           var rand_letter = letter[Math.floor(Math.random() * letter.length)]+'.';
           attributes.rand_letter = rand_letter
           const final_speech = speakOutput+ ' '+ rand_letter+'<audio src="soundbank://soundlibrary/voices/chorus/chorus_02"/>';

            handlerInput.attributesManager.setSessionAttributes(attributes);
              return handlerInput.responseBuilder
                .speak(final_speech)
                //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
                .getResponse();

        }

        else {
            const speakOutput = handlerInput.t('ERROR_MSG');


             return handlerInput.responseBuilder
               .speak(speakOutput)
               //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
               .getResponse();
        }



    }
};

const ReadyPlayIntentHandler = {
     canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReadyPlay';
    },
   async handle(handlerInput) {

           dynamodb.query(params, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                    //console.log("data from dynamo "+data.Items)
                       let array = data.Items;
                       var l =[];
                                   array.forEach(function (item, index) {
                                     l.push(item.texts.L[0]);
                                               });

                       var filtered = l.filter(function (el) {
                                       return el != null;
                                     });

                                   filtered.forEach(function (item, index) {
                                           //console.log("push output "+item.S)
                                           m.push(item.S)

                                           });

                               const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
                               var attributes = handlerInput.attributesManager.getSessionAttributes();

                               console.log("List in call dynamo function "+ m)

                               attributes.dynamoList = m;


                               handlerInput.attributesManager.setSessionAttributes(attributes);


           }} );

    await sleep(3000);


    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    var attributes = handlerInput.attributesManager.getSessionAttributes();
    var flag = 'false';
    var list = attributes.dynamoList;
    var rand_number = attributes.rand_number;
    var rand_letter =  attributes.rand_letter;

     for (var i = 0; i < list.length; i++) {
           if (m[i] === rand_letter || m[i]=== rand_number.toString())
             {
             flag = 'true';
             console.log("first flag set "+ flag)
             //handlerInput.attributesManager.setSessionAttributes(attributes);
           break;
             }
           else{
            flag = 'false';
           //handlerInput.attributesManager.setSessionAttributes(attributes);
           continue
           }
                };
    if (flag==='true'){
         console.log("inside flag")
         let congrats = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_positive_response_03"/> Good Job!!!';



                       return handlerInput.responseBuilder
                           .speak(congrats)
                           .addDelegateDirective({
                                                                       name: 'SelectGame',
                                                                       confirmationStatus: 'NONE',
                                                                       slots: {}
                                                                     })
                                                                     .withShouldEndSession(false)
                                                                     .reprompt('Say Play Again if you wish to continue')
                           .getResponse();
                           }
    else{
         let sorry = '<audio src="soundbank://soundlibrary/ui/gameshow/amzn_ui_sfx_gameshow_negative_response_01"/> Somethings wrong with me, Im sorry';
         let tryAgain = "Let's try again"

                        return handlerInput.responseBuilder
                            .speak(sorry)
                            . reprompt(tryAgain)
                            .addDelegateDirective({
                                            name: 'SelectGame',
                                            confirmationStatus: 'NONE',
                                            slots: {}
                                          })
                                          .withShouldEndSession(false)
                                          .reprompt('Say Play Again if you wish to continue')
                            .getResponse();

         };


    }
};



const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('HELP_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('GOODBYE_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('FALLBACK_MSG');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = handlerInput.t('REFLECTOR_MSG', {intentName: intentName});

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */

/*
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = handlerInput.t('ERROR_MSG');
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
*/
// This request interceptor will bind a translation function 't' to the handlerInput
const LocalisationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args);
        });
    }
};
/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        SelectGameIntentHandler,
        ReadyPlayIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addResponseInterceptors(function(requestEnvelope, response){
    	console.log("\n" + "******************* REQUEST ENVELOPE **********************");
    	console.log("\n" + JSON.stringify(requestEnvelope, null, 4));
    	console.log("\n" + "******************* RESPONSE  **********************");
    	console.log("\n" + JSON.stringify(response, null, 4));
    })
    .addRequestInterceptors(
        LocalisationRequestInterceptor)
    .lambda();
