(function($) {

	function sendCall(number){
		$.ajax({
			url: "/api/parallel/" + number,
			method: "GET",
			beforeSend: function(){
				$("#page").append('<div id="call' + number + '" class="red">Call Sequence '+number+'</div>');
			},
			success: function(){
				$("#page").find("#call" + number).removeClass("red").addClass("green");
			}
		});
	}

	var testNumber = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

	function init (argument) {
		//$("#page")
		$.each(testNumber, function(idx, number){
			sendCall(number);
		})
	}


	$(document).ready(function(){
		init();
	});
})(window.jQuery);