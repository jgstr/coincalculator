var dom = 0;
var rate = [0,0];
var earliest_date = 'Jul 18 2010';
var earliest_date_parsed = 1279411200000;//Date.parse(earliest_date)
var usd_rd = 100;
var xbt_rd = 10000;


var calculate = function(){
  console.log('dom',dom);
  console.log('rate',rate);

  var ratea, rateb, usda, usdb, xbt, english;
  var sub = Math.abs(dom-1);
  var amount = [parseFloat( $('[name="amount0"]').val() ),
  parseFloat( $('[name="amount1"]').val() )];

  console.log('amount',amount);

  console.log((rate[0] == 0 || rate[1] == 0) ? 'y1':'n1');
  console.log((amount[0] <= 0 && amount[1] <=0) ? 'y2':'n2');

  if( rate[0] == 0 || rate[1] == 0 ||
    (amount[0] == 0 &&  amount[1] == 0) ){

      english = 'Please pick 2 dates and at least one amonunt.';

    }else{



      ratea = rate[dom];
      rateb = rate[sub];

      switch($('[name="currency'+dom+'"]').val() ){
        case 'usd':
        usda = parseFloat( $('[name="amount'+dom+'"]').val() );
        xbt = Math.round((usda / rate[dom]) * xbt_rd)/xbt_rd;
        usdb = Math.round((usda / rate[dom] * rate[sub]) * usd_rd)/usd_rd;
        break;
        case 'xbt':
        xbt = parseFloat( $('[name="amount'+dom+'"]').val() );
        usda = Math.round((xbt * rate[dom]) * usd_rd)/usd_rd;
        usdb = Math.round((xbt * rate[sub]) * usd_rd)/usd_rd;
        break;
      }//sw

      switch($('[name="currency'+sub+'"]').val() ){
        case 'usd':
        $('[name="amount'+sub+'"]').val(usdb);
        break;
        case 'xbt':
        $('[name="amount'+sub+'"]').val(xbt);
        break;
      }//sw


      var obj_date0 = new Date($('[name="date0"]').val());
      var eng_date0 = obj_date0.toUTCString().substring(0,16);

      var obj_date1 = new Date($('[name="date1"]').val());
      var eng_date1 = obj_date1.toUTCString().substring(0,16);

      english = 'If you ';

      if(Date.parse($('[name="date0"]').val()) > Date.parse($('[name="date1"]').val())){
        console.log('FUTURE!');
        english += 'wanted ';

        switch($('[name="currency0"]').val() ){
          case 'usd':
          english += '$'+$('[name="amount0"]').val();
          break;
          case 'xbt':
          english += $('[name="amount0"]').val()+' Bitcoin';
          break;
        }//sw

        english += ' on '+eng_date0+', you would have needed to ';

        switch($('[name="currency1"]').val() ){
          case 'usd':
          english += 'spend $'+$('[name="amount1"]').val();
          break;
          case 'xbt':
          english += 'buy '+$('[name="amount1"]').val()+' Bitcoin';
          break;
        }//sw

      }else{
        switch($('[name="currency0"]').val() ){
          case 'usd':
          english += 'spent $'+$('[name="amount0"]').val();
          break;
          case 'xbt':
          english += 'bought '+$('[name="amount0"]').val()+' Bitcoin';
          break;
        }//sw

        english += ' on '+eng_date0+', you would have ';

        switch($('[name="currency1"]').val() ){
          case 'usd':
          english += '$'+$('[name="amount1"]').val();
          break;
          case 'xbt':
          english += $('[name="amount1"]').val()+' Bitcoin';
          break;
        }//sw

      }//if future
      english += ' on '+eng_date1+'.';


    }//if rate

    $('#explanation').html(english);

  }//calculate

  var get_rate = function(which, forced){
    console.log('get_rate', which);



    var now = new Date();
    var raw_date = $('[name="date'+which+'"]').val();//string
    //var obj_date = $('[name="date'+which+'"]').prop('valueAsDate');//obj
    var parsed_date = Date.parse(raw_date);//number
    var now_string = now.getFullYear() + '-' + (now.getMonth()+1) +'-'+now.getDate();

    if(forced == 'now' ||
    raw_date == now_string){

      $('[name="date'+which+'"]').val(now_string);
      $('#spinner').show();

      $.ajax({type: 'GET',
      url: "https://api.coindesk.com/v1/bpi/currentprice.json",
      //data: {'Body' : what},
      dataType: 'json',
      success: function(data){
        console && console.log('API success', data);

        rate[which] = data.bpi.USD.rate_float;
        calculate();
        $('#spinner').hide();
      },//success
      error : function(data){
        console && console.log('API error', data);
        pretty_message('There was a problem getting the exchange rate data. Sorry. Please try again later.');
        $('#spinner').hide();
      }
    });//ajax

  }else{

    if(isNaN(parsed_date)){
      return;
    }else if(parsed_date > Date.now()){
      pretty_message('You have chosen a date in the future. Please donate to help us build the Neural Network functions we have planned to make that prediction.');
      return;
    }else if(parsed_date < earliest_date_parsed){
      pretty_message('Please choose a date after '+earliest_date+'.');
      return;
    }else{
      $('#spinner').show();
      $.ajax({type: 'GET',
      url: "https://api.coindesk.com/v1/bpi/historical/close.json?start="+raw_date+"&end="+raw_date,
      //data: {'Body' : what},
      dataType: 'json',
      success: function(data){
        console && console.log('API success', data);
        rate[which] = data.bpi[Object.keys(data.bpi)[0]];
        calculate();
        $('#spinner').hide();
      },//success
      error : function(data){
        console && console.log('API error', data);
        pretty_message('There was a problem getting the exchange rate data. Sorry. Please try again later.');
        $('#spinner').hide();
      }
    });//ajax

  }//ifs

}//if now


}//get_rate

pretty_message = function(string){
  alert(string);
}//pretty_message


$(document).ready(function(){
  $('#spinner').hide();
  $('#go').click(function(event){
    event.preventDefault();
    //rate = [1600,800];
    calculate();
  });
  $('#amount0').change(function(event){
    dom = 0;
    calculate();
  });
  $('#amount1').change(function(event){
    dom = 1;
    calculate();
  });
  $('#currency0').change(function(event){
    dom = 1;
    calculate();
  });
  $('#currency1').change(function(event){
    dom = 0;
    calculate();
  });
  $('#date0').change(function(event){
    dom = 0;
    get_rate(0);
  });
  $('#date1').change(function(event){
    dom = 1;
    get_rate(1);
  });
  $('#now0').click(function(event){
    event.preventDefault();
    dom = 0;
    get_rate(0,'now');
  });
  $('#now1').click(function(event){
    event.preventDefault();
    dom = 1;
    get_rate(1,'now');
  });

});//ready
