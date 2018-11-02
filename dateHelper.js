
function dateHelper () {
    

    
    this.todayDate= function () {
        var localDate = new Date();
        var utcOffset = localDate.getTimezoneOffset();
        var cetOffset = utcOffset + 60;
        var cestOffset = utcOffset + 120;
        var cetOffsetInMilliseconds = cetOffset * 60 * 1000;
        var cestOffsetInMilliseconds = cestOffset * 60 * 1000;
    
        var cestDateStart = new Date();
        var cestDateFinish = new Date();
        var localDateTime = localDate.getTime();
        var cestDateStartTime;
        var cestDateFinishTime;
        var result;
    
        cestDateStart.setTime(Date.parse('29 March ' + localDate.getFullYear() + ' 02:00:00 GMT+0100'));
        cestDateFinish.setTime(Date.parse('25 October ' + localDate.getFullYear() + ' 03:00:00 GMT+0200'));
    
        cestDateStartTime = cestDateStart.getTime();
        cestDateFinishTime = cestDateFinish.getTime();
    
        if(localDateTime >= cestDateStartTime && localDateTime <= cestDateFinishTime) {
            result = new Date(localDateTime + cestOffsetInMilliseconds);
        } else {
            result = new Date(localDateTime + cetOffsetInMilliseconds);
        }
    
        return result;
    }

    this.todayDateFormatted = function (){
        return this.todayDate().toISOString().replace(/T.+/, '').replace(/-/g,'')
    }

    this.getDayOfTheWeek = function() {
        var d = new Date();
        var weekday = new Array(7);
        weekday[0] =  "domingo";
        weekday[1] = "lunes";
        weekday[2] = "martes";
        weekday[3] = "miercoles";
        weekday[4] = "jueves";
        weekday[5] = "viernes";
        weekday[6] = "sabado";

        var day = weekday[this.todayDate().getDay()];
        return day
    }  

    this.timeOfTheDay = function(){
        return this.todayDate().getHours();
    }
}
module.exports = dateHelper;