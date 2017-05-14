var utility = {};

utility.parse = function(input, type){
	var parsedInput;
	switch(type){
		case 's':
			input = input || "";
			parsedInput = input.toString();
			break;
		case 'i':
		case 'n':
			if(isNaN(input)){
				input = 0;
			}
			parsedInput = parseInt(input);
			break;
		default:
			parsedInput = input;
	}

	return parsedInput;
}

utility.getInput = function(title, defaultValue, type) {
	title = title || "Please Enter a Value";
	defaultValue = defaultValue || null;
	var result = utility.parse(window.prompt(title, defaultValue), 'i');
	return result;
}


window.Utility = utility;