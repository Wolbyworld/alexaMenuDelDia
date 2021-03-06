//Using this guide: https://cmichel.io/how-to-access-google-spreadsheet-with-node/
//And this guide to execute local: https://medium.com/coinmonks/how-to-develop-an-amazon-alexa-skill-using-node-js-b872ef5320b1
//Instructions to make this run local
//lambda-local -l index.js -h handler -e input.json -t 10

'use strict';

//Dependencies
const GoogleSpreadsheet = require('google-spreadsheet')
const { promisify } = require('util')
const Alexa = require('alexa-sdk');
const C_DateHelper = require('./dateHelper');
const dateHelper = new C_DateHelper();
const removeAccents = require('remove-accents')

//App constants
const SPREADSHEET_ID = '1IpD8aJoyZGrn4RzKNKu1wur2KAEz-qXJ0ZCDXIhGnO8'
const APP_ID = "amzn1.ask.skill.cac6bafa-7c73-40c4-88b6-df010ab58315"
const SKILL_NAME = 'Menú del día';
const HELP_MESSAGE = 'De momento no sé hacer nada más, ya iré mejorando';
const HELP_REPROMPT = '¿Qué puedo hacer por ti?';
const REPROMPT = '¿Quieres saber algún otro día?'


//Variables
var menu;

/** Returns de menu in an XML format **/
async function accessSpreadsheet() {
  const doc = new GoogleSpreadsheet(SPREADSHEET_ID)
  const info = await promisify(doc.getInfo)()
  console.log(`Loaded doc: ` + info.title + ` by ` + info.author.email)
  const sheet = info.worksheets[0]
  const rows = await promisify(sheet.getRows)({
    offset: 0,
    limit: 20
  })
 return rows
}
/**Given the XML, returns the menu in an object format**/
function parseMenu(_menuXML){
  var t_menu = [];
  var index = 0
  for (index = 0; index < _menuXML.length; ++index) {
    var row = _menuXML[index];
    var menudia = {
      dia : row.diasemana
      ,comida : row.comida
      ,cena : row.cena
    }
    t_menu[index] = menudia
  };
  var menu = {
    lunes:t_menu[0]
    ,martes:t_menu[1]
    ,miercoles:t_menu[2]
    ,jueves:t_menu[3]
    ,viernes:t_menu[4]
    ,sabado:t_menu[5]
    ,domingo:t_menu[6]
  }
  return menu
};

function getRandomFunEnd(){
  return "Rico, rico y con fundamento"
}
/** Given a day returns the menu of that day (both meals)**/
function getDayMenu (_day) {
  switch(_day) {
    case "lunes":
        return menu.lunes
        break;
    case "martes":
        return menu.martes
        break;
    case "miercoles":
        return menu.miercoles
        break;
    case "jueves":
        return menu.jueves
        break;
    case "viernes":
        return menu.viernes
        break;
    case "sabado":
        return menu.sabado
        break;
    case "domingo":
        return menu.domingo
        break;
    default:
        break;
  }
}

/** Get the meal from one menu**/
function getMeal(_day,_meal){
  var dayMenu = getDayMenu(_day);
  switch(_meal) {
    case "Comida":
      return dayMenu.Comida
      break;
    case "Cena":
      return dayMenu.cena
      break;
  }
}

function createResponse (_day,_meal){
  if (_day==="hoy"){
    _day=dateHelper.getDayOfTheWeek();
  }
  console.log("Request: "+_day+_meal)
  var dayString  = "";
  switch (_day){
    case dateHelper.getDayOfTheWeek():
      dayString = "de hoy"
      break;
    case "lunes":
      dayString = "del lunes"
      break;
    case "martes":
      dayString = "del martes"
      break;
    case "miercoles":
      dayString = "del miércoles"
      break;
    case "jueves":
      dayString = "del jueves"
      break;
    case "viernes":
      dayString = "del viernes"
      break;
    case "sabado":
      dayString = "del sábado"
      break;
    case "domingo":
      dayString = "del domingo"
      break;
  }
  console.log(dayString)
  var dayMeal = getDayMenu(_day);
  if (_meal==="all"){
    if (dayString === "de hoy") {
      if (dateHelper.timeOfTheDay()>12) {
        //only dinner
        var text2read = "Para cenar hoy tenemos " + dayMeal.cena.toLowerCase() + ". " 
      } else{
        var text2read = "En el menú " + dayString + " tenemos " + dayMeal.comida.toLowerCase() + " para comer y " + dayMeal.cena.toLowerCase() + " para cenar. " 
      }
    } else {
       var text2read = "En el menú " + dayString + " tenemos " + dayMeal.comida.toLowerCase() + " para comer y " + dayMeal.cena.toLowerCase() + " para cenar. " 
    }
  } else {
    if (_meal==="cena"){
        var text2read = "En la cena " + dayString + " tenemos " + dayMeal.cena.toLowerCase() + ". ";
    } else {
         var text2read = "En la comida " + dayString + " tenemos " + dayMeal.comida.toLowerCase() + ". ";
    }
  };
  var myResponse = {
        cardTitle:"Menú del día"
        , text: text2read
        , text2read: text2read
        , image:"white"};
    return myResponse

};



/**exports.handler = async(event,  context, callback) => {

  var menu =  parseMenu(await accessSpreadsheet())
  console.log(menu.lunes.comida)
  return  "fin"
};**/

const handlers = {
    'menuDia': function () {
        let diaSemana = this.event.request.intent.slots.diaSemana.value;     
        diaSemana = removeAccents.remove(diaSemana.toLowerCase()); 
        var myresponse = createResponse(diaSemana,"all");
        this.response.cardRenderer(myresponse.cardTitle,myresponse.text);
        this.response.speak(myresponse.text2read+REPROMPT)
        this.response.listen();
        this.emit(':responseReady');
    },
    'cenaDia': function () {
        let diaSemana = this.event.request.intent.slots.diaSemana.value;     
        diaSemana = removeAccents.remove(diaSemana.toLowerCase()); 
        var myresponse = createResponse(diaSemana,"cena");
        this.response.cardRenderer(myresponse.cardTitle,myresponse.text);
        this.response.speak(myresponse.text2read+REPROMPT)
        this.response.listen();
        this.emit(':responseReady');
    },
    'comidaDia': function () {
        let diaSemana = this.event.request.intent.slots.diaSemana.value;     
        diaSemana = removeAccents.remove(diaSemana.toLowerCase());  
        var myresponse = createResponse(diaSemana,"comida");
        this.response.cardRenderer(myresponse.cardTitle,myresponse.text);
        this.response.speak(myresponse.text2read+REPROMPT)
        this.response.listen();
        this.emit(':responseReady');
    },
    'LaunchRequest': function () {
        var myresponse = createResponse(dateHelper.getDayOfTheWeek(),"all");
        this.response.cardRenderer(myresponse.cardTitle,myresponse.text);
        this.response.speak(myresponse.text2read+REPROMPT)
        this.response.listen();
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        var randomFact = getRandomFunEnd()
        this.response.speak(randomFact);
        this.response.cardRenderer(randomFact);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        var randomFact = getRandomFunEnd()
        this.response.speak(randomFact);
        this.response.cardRenderer(randomFact);
        this.emit(':responseReady');
    },
    'AMAZON.SessionEndedRequest': function () {
        var randomFact = getRandomFunEnd()
        this.response.speak(randomFact);
        this.response.cardRenderer(randomFact);
        this.emit(':responseReady');
    },
};

exports.handler = async function (event, context, callback) {
    console.log("Request received: " + JSON.stringify(event.request))
    menu =  parseMenu(await accessSpreadsheet());
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID
    alexa.registerHandlers(handlers);
    alexa.execute();
};
