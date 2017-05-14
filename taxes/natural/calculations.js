(function(argument) {
    var El = {forward: {}, reverse: {}};

    function toINR(number){
      var number=number.toString();
      var lastThree = number.substring(number.length-3);
      var otherNumbers = number.substring(0,number.length-3);
      if(otherNumbers != '') {
        lastThree = ',' + lastThree;  
      }
      var inrString = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
      return inrString;
    }

    function resetValue(element){
      if(!element.value){element.value=0;}
    }

    function calculateForwardTax() {
      var ftaxamount = 0, ftaxpercentage = 0, ftax = 0, ftotal = 0;

      ftaxamount = Math.abs(parseInt(El.forward.amount.val()));
      ftaxpercentage = Math.abs(parseInt(El.forward.percentage.val()));

      resetValue(El.forward.amount);
      resetValue(El.forward.percentage);

      ftax = Math.round(ftaxamount * (ftaxpercentage/100));
      ftotal = ftaxamount + ftax;

      El.forward.tax.text(toINR(ftax));
      El.forward.total.text(toINR(ftotal));
    }

    function calculateReverseTax() {
      var rtaxedamount = 0, rtaxpercentage = 0, rtax = 0, roriginal = 0;

      rtaxedamount = Math.abs(parseInt(El.reverse.amount.val()));
      rtaxpercentage = Math.abs(parseInt(El.reverse.percentage.val()));

      resetValue(El.reverse.amount);
      resetValue(El.reverse.percentage);

      roriginal = Math.round((100 * rtaxedamount)/(100 + rtaxpercentage));
      rtax = rtaxedamount - roriginal;

      El.reverse.tax.text(toINR(rtax));
      El.reverse.original.text(toINR(roriginal));
    }


    $(document).ready(function(){
      El.forward.tax = $("#ftax");
      El.forward.total = $("#ftotal");
      El.forward.amount = $("#ftaxamount");
      El.forward.percentage = $("#ftaxpercentage");
      $(".factioninputs").on('change', calculateForwardTax);
      $(".factionbuttons").on('click', calculateForwardTax);


      El.reverse.tax = $("#rtax");
      El.reverse.original = $("#roriginal");
      El.reverse.amount = $("#rtaxamount");
      El.reverse.percentage = $("#rtaxpercentage");
      $(".ractioninputs").on('change', calculateReverseTax);
      $(".ractionbuttons").on('click', calculateReverseTax);
    });
}());