(function(argument) {
    var inv80c = 0, hra = 0, taxExempt = 250000, oldctc = 0, hikePercentage = 7;
    var ageSlab = 'below60', expenditure = 0;

    var btnClasses = {
      red: 'btn-danger',
      green: 'btn-success'
    }

    var taxExemptTable = {
      'below60': 250000,
      'above60': 300000,
      'above80': 500000
    }
    var taxSlabs = {
      'below5lakh': 10,
      'above5lakh': 20,
      'above10lakh': 30
    }
    var taxableIncome = {
      'below5lakh': 0,
      'above5lakh': 0,
      'above10lakh': 0
    }

    var El = {yearly: {}, monthly: {}, hike: {}, car: {}};


    /*
      Car Variabled
    */

    if(typeof(window.localStorage['carleaseenabled']) == 'undefined'){
      window.localStorage['carleaseenabled'] = false;
    }

    var carTaxExempt = {
      default: 25000
    }

    var car = {
      amount: 0,
      taxexemption: 0,
      varamount: 50000,
      vatonemi: 0.13125,
      vatonloan: 0.106993,
      servicetaxonemi: 0.00635179892,
      enabled: JSON.parse(window.localStorage.carleaseenabled)
    }

    function updateCarStatus(status){
      var carbtn = $("#switchcar");
      window.localStorage.carleaseenabled = status;
      if(status){
        carbtn.addClass(btnClasses.green);
        carbtn.removeClass(btnClasses.red);
      } else {
        carbtn.addClass(btnClasses.red);    
        carbtn.removeClass(btnClasses.green);
      }
    }

    function joinArr(arr){
      var str='';
      str = str + '(' + arr.join("-") + ')';
      return str;
    }


    function joinProp(obj, propArr){
      var str='';
      var arr=[];
      for(index in propArr){arr.push(obj[propArr[index]])}
      str = joinArr(arr);
      return str;
    }

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

    function getIncomePerlab(slab, incomeInSlab){
      var slabTaxableIncome, resultInSlab = 0;

      if(incomeInSlab){
        if(slab == 'below5lakh'){
          slabTaxableIncome = incomeInSlab - taxExemptTable[ageSlab];
          if(slabTaxableIncome <= 0){slabTaxableIncome=0;}
        } else {
          slabTaxableIncome = incomeInSlab;
        }

        resultInSlab = incomeInSlab - (slabTaxableIncome * (taxSlabs[slab]/100));
      }

      return resultInSlab;
    }

    function PMT(ir, np, pv, fv, type) {
        /*
         * ir   - interest rate per month
         * np   - number of periods (months)
         * pv   - present value
         * fv   - future value
         * type - when the payments are due:
         *        0: end of the period, e.g. end of month (default)
         *        1: beginning of period
         */
        var pmt, pvif;

        fv || (fv = 0);
        type || (type = 0);

        if (ir === 0)
            return -(pv + fv)/np;

        pvif = Math.pow(1 + ir, np);
        pmt = - ir * pv * (pvif + fv) / (pvif - 1);

        if (type === 1)
            pmt /= (1 + ir);

        return Math.abs(Math.ceil(pmt));
    }

    function breakIncome(income){
      if(income > 1000000) {
        return {'below5lakh': 500000, 'above5lakh': 500000, 'above10lakh': (income - 1000000)};
      } else if(income > 500000) {
        return {'below5lakh': 500000, 'above5lakh': (income - 500000), 'above10lakh': 0};
      } else if(income <= 500000) {
        return {'below5lakh': income, 'above5lakh': 0, 'above10lakh': 0};
      }
    }

    function getIncomeAfterTax(totalincome){
      var resultincome = 0;
      var taxableIncome = breakIncome(totalincome);
      //console.log(taxableIncome)

      resultincome += getIncomePerlab('below5lakh', taxableIncome['below5lakh']);
      resultincome += getIncomePerlab('above5lakh', taxableIncome['above5lakh']);
      resultincome += getIncomePerlab('above10lakh', taxableIncome['above10lakh']);
      return resultincome;
    }

    function calculateTax(ctc, carExemption, identifier){
      var dt = new Date(), deductions = 0, resultIncome = 0;
      var result = {
        futureIncome: [{amount: 0, savings: 0}, {amount: 0}, {amount: 0}, {amount: 0}, {amount: 0}, {amount: 0}]
      }


      var savings = inv80c + hra + (carExemption * 12);
      var totalIncome = ctc - savings - deductions;
      
      resultIncome = getIncomeAfterTax(totalIncome);
      resultIncome = Math.floor(resultIncome + savings);

      result.monthly = {
        income: Math.floor(resultIncome/12),
        tax: Math.floor(ctc/12) - Math.floor(resultIncome/12)
      }
      result.yearly = {
        income: resultIncome,
        tax: ctc - resultIncome
      }

      result.futureIncome[0]['amount'] = ctc;
      for(var i=1, len = result.futureIncome.length; i < len; i++) {
        var currYearCtc = result.futureIncome[i-1]['amount'];
        var currSavings = result.futureIncome[i-1]['savings'];

        var updatedCtc = parseInt(currYearCtc + (currYearCtc * (hikePercentage/100)));
        var updatedSavings = parseInt(currSavings +  (updatedCtc - (updatedCtc*30/100)) - expenditure);


        result.futureIncome[i] = {
          age: 28 + i,
          amount: updatedCtc,
          year: dt.getFullYear() + i,
          savings: updatedSavings
        }
      }

      return result;
    }

    function afterTaxCalculations(ctc, oldctc, inHand){
      inHand.ctc = ctc;
      inHand.oldctc = oldctc;
      inHand.ctcdiff = ctc - oldctc;

      inHand.hike = {
        amount: inHand.ctcdiff,
        percentage: Math.round(((inHand.ctcdiff/oldctc) * 100) * 100)/100
      }
      return inHand;
    }

    function ctcUpdated() {
      var ctcEl = document.getElementById('ctc');

      hra = Math.abs(parseInt($("#hra").val()));
      oldctc = Math.abs(parseInt($("#oldctc").val()));
      inv80c = Math.abs(parseInt($("#inv80c").val()));
      expenditure = Math.abs(parseInt($("#expenditure").val()));
      hikePercentage = Math.abs(parseInt($("#hikePercentage").val()));
      ageSlab = $("#ageSlab").val();


      /*
        Calculations For Car
      */
      car.taxexemption = 0;
      if(car.enabled){
        El.car.varamount.val(Math.abs(parseInt($("#carretailprice").find(":selected").data('varamount'))));

        car.retailprice = Math.abs(parseInt($("#carretailprice").val()));
        car.varamount = Math.abs(parseInt($("#carvaramount").val()));

        car.interestrate = Math.abs(parseFloat($("#carinterestrate").val()))
        car.loanperiod = Math.abs(parseInt($("#carloantperiod").val()));
        //car.capitalizedamount = Math.ceil(car.retailprice - (car.retailprice * 15)/100);

        car.vatamount = Math.floor(car.retailprice * car.vatonloan);
        //car.capitalizedamount = car.retailprice - car.vatamount;
        car.capitalizedamount = car.retailprice;


        car.emibeforevat = PMT(car.interestrate/1200, car.loanperiod*12, car.capitalizedamount);
        car.emi = car.emibeforevat + Math.ceil(car.emibeforevat * car.vatonemi) + Math.ceil(car.emibeforevat * car.servicetaxonemi);
        car.taxexemption = carTaxExempt.default + car.emi;

        El.car.vatamount.text(toINR(car.vatamount));
        El.car.emi.text(toINR(car.emi));
        El.car.capitalizedamount.text(toINR(car.capitalizedamount));
        El.car.taxexemption.text(toINR(car.taxexemption));
      }


      /*
        Calculations TAXES
      */

      if(!ctcEl.value){ctcEl.value=0;}
      var ctc = Math.abs(parseInt(ctcEl.value));
      var inHand = calculateTax(ctc, car.taxexemption, "Normal");
      var inHand = afterTaxCalculations(ctc, oldctc, inHand);

      El.yearly.income.text(toINR(inHand.yearly.income));
      El.yearly.tax.text(toINR(inHand.yearly.tax));
      El.monthly.income.text(toINR(inHand.monthly.income));
      El.monthly.tax.text(toINR(inHand.monthly.tax));
      El.hike.amount.text(toINR(inHand.hike.amount));
      El.hike.percentage.text(inHand.hike.percentage);

      for(var i = 1, len = inHand.futureIncome.length; i < len; i++){
        El.futureIncomeCluster.find("#incomeyear" + i).text(joinProp(inHand.futureIncome[i], ['year', 'age']));
        El.futureIncomeCluster.find("#incomevalue" + i).text(joinArr([toINR(inHand.futureIncome[i]['amount']), toINR(inHand.futureIncome[i]['savings'])]));
      }

      /*
        After Calculations For Car
      */
      if(car.enabled){
        var inHandBeforeCar, inHandAfterCar;

        inHandBeforeCar = calculateTax(ctc, 0, "inHandBeforeCar");
        inHandBeforeCar = afterTaxCalculations(ctc, oldctc, inHandBeforeCar);

        inHandAfterCar = calculateTax(ctc, car.taxexemption, "inHandAfterCar");
        inHandAfterCar = afterTaxCalculations(ctc, oldctc, inHandAfterCar);

        console.log(inHandBeforeCar.monthly.tax - inHandAfterCar.monthly.tax)

        // El.car.actualemi.text(toINR(car.actualemi));
        car.taxsaved = inHandBeforeCar.monthly.tax - inHandAfterCar.monthly.tax;
        car.actualemi = Math.floor(car.emi - car.taxsaved);

        car.actualcostbyEMI = Math.floor(car.loanperiod * car.actualemi * 12);
        //car.actualcost = Math.floor(car.actualcostbyEMI + (car.actualcostbyEMI * 0.05)) + car.varamount + car.vatamount;
        car.actualcost = Math.floor(car.actualcostbyEMI + (car.actualcostbyEMI * 0.05)) + car.varamount;

        El.car.taxsaved.text(toINR(car.taxsaved));
        El.car.actualemi.text(toINR(car.actualemi));
        El.car.actualcost.text(toINR(car.actualcost));
      }



      // console.log(ctcEl);
      // console.log(ctc);
      // console.log(inHand);
    }

    $(document).ready(function(){
      El.monthly.income = $("#monthly");
      El.monthly.tax = $("#monthlytax");
      El.yearly.income =  $("#yearly");
      El.yearly.tax =  $("#yearlytax");
      El.hike.amount =  $("#hikeamount");
      El.hike.percentage =  $("#hikepercentage");
      El.futureIncomeCluster =  $(".futureIncomeCluster");

      El.car.emi = $("#caremi");
      El.car.vatamount = $("#carvatamount");
      El.car.varamount = $("#carvaramount");
      El.car.capitalizedamount = $("#carcapitalizedamount");
      El.car.actualemi = $("#caractualemi");
      El.car.taxexemption = $("#carexemptionamount");
      El.car.taxsaved = $("#cartaxsaved");
      El.car.actualcost = $("#caractualcost");


      $(".actioninputs").on('change', ctcUpdated);
      $(".actionbuttons").on('click', ctcUpdated);
      $(".resetbuttons").on('click', function(){
        $(this).parent().find(".actioninputs").val('0');
        ctcUpdated();
      });

      // $(".carretailprice").on('change', function(){
      //   var varamount = $(this).find(":selected").data('varamount');
      //   El.car.varamount.val(varamount);
      //   ctcUpdated();
      // });

      $("#switchcar").on('click', function(){
        car.enabled = !car.enabled;
        updateCarStatus(car.enabled);
        ctcUpdated();
      });
      updateCarStatus(car.enabled);

      $("#refreshcar").on('click', function(){
        window.location.reload();
      });

      setTimeout(ctcUpdated, 500);
    });

}());