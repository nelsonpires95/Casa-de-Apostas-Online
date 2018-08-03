$(function() {

    $('#login-form-link').click(function(e) {
		$("#login-form").delay(100).fadeIn(100);
 		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();

	});
	$('#register-form-link').click(function(e) {
		$("#register-form").delay(100).fadeIn(100);
 		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});

});

function login()  {
    var data = $('#login-form').serialize();
    console.log(data);
    $.ajax({
        type: 'POST',
        url: "http://127.0.0.1:4444/login",
        data: data,
        dataType: 'json',
        success: function (result) {
             console.log(result);
            if(result["text"] == "LoginOk" && result["result"] == 1 && result["type"] == "login") {
                window.token = result["token"];
                console.log("Token: "+window.token);
                    alert("Login ok");
                    window.location.href =  'home_page.html#'+result["token"];
            } else {
                //window.location.href = data.redirectUrl || '/';
                alert("Login Error");
                console.log("Login Error")
            }
         },
         error: function (err) {
            console.log(err);
         }
     });
     console.log("Finish!");
};

function logout()  {
    $.ajax({
        headers: {'X-AUTH-TOKEN': window.location.hash.substring(1)},
        url: "http://127.0.0.1:4444/logout",
        success: function (result) {
             result = $.parseJSON(result);

            if(result["text"] == "LoginOk" && result["result"] == 1 && result["type"] == "login") {
                    alert("Log Out");
                    window.location.href = 'login.html';
            } else {

                alert("No user login");
                console.log("Login Error")
            }


         },
         error: function (err) {
            console.log(err);
         }
     });
     console.log("Finish!");
};



function register()  {
    var data = $('#register-form').serialize();
    console.log(data);
    $.ajax({
        type: 'POST',
        url: "http://127.0.0.1:4444/register",
        data: data,
        dataType: 'json',
        success: function (result) {
             console.log(result);
            if(result["result"] == 1 && result["type"] == "registration" && result["text"] == "registOK") {
                    alert("User created");
                    window.location.href = data.redirectUrl || 'login.html';
            } else {
                //window.location.href = data.redirectUrl || '/';
                alert("User in use");
                console.log("User Error")
            }


         },
         error: function (err) {
            console.log(err);
         }
     });
     console.log("Finish!");
};






$('#table1', '#table2', '#tablex').ready(function(){




    if ($("#table1").length > 0) {
        $.ajax({

            url: "http://127.0.0.1:4444/data",
            headers: {'X-AUTH-TOKEN': window.location.hash.substring(1)},
            success: function (result) {
                    console.log(result);
                    result = $.parseJSON(result);

                    var vs = result.map(d => d.vs)
                    var stats = result.map(d => d.stats)
                    var draw = stats.map(d => d.empate)
                    var win = stats.map(d => d.vitoria)
                    var loss = stats.map(d => d.derrota)

                    console.log(vs[0][0])
                    console.log(vs[0][1])
                    console.log(stats[0])
                    console.log(draw[0])

                         if (result != "Not allowed"){
                                for (i = 0; i < Object.keys(result).length; i++) {


                                    $('#tableVS').append('<tr><td>'+vs[i][0]+' </td><td>vs</td><td> '+vs[i][1]+'</td></tr>');
                                    $('#table1').append('<tr><td>'+vs[i][0]+'</td><td>'+win[i]+'</td></tr>');
                                    $('#tablex').append('<tr><td>'+'Empate'+[i]+'</td><td>'+draw[i]+'</td></tr>')
                                    $('#table2').append('<tr><td>'+vs[i][1]+'</td><td>'+loss[i]+'</td></tr>')

                                }

                                $("#table1").on('click', 'td', function(){

                                    var table1 = document.getElementById('table1');

                                    for(var i = 1; i < table1.rows.length; i++)
                                    {
                                        table1.rows[i].onclick = function()
                                        {

                                             document.getElementById("escolha").value = this.cells[0].innerHTML;
                                             document.getElementById("odd").value = this.cells[1].innerHTML;
                                        };
                                    }
                                });

                               $("#tablex").on('click', 'td', function(){

                                    var tablex = document.getElementById('tablex');

                                    for(var i = 1; i < tablex.rows.length; i++)
                                    {
                                        tablex.rows[i].onclick = function(w)
                                        {

                                             document.getElementById("escolha").value = this.cells[0].innerHTML;
                                             document.getElementById("odd").value = this.cells[1].innerHTML;
                                        };
                                    }
                               });

                               $("#table2").on('click', 'td', function(){

                                    var table2 = document.getElementById('table2');

                                    for(var i = 1; i < table2.rows.length; i++)
                                    {
                                        table2.rows[i].onclick = function(e)
                                        {

                                             document.getElementById("escolha").value = this.cells[0].innerHTML;
                                             document.getElementById("odd").value = this.cells[1].innerHTML;
                                        };
                                    }
                               });

                    /*var output;
                    $.each(result, function(i,e) {
                          // here you structured the code depend on the table of yours
                           output += '<tr><td>'+e;
                     });/*$('#table1').append(output);*/
             }else{
                alert("Not Allowed")

             }},
             error: function (err) {
                console.log(err);

             }
         });
         console.log("Finish!");

}});

$('#user', '#money', '#winning').ready(function user(){
   if ($("#money").length > 0) {
        var url = document.URL;
        var dispData=url.split('thisData=')[1];
        var moneyChange = localStorage.getItem('Money');
        console.log(moneyChange)
        console.log(url + "data: "+dispData)
        $.ajax({
            url: "http://127.0.0.1:4444/user",
            headers: {'X-AUTH-TOKEN': window.location.hash.substring(1)},
            success: function (result) {
                    console.log(result);
                    result = $.parseJSON(result);
                    $('#user').append(result[0]);
                    $('#money').append(result[1], ' €');
                    $('#winning').append(result[2], ' €');
                    if (moneyChange != result[1]){
                        alert("Bet finish, view history to see about");
                    }
                    localStorage.setItem('Money', result[1]);
         }});



         console.log("Finish!");

}});



function bet()  {
    var data = $('#betform').serialize();
    console.log(data);

    $.ajax({
        type: 'POST',
        url: "http://127.0.0.1:4444/bets",
        data: data,
        headers: {'X-AUTH-TOKEN': window.location.hash.substring(1)},
        dataType: 'json',
        success: function (result) {
             console.log(result);
            if(result["result"] == 1 && result["type"] == "bet" && result["text"] == "betregist") {

                    alert("registered bet");
                    window.location.reload();
                    if (result["result"] == 1 && result["type"] == "bet" && result["text"] == "betNotregist"){                    	alert("Not Registed");
                    alert("Bet not registered");
                     console.log("Bet not registered");
                    }
                    //window.location.href = data.redirectUrl || '/';
            } else {
                //window.location.href = data.redirectUrl || '/';
                alert("Bet not registered");
                console.log("Bet not registered");
            }


         },
         error: function (err) {
            console.log(err);
         }
     });
     console.log("Finish!");
};


function inserirAposta()  {
    var data = $('#terminarApostasForm').serialize();
    console.log(data);


    $.ajax({
        type: 'POST',
        url: "http://127.0.0.1:4444/betInsert",
        data: data,
        headers: {'X-AUTH-TOKEN': window.location.hash.substring(1)},
        dataType: 'json',
        success: function (result) {
             console.log(result);
            if(result["result"] == 1 && result["type"] == "bet" && result["text"] == "betregist") {

                    alert("Aposta Inserida");
                    window.location.reload();
                    if (result["result"] == 1 && result["type"] == "bet" && result["text"] == "betNotregist"){
                    alert("Aposta NÃO Inserida");
                     console.log("Aposta NÃO Inserida");
                    }
                    //window.location.href = data.redirectUrl || '/';
            } else {
                //window.location.href = data.redirectUrl || '/';
                alert("Aposta NÃO Inserida");
                console.log("Aposta NÃO Inserida");
            }


         },
         error: function (err) {
            console.log(err);
         }
     });
     console.log("Finish!");
};




function terminarApostas()  {

    $.ajax({
        type: 'POST',
        url: "http://127.0.0.1:4444/terminate", // falta aqui
        data: {'submit':true},
        headers: {'X-AUTH-TOKEN': window.location.hash.substring(1)},
        dataType: 'json',
        success: function (result) {
             console.log(result);
            if(result["result"] == 1 && result["type"] == "terminate" && result["text"] == "terminateOK") {
                    alert("registered bet");
                    window.location.reload();
               
            } else {
                //window.location.href = data.redirectUrl || '/';
                alert("Bet not registered");
                console.log("Bet not registered");
            }


         },
         error: function (err) {
            console.log(err);
         }
     });
     console.log("Finish!");
};




function historico(){
        $.ajax({
            url: "http://127.0.0.1:4444/historico",
            headers: {'X-AUTH-TOKEN': window.location.hash.substring(1)},
            success: function (result) {
                 var x = document.getElementById("myDIV");
                 var historico = [];

                 result = $.parseJSON(result);
                 var userlog = document.getElementById("user").innerHTML




                 if (userlog == "User: admin"){

                         console.log(result);
                         console.log(Object.entries(result)[1][0]); // user

                         console.log(Object.entries(result)[0][1][0]);// primeira equipa;
                         console.log(Object.entries(result)[0][1][1]);//estadd
                         console.log(Object.entries(result)[0][1][2])//odd
                         console.log(Object.entries(result)[0][1][3])// valor aposta
                         console.log(Object.entries(result)[0][1][4])// lucro ou prejuizo
                         console.log(Object.entries(result)[0][1][5])// dinheiro
                         console.log(Object.entries(result)[0][1][6]) // ganhos
                         //var result = objArray.map(a => a.foo);


                         for(key in result) {
                            if(result.hasOwnProperty(key)) {
                                console.log(result[key].length)
                                for (var i = 0; i < (result[key].length); i++){
                                 historico.push('\n'+'Utilizador: '+ key +'\n'+'Equipa Apostada: '+result[key][i]+'\n'+'Estado: '+ result[key][i+1]+ '\n'+ 'Odd: '+result[key][i+2]
                                + '\n'+'Valor da Aposta: '+ result[key][i+3]+ '\n'+ 'Lucro/Prejuizo :'+result[key][i+4]
                                + '\n'+'Dinheiro: '+ result[key][i+5]+ '\n'+ 'Ganhos: '+result[key][i+6]+ '\n'+ '\n');
                                i+=6

                                }
                            }
                         }



                         if (document.getElementById("hist").style.display == 'none'){
                             document.getElementById("hist").style.display="block";
                             document.getElementById("hist").innerHTML = historico.toString();

                          }
                          else{
                            document.getElementById("hist").style.display="none";

                          }


                        }



                else{

                         for (var i = 0; i < (result.length); i++){
                                historico.push('\n'+'Equipa Apostada: '+result[i]+'\n'+'Estado: '+ result[i+1]+ '\n'+ 'Odd: '+result[i+2]
                                + '\n'+'Valor da Aposta: '+ result[i+3]+ '\n'+ 'Lucro/Prejuizo :'+result[i+4]
                                + '\n'+'Dinheiro: '+ result[i+5]+ '\n'+ 'Ganhos: '+result[i+6]+ '\n'+ '\n');
                                i+=6

                         }

                         if (document.getElementById("hist").style.display == 'none'){
                             document.getElementById("hist").style.display="block";
                             document.getElementById("hist").innerHTML = historico.toString();

                          }
                          else{
                            document.getElementById("hist").style.display="none";

                          }

                 }




         }});
         console.log("Finish!");

};
