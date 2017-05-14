window.Spacer = {};
var Logger = {};

function flattenArray(arr){
	var str = '';
	for(var i=0, len=arr.length; i < len; i++){
		str = str + arr[i].toString() + " ";
	}
	return str;
}

$(document).keydown(function(e){
	if(e.keyCode == 46){
		$('body').find(".console").empty();
	}
});


var msgTextClass = "msgtext", msgbodyClass = "msgbody";

function getMessage(messsage){
	var msg =	'<span class="'+msgTextClass+'">' + 
					messsage + 
				'</span>';
	return msg;
}

function getMessageWithBody(messsage, extraClasses){
	var body = '<div class="'+msgbodyClass + ' ' + extraClasses + '">' + 
					getMessage(messsage) +
				'</div>';
	return body;
}


function printScreen(message, isError){
	if(isError){
		//style="text-decoartion: blink;"
	}
	$('body').find(".console").append(message);
}

window.console.print = function(messsage){
	try {
		printScreen(getMessageWithBody(messsage));
	} catch (Ex) {
		console.log(Ex);
	}
}

window.console.printqueue = function(messsage){
	try {
		printScreen(getMessage(messsage));
	} catch (Ex) {
		console.log(Ex);
	}
}

window.console.printError = function(exception) {
	try {
		$(".context").remove();
		printScreen(getMessageWithBody(exception.message, 'blink-error'));
		console.error(exception);
	} catch (Ex) {
		console.log(Ex);
	}
}


window.Spacer = function(character, len){
	var str = "";
	for(var i=0;i<len;i++){str+=character;}
	window.console.print(str);
}