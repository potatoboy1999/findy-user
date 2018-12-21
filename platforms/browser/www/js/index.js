//var base_api_url='http://localhost/findy/public/api/';
var base_api_url='https://admin.findy.pe/api/';
var storage = window.localStorage;
var storageLng = null;
var storageLat = null;
var commerceArray = null;
var commerce = null;
var user = null;
var profileCurrentTab = 'info';
var ctgLoaded = false;

var currPage = "";

window.onload= function () {
    $.mobile.loading("show", {
      text: "cargando",
      textVisible: true,
      textonly:false
    });
    document.addEventListener("deviceready", onDeviceReady, false);
};

function onDeviceReady() {
  console.log('deviceReady!!');
  //botones listeners
    //$("#getLocation").on("click",getCurrentLocation);
    $('#btn_fb').on('click',getDataFB);
    $('.btn_link_logIn').on('click',viewLogIn);
    $('.btn_link_register').on('click',viewRegister);
    $('.btn_nav').on('click',navigate);
    $('.btnMoreInfo').on('click',showMoreInfo);
    $('.btnLessInfo').on('click',function(){$('.moreInfo').hide();$('.info').show()})
    $('#btnLogIn').on("click",validateLogIn);
    $('#btnRegister').on("click",requestRegister);
    $('#btn_position').on('click',getCurrentLocation);
    $("#verCategoriasBtn").on('click',viewCategories);
    $('.exit-info').on('click',hideMoreInfo);
    $("#btn_sideMenu").on('click',showSideMenu);
    $(".exit-menu").on('click',hideSideMenu);
    $('#btn_profile').on('click',viewProfile);
    $('#btn_help').on('click',viewHelp);
    $('#btn_settings').on('click',viewSettings);
    $('#btn_questions').on('click',viewQuestions);
    $('#btn_about').on('click',viewAbout);
    $('#btn_comment').on('click',viewSendComment);
    $('.btn_viewMap').on('click',viewMap);
    $('#btn_user_data').on('click',showProfileData);
    $('#btn_user_history').on('click',showProfileHistory);
    $('.left-back').on('click',goToPage);
    
    $('.question').on('click',toggleAnswer);
    $('#btn_close_session').on('click',closeSession);
    $('.save-profile').on('click',editProfile);
    $('.btn_send_comment').on('click',sendComment);

    //$(".findy-category").on('click',viewSubCategories);
    
    //$("#mapPage").on("pageshow", loadMapPage);
    //$("#profilePage").on("pageshow", loadVisitsFromUser);
    //$("#helpPage").on("pageshow",loadDocs);  
  document.addEventListener("backbutton", onBackKeyDown, false);
  $.mobile.loading("hide");
}

function onBackKeyDown() {
  if (currPage == 'logIn' || currPage == 'registerPage') {
    navigator.notification.confirm('menu',confirmMenu,'Going Back',['Vamos!','Me Quedo']);
  }
  if(currPage == 'mapPage'){
    navigator.notification.confirm('Quiere salir de la app?',confirmExit,'Exit',['Si','No']);
  }
}
//confirm navigation
function confirmMenu(btn){
  if(btn == 1){
    viewMenu();
  }
}
function confirmExit(btn){
  if(btn == 1){
    navigator.app.exitApp();
  }
}

//load pages
$(document).on("pagebeforeshow",function(){
  currPage = $.mobile.activePage.attr('id');
});
$(document).on("pagebeforeshow","#mapPage",loadMapPage);
$(document).on("pagebeforeshow","#profilePage",loadProfilePage);
$(document).on("pagebeforeshow","#helpPage",loadDocs);
$(document).on("pagebeforeshow","#ctgPage",loadCtgPage);
$(document).on("pagebeforeshow","#subCtgPage",validateCtgLoad);


//PREVENT MIN HEIGHT JQUERY MOBILE
$(document).on( "pagecontainershow", function ( e, data ) {
   var activePage = data.toPage;
   activePage.css( "height", '100%' );
   setTimeout(function () {
      //var currentHeight = activePage.css( "min-height" );
      //activePage.css( "height", '100%' ); /* subtract 1px or set your custom height */
   }, 0); /* set delay here */
});
$(window).on( "throttledresize", function ( e ) {
   var activePage = $.mobile.pageContainer.pagecontainer( "getActivePage" );
   activePage.css( "height", '100%' );
   setTimeout(function () {
      //var currentHeight = activePage.css( "min-height" );
      //activePage.css( "height", '100%' );
   }, 0);
});

/*------- LOAD PAGES --------*/

function loadMapPage(){
    hideSideMenu();
    hideMoreInfo();
    hideInfo();
    if(!map){
      initMap();
      //getCurrentLocation();
      loadCommerceLocation(); 
      loadCategories();
    }
}
function loadProfilePage(){
  var uName = storage.getItem('userName');
  var uEmail = storage.getItem('email');
  $('.user_name').html(uName);
  $('input[name="user_name"]').val(uName);
  $('input[name="email"]').val(uEmail);
  loadVisitsFromUser();
  showProfileData();
}
function loadCtgPage(){
  if (!ctgLoaded) {
    loadCategories();
    ctgLoaded = true;
  }
}
function validateCtgLoad(){
  if (!ctgLoaded) {
    viewCategories();
  }
}

/*------- LOAD DATA FUNCTIONS ------------*/

function loadCategories(){
  $.mobile.loading("show", {
    text: "cargando",
    textVisible: true,
    textonly:false
  });

  $.ajax({
    url:base_api_url+'category/all',
    dataType:"json",
    success:function(response){
      console.log(response);
      ctg = response;
      var ctgDiv = $("#categories");
      ctgDiv.html('');
      ctg.forEach(function(ctg){
        ctgDiv.append("<div class='findy-category' ctg-id='"+ctg['id']+"' ctg-image='"+ctg.image+"' ctg-name='"+ctg['name']+"' style='float: left;'><div class='ctg-absolute'><img width='50' height='50' src='https://admin.findy.pe/img/categoria/"+ctg.image+"'><p class='ctg-name'>"+ctg['name']+"</p></div></div>");
      });
      $.mobile.loading("hide");
      $(".findy-category").on('click',viewSubCategories);
    },
    error:function(error){
      navigator.notification.alert('Error en la carga de categorias');
    }
  });
}

function loadSubCategories(subCtgArray){
  var listDiv = $('#subCtgList');
  listDiv.html('');
  subCtgArray.forEach(function(subCtg){
    listDiv.append("<div class='subCtg' subCtg='"+subCtg['id']+"' style='border-bottom: 1px solid black;'><div class='right-arrow' style='background-color: transparent'><img width='20' height='20' src='img/icons/continue.png'></div><p>"+subCtg['name']+"</p></div>");
  });
  $('.subCtg').on('click',showMapCategories);
}

function loadPositionCategories(ctgId){
  $.ajax({
    url:base_api_url+'commerces/getCategory',
    type:'post',
    dataType:'json',
    data:{
      'ctgId':ctgId
    },
    success:function(response){
      console.log('Commerce Category');
      console.log(response);

      commerceArray = response;
      response.forEach(function(comm){
        //alert('Comercio: '+comm.name+', lat:'+comm.lat+', lng:'+comm.lng);        
        var pos = {lat:parseFloat(comm.lat),lng:parseFloat(comm.lng)}
        var icon = {
                      url: "https://admin.findy.pe/img/marker/"+comm.category_img,
                      size: new google.maps.Size(150, 200),
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(17, 34),
                      scaledSize: new google.maps.Size(40, 55)
                    };
           //Create the Marker
           //console.log('creando el marcador');
           var marker = new google.maps.Marker({
                          map: map,
                          icon: icon,
                          title: comm.id.toString(),
                          position: pos
                        });
           arrayMarkers.push(marker);
           marker.addListener('click', function() {
             map.setZoom(18);
             map.panTo(marker.getPosition());
            
             var id = marker.getTitle();
             showInfo(id);
           });
      });
      hideCommOutOfRange(commerceArray);
    },
    error:function(error){
      navigator.notification.alert('Error en la carga de coordenadas')
    }
  });
}

function loadVisitsFromUser(){
  var userId = storage.getItem('userId');
  $.ajax({
    url:base_api_url+'visit/getVisits',
    type:'post',
    dataType:'json',
    data:{
      'idUser':userId
    },
    success:function(response){
      visits = $('#user_travel_history');
      visits.html('');
      console.log('Historial Comercios Viajados:');
      console.log(response);
      if (response.length == 0) {
        visits.html('<h2>No tiene ningun viaje registrado</h2>');
      }else{
        response.forEach(function(comm){
          var bStatus = 'Cerrado';
          var classStatus = 'closed';
          if (comm.bussiness_status == 1){
            bStatus = 'Abierto';
            classStatus = 'open';
          }
          visits.append(
                          "<div class='travel'>"+
                            "<div class='go-arrow transparent' commId='"+comm.commId+"' lat='"+comm.pos_lat+"' lng='"+comm.pos_lng+"' >"+
                              "<span>Volver A Ir</span>"+
                              "<img width='20' height='20' src='img/icons/continue.png'>"+
                            "</div>"+
                            "<div class='status'>"+
                              "<span class='b_status "+classStatus+"'>"+bStatus+"</span>"+
                            "</div>"+
                            "<div class='travel_info'>"+
                              "<div>"+
                                "<div class='left'>"+
                                  "<img height='35' width='35' src='img/categories/"+comm.category_img+"'>"+
                                "</div>"+
                                "<div class='right'>"+
                                  "<p>"+comm.name+"</p>"+
                                "</div>"+
                                "<div class='fix-clear'></div>"+
                              "</div>"+
                            "</div>"+
                          "</div>"
                        );
        });
        $('.go-arrow').on('click',navigateFromHistory); 
      }
    },
    error:function(error){
      navigator.notification.alert('Error en la carga de historial de visitas');
    }
  });
}

function loadDocs(){
  loadTerms();
  loadPolitics();
}
function loadTerms(){
  $.ajax({
    url:base_api_url+'docs/terms',
    success:function(response){
      $('#condiciones').html(response);
    },
    error:function(error){
      navigator.notification.alert('Error en la carga de documentos');
    }
  });
}
function loadPolitics(){
  $.ajax({
    url:base_api_url+'docs/politics',
    success:function(response){
      $('#privacidad').html(response);
    },
    error:function(error){
      navigator.notification.alert('Error en la carga de documentos');
    }
  });
}


/*------- REDIRECT / SHOW FUNCTIONS ------------*/
function goToPage(){
  page = $(this).attr('pageto');
  window.location.href = "#"+page;
}

function viewMenu(){
  window.location.href = "#menu";
}
function viewLogIn(){
  window.location.href = "#logIn";
}
function viewRegister(){
  window.location.href = "#registerPage";
}
function viewCategories(){
  window.location.href="#ctgPage";
}
function viewProfile(){
  $.mobile.loading( "show", {
    text: "cargando",
    textVisible: true,
    textonly:false
  });
  window.location.href = "#profilePage";
}
function viewQuestions(){
  window.location.href = "#questionsPage";
}
function viewAbout(){
  window.location.href = "#aboutPage";
}
function viewHelp(){
  window.location.href = "#helpPage";
}
function viewSettings(){
  window.location.href = "#settingsPage";
}
function viewSendComment(){
 window.location.href = "#commentsPage"; 
}
function viewCommentThanks(){
 window.location.href = "#commentThanksPage"; 
}
function viewMap(){
 window.location.href = "#mapPage";
}
function viewSubCategories(){
  $.mobile.loading("show", {
    text: "cargando",
    textVisible: true,
    textonly:false
  });

  var id = $(this).attr('ctg-id');
  var name = $(this).attr('ctg-name');
  var image = $(this).attr('ctg-image');
  $(".nameCtg").html(name);
  $("#ctgHeaderImg").attr('src',"img/categories_white/"+ image);

  console.log(id);
  $.ajax({
    url:base_api_url+'category/subList',
    type:'post',
    dataType:'json',
    data:{
      'parent':id
    },
    success:function(response){
        console.log(response);
        if (response.length == 1) {
          var ctgId = response[0]['id'];
          deleteMarkers();
          loadPositionCategories(ctgId);
          hideInfo();
          $.mobile.loading("hide");
          window.location.href="#mapPage";
          return;
        }
        loadSubCategories(response);
        window.location.href="#subCtgPage";
    },
    error: function(error) {
      navigator.notification.alert('Error: No se pudo contactar con la API... Url:'+base_api_url+'customer/register');
    }
  });
}
function showMapCategories(){
  var ctgId = $(this).attr('subctg');
  console.log(ctgId);
  deleteMarkers();
  loadPositionCategories(ctgId);
  hideInfo();
  ctgLoaded = false;
  window.location.href = "#mapPage";
}
function toggleAnswer(e){
  var answer = $(this).attr('for');
  var imgDiv = $(this).find('.right-arrow');
  if(imgDiv.attr('st') == 'down'){
    imgDiv.attr('st','up');
    imgDiv.find('img').attr('src','img/icons/drop_up.png');
  }else if(imgDiv.attr('st') == 'up'){
    imgDiv.attr('st','down');
    imgDiv.find('img').attr('src','img/icons/drop_down.png');
  }
  $('.'+answer).slideToggle();
}
function showProfileData(){
  profileCurrentTab = 'data';
  $('#btn_user_history').removeClass('info_active');
  $('#user_travel_history').hide();

  $('#btn_user_data').addClass('info_active');
  $('#user_extra_info').show();
}
function showProfileHistory(){
  profileCurrentTab = 'history';
  $('#btn_user_data').removeClass('info_active');
  $('#user_extra_info').hide();

  $('#btn_user_history').addClass('info_active');
  $('#user_travel_history').show();
}

/*------- LOGIN / REGISTER / LOG OFF ----------*/

function requestRegister(e){
  e.preventDefault();

  email = $("#registerForm input[name='email']").val();
  user_name = $("#registerForm input[name='user_name']").val();
  password = $("#registerForm input[name='password']").val();
  password_confirm = $("#registerForm input[name='password_confirm']").val();
  
  //Set Obligatory Inputs
  if(email === '' || user_name === '' || password === '' || password_confirm === ''){
    navigator.notification.alert('Por favor llene todos los datos');
    return;
  }
  //Confirm passwords the same
  if(password !== password_confirm){
    navigator.notification.alert('Las contraseñas no son iguales');
    return;
  }

  $.ajax({
    url:base_api_url+'customer/register',
    type:'post',
    dataType:'json',
    data:{
      'user_name':user_name,
      'email':email,
      'password':password
    },
    success:function(response){
      if (response['status']=='ok') {
        navigator.notification.alert(response.message);
        window.location.href = "#logIn";
      }else{
        navigator.notification.alert(response.message);
      }
      
    },
    error: function(error) {
      navigator.notification.alert('Error: No se pudo contactar con la API... Url:'+base_api_url+'customer/register');
    }
  });
}

function validateLogIn(e){
  e.preventDefault();

  $.mobile.loading( "show", {
    text: "cargando",
    textVisible: true,
    textonly:false
  });
  //window.plugins.spinnerDialog.show(null,'cargando...');

  email = $("#logInForm input[name='email']").val();
  password = $("#logInForm input[name='password']").val();
  
  //Set Obligatory Inputs
  if(email === '' || password === ''){
    navigator.notification.alert('Por favor llene todos los datos');
    return;
  }
  $.ajax({
    url:base_api_url+'customer/validateUser',
    type:'post',
    dataType:'json',
    data:{
      'email':email,
      'password':password
    },
    success:function(response){
      if (response['status']=='ok') {
        user = response['idUser'];
        storage.setItem('userId', response['idUser']);
        storage.setItem('userName',response['user_name']);
        storage.setItem('email',response['email']);
        $('.user_name').html(response['user_name']);
        $('input[name="user_name"]').val(response['user_name']);
        $('input[name="email"]').val(response['email']);
        loadMapPage();
        loadVisitsFromUser();

        window.location.href = "#mapPage";
      }else{
        navigator.notification.alert(response.message);
        $.mobile.loading( "hide" );
      }
    },
    error: function(error) {
      navigator.notification.alert('Error: No se pudo comunicar con el servidor de Findy');
      //navigator.notification.alert('Error: No se pudo contactar con la API... Url:'+base_api_url+'customer/validateUser');
    }
  });
}

function closeSession(){
  storage.removeItem('email');
  storage.removeItem('userId');
  storage.removeItem('userName');
  storage.removeItem('PosLat');
  storage.removeItem('PosLng');
  window.location.href = "#logIn";
}
function getDataFB(e){
  /*
  e.preventDefault();
  facebookConnectPlugin.login(["public_profile","email"],fbSuccess,fbError);*/
}
/*
function fbSuccess(result){
  //success
  console.log(JSON.stringify(result));
  //calling api
  facebookConnectPlugin.api("/me?fields=email,name,picture",["public_profile","email"],fbApiSuccess,fbApiError);
}
function fbError(error){
  alert(JSON.stringify(error));
}
function fbApiSuccess(userData){
  alert(JSON.stringify(userData));
}

function fbApiError(error){
  alert(JSON.stringify(error));
}*/
/*------- EDIT DATA ----------*/
function editProfile(){
  $.mobile.loading( "show", {
    text: "cargando",
    textVisible: true,
    textonly:false
  });

  var custId = storage.getItem('userId');
  var user_name = $('#profile_name').val();
  var email = $('#profile_email').val();
  var password = $('#profile_password').val();
  if (!user_name || !email) {
    navigator.notification.alert('Por favor complete los datos en su perfil');
  }else{
    if (email.indexOf('@') == -1) {
      navigator.notification.alert('Por favor ingrese un email válido');
    }else{
      //navigator.notification.alert('Espere un momento');
      $.ajax({
        url:base_api_url+'customer/editUser',
        type:'post',
        dataType:'json',
        data:{
          'custId': custId,
          'user_name':user_name,
          'email':email
        },
        success:function(response){
          storage.setItem('userName',user_name);
          storage.setItem('email',email);
          $('.user_name').html(user_name);
          $('input[name="user_name"]').val(user_name);
          $('input[name="email"]').val(email);
          $.mobile.loading( "hide");
          navigator.notification.alert('Se han guardado los cambios');
        },
        error: function(error) {
          $.mobile.loading("hide");
          navigator.notification.alert('Error: No se pudo comunicar con el servidor de Findy');
          //navigator.notification.alert('Error: No se pudo contactar con la API... Url:'+base_api_url+'customer/validateUser');
        }
      });
      //console.log('NAME: '+user_name);
      //console.log('EMAIL: '+email);
    }
  }
  //console.log('PASSWORD: '+password);
}
/*------- SEND DATA ----------*/
function sendComment(){
  $.mobile.loading("show", {
    text: "cargando",
    textVisible: true,
    textonly:false
  });
  var custId = storage.getItem('userId');
  var user_name = $('#comment_name').val();
  var email = $('#comment_email').val();
  var comment = $('#comment_text').val();
  if (!user_name || !email || !comment) {
    navigator.notification.alert('Por favor complete los datos');
  }else{
    if (email.indexOf('@') == -1) {
      navigator.notification.alert('Por favor ingrese un email válido');
    }else{
      //navigator.notification.alert('Espere un momento');
      console.log('NAME: '+user_name);
      console.log('EMAIL: '+email);
      console.log('COMMENT: '+comment);
      $.ajax({
        url:base_api_url+'customer/sendComment',
        type:'post',
        dataType:'json',
        data:{
          'user_name':user_name,
          'email':email,
          'comment': comment
        },
        success:function(response){
          //navigator.notification.alert('Gracias por su comentario');
          viewCommentThanks();
        },
        error: function(error) {
          $.mobile.loading("hide");
          navigator.notification.alert('Error: No se pudo comunicar con el servidor de Findy');
          //navigator.notification.alert('Error: No se pudo contactar con la API... Url:'+base_api_url+'customer/validateUser');
        }
      });
      //console.log('NAME: '+user_name);
      //console.log('EMAIL: '+email);
      //console.log('COMMENT: '+comment);
    }
  }
}

/*------- GEOLOCATION --------*/
function getCurrentLocation(){
  //alert('Get GPS Start');
  $.mobile.loading("show", {
    text: "localizandote...",
    textVisible: true,
    textonly:false
  });

  //GET CURRENT POSITION 1 TIME
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {maximunAge:300000, timeout:30000, enableHighAccuracy:true});

  //GET POSITION LIVE
  //navigator.geolocation.watchPosition(onSuccess, onError, {maximunAge:300000, timeout:30000, enableHighAccuracy:true});
};

function geoSuccess(position){
  //alert('Retrieve current location');
  lng = position.coords.longitude;
  lat = position.coords.latitude;


  storage.setItem('PosLng',lng);
  storage.setItem('PosLat',lat);

  //navigator.notification.alert("longitude: "+lng+", Latitude: "+lat);
  var markerOptions = new google.maps.Marker({
    clickable: true,
    flat: true,
    map: map,
    position: {lat:lat, lng:lng},
    title: "You are here",
    visible:true,
    icon:'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  });
  var marker = new google.maps.Marker(markerOptions);
  //mapMsg.setCenter(results[0].geometry.location);
  map.panTo({lat:lat, lng:lng});
  $.mobile.loading("hide");

  //Cargar comercios en rango de 3km
  hideCommOutOfRange(commerceArray); 
};

function hideCommOutOfRange(cArray){
  posLatLng = new LatLon(parseFloat(storage.getItem('PosLat')),parseFloat(storage.getItem('PosLng')));
  commInRange = [];
  commOutOfRange = [];
  cArray.forEach(function(commerce){
    commLat = commerce.lat;
    commLng = commerce.lng;
    if (calcDistance(commLat,commLng, posLatLng) > 3000) {
      commOutOfRange.push(commerce);
    }else{
      commInRange.push(commerce);
    }
    //navigator.notification.alert('Distancia a '+commerce.name+': '+calcDistance(commLat, commLng, posLatLng)+' metros');
    console.log('Distancia a '+commerce.name+': '+calcDistance(commLat, commLng, posLatLng)+' metros');
  });
  hideMapOnArray(map,commOutOfRange);
  console.log(commInRange);
  console.log(commOutOfRange);

  commerceArray = commInRange;
  if (commerceArray.length == 0) {
        navigator.notification.alert('No hay commercios de esta categoria cerca a ti (en 3km)');
      }
}

function geoError(error){
  $.mobile.loading("hide");
  navigator.notification.alert("No te encontramos. Por favor verifica tu GPS");
  //navigator.notification.alert("code: "+ error.code+ ", message: "+error.message);
};
function calcDistance(lat, lng, pos2) {
    var pos1 = new LatLon(lat, lng);
    return pos1.distanceTo(pos2);
};
/*------ WAZE/MAPS LINKS --------*/

function navigate(){
  //navigator.notification.alert("Start Call to navigator");
  linkNav = $('.linkNavigation');
  lat = linkNav.attr('lat');
  lng = linkNav.attr('lng');
  idComm = linkNav.attr('idComm');
  idUser = storage.getItem('userId');

  lat = parseFloat(lat);
  lng = parseFloat(lng);
  console.log('COMMERCE ID:'+idComm);
  console.log('USER ID:'+idUser);
  saveTravelHistory(idComm,idUser);
  linkNav = 'https://www.waze.com/ul?ll='+lat+'%2C'+lng+'&navigate=yes&zoom=17';
  window.open(linkNav,'_system');
  /*
  navigator.notification.alert(lat);
  navigator.notification.alert(lng);
  launchnavigator.navigate([lat,lng],{
        start:"-12.108670,-77.028547",
        enableDebug: true,
        successCallback: onSuccessNav,
        errorCallback: onErrorNav
      });
  navigator.notification.alert(linkNav);
  */
}

function navigateFromHistory(){
  console.log('hola');
  btn = $(this);
  lat = btn.attr('lat');
  lng = btn.attr('lng');
  idComm = btn.attr('commId');
  idUser = storage.getItem('userId');

  lat = parseFloat(lat);
  lng = parseFloat(lng);

  console.log('COMMERCE ID:'+idComm);
  console.log('USER ID:'+idUser);
  saveTravelHistory(idComm,idUser);
  linkNav = 'https://www.waze.com/ul?ll='+lat+'%2C'+lng+'&navigate=yes&zoom=17';
  window.open(linkNav,'_system');
}

function onSuccessNav(){
    navigator.notification.alert("Navigator Correctamente Iniciado");
}

function onErrorNav(errMsg){
    navigator.notification.alert("Error en Navegador: "+errMsg);
}

function saveTravelHistory(idComm,idUser){
  var date = dateToday();
  $.ajax({
        url:base_api_url+'visit/saveTravel',
        type:'post',
        dataType:'json',
        data:{
          'userId':idUser,
          'idComm':idComm,
          'date':date
        },
        success:function(response){
          console.log('Viaje a sido registrado!');
        },
        error: function(error) {
          console.log('Error: No se pudo comunicar con el servidor de Findy');
          //navigator.notification.alert('Error: No se pudo contactar con la API... Url:'+base_api_url+'customer/validateUser');
        }
      });
}

function dateToday(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd = '0'+dd
  } 

  if(mm<10) {
      mm = '0'+mm
  } 

  today =  yyyy + '-' + mm + '-' + dd ;
  return today;
}

/*------- BUTTONS HIDE / SHOW ------*/

function hideInfo(){
  $('.info').hide();
}
function hideMoreInfo(){
  $('.moreInfo').hide();
}
function hideSideMenu(){
  $("#mapMenu").hide();
}
function showInfo(id){
  $.ajax({
    url:base_api_url+'commerces/info/'+id,
    dataType:"json",
    success:function(comm){
      commerce = comm;
      $('.commName').html(comm.name);
      $('.commDireccion').html(comm.address);
      $('.commSchedule').html('<strong>Horario de Atención:</strong> '+comm.hourStart+" - "+comm.hourEnd);
      $('.commCategoryImg').attr('src','https://admin.findy.pe/img/categoria/'+comm.category_image)
      $('.linkNavigation').attr('lat',comm.lat);
      $('.linkNavigation').attr('lng',comm.lng);
      $('.linkNavigation').attr('idComm',comm.id);
      $('.btnMoreInfo').attr('commId',comm.id);
      $('.info').show();
      //$('.commSchedule').html(comm.name);
    },
    error:function(error){
      navigator.notification.alert('Error, no se pudo obtener la información');
    }
  });
}
function showMoreInfo(){
  var commId = $(this).attr('commId');
  console.log(commId);
  hideInfo();
  $('.comm_name').html(commerce['name']);
  $('.comm_descr').html(commerce['description']);
  $('.comm_start').html(commerce['hourStart']);
  $('.comm_end').html(commerce['hourEnd']);
  $('.comm_days').html(commerce['daysWord']);
  $('.comm_address').html(commerce['address']);
  $('.moreInfo').show();
}
function showSideMenu(){
  $("#mapMenu").show();
}



