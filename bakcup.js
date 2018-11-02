//Using this guide: https://cmichel.io/how-to-access-google-spreadsheet-with-node/
//And this guide to execute local: https://medium.com/coinmonks/how-to-develop-an-amazon-alexa-skill-using-node-js-b872ef5320b1
//Instructions to make this run local
//

'use strict';

//Dependencies
const GoogleSpreadsheet = require('google-spreadsheet')
const { promisify } = require('util')
const Alexa = require('alexa-sdk');
const C_DateHelper = require('./dateHelper');
const dateHelper = new C_DateHelper();

//App constants
const SPREADSHEET_ID = '1IpD8aJoyZGrn4RzKNKu1wur2KAEz-qXJ0ZCDXIhGnO8'
const APP_ID = "amzn1.ask.skill.cac6bafa-7c73-40c4-88b6-df010ab58315"
const SKILL_NAME = 'Menú del día';
const HELP_MESSAGE = 'De momento no sé hacer nada más, ya iré mejorando';
const HELP_REPROMPT = '¿Qué puedo hacer por ti?';
const STOP_MESSAGE = '¡A ponerse gordos!';

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
function getDayMenu (_day){
  switch(_day) {
    case "Lunes":
        return menu.lunes
        break;
    case "Martes":
        return menu.martes
        break;
    case "Miercoles":
        return menu.miercoles
        break;
    case "Jueves":
        return menu.jueves
        break;
    case "Viernes":
        return menu.viernes
        break;
    case "Sábado":
        return menu.sabado
        break;
    case "Domingo":
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

  if (_meal = "all"){ //Returns all day meals
    var dayMeal = getDayMenu(_day);
    var text2read = "En el menú " + dayString + " tenemos " + dayMeal.comida + " para comer y " + dayMeal.cena + " para cenar. " + getRandomFunEnd();
    var myResponse = {
        cardTitle:"Menú del día"
        , text: text2read
        , text2read: text2read
        , image:"white"};
    return myResponse
  }

};



/**exports.handler = async(event,  context, callback) => {

  var menu =  parseMenu(await accessSpreadsheet())
  console.log(menu.lunes.comida)
  return  "fin"
};**/

const handlers = {
    'getWeekFact': function () {
        console.log("getWeekFact");
        let mom = userData("1");
        let weekRqstNum = this.event.request.intent.slots.weekNumber.value;
        let weekRequest ="";
        console.log(mom.babyAge)
        console.log(weekRqstNum)
        if (mom.babyAge.nweeks<=weekRqstNum) {
            weekRequest = "No, no, no.... No quieras adelantarte, cada cosa a su tiempo. Disfruta de la semana " +  mom.babyAge.nweeks
        } else {
            weekRequest = babyInfo.getWeekFact(weekRqstNum)
        };
        var myresponse = createResponse();
        this.response.cardRenderer(weekRequest);
        this.response.speak(weekRequest)
        this.emit(':responseReady');
        this.response.listen("¿Qué más quieres saber?");
        this.response.shouldEndSession=true;
    },
    'menuDia': function () {
        let diaSemana = this.event.request.intent.slots.diaSemana.value;       
        var myresponse = createResponse(diaSemana,"all");
        this.response.cardRenderer(myresponse.cardTitle,myresponse.text);
        this.response.speak(myresponse.text2read)
        this.emit(':responseReady');
    },
    'LaunchRequest': function () {

        var myresponse = createResponse(dateHelper.getDayOfTheWeek(),"all");
        this.response.cardRenderer(myresponse.cardTitle,myresponse.text);
        this.response.speak(myresponse.text2read)
        this.response.listen("¿Qué más quieres saber?");
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.SessionEndedRequest': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = async function (event, context, callback) {

    menu =  parseMenu(await accessSpreadsheet());
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID
    alexa.registerHandlers(handlers);
    alexa.execute();
};
