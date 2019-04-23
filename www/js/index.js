//var base_api_url='http://192.168.0.10/findy/public/api/';
//var commerce_images = 'http://192.168.0.10/findy/img/commerces/';
//var ctg_icon_url = 'http://192.168.0.10/findy/public/img/categoria/';
//var ctg_white_icon_url = 'http://192.168.0.10/findy/public/img/categories_white/';
var base_api_url='https://admin.findy.pe/api/';
var commerce_images = 'https://admin.findy.pe/img/commerces/';
var ctg_icon_url='https://admin.findy.pe/img/categoria/';
var ctg_white_icon_url = 'https://admin.findy.pe/img/categories_white/';

var storage = window.localStorage;
var storageLng = null;
var storageLat = null;
//var markerPosition = null;
var positionArray = [];
var commerceArray = null;
var commerce = null;
var commerce_img = [];
var user = null;
var profileCurrentTab = 'info';
var ctgLoaded = false;
var sideMenu = false;

var currPage = "";
var currCtg = null;

var fcLogin = false;

window.onload= function () {
    $.mobile.loading("show", {
      text: "Inicializando...",
      textVisible: true,
      textonly:false
    });
    document.addEventListener("deviceready", onDeviceReady, false);
};

function onDeviceReady() {
  console.log('deviceReady!!');
  //activar carrusel
  
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
  $('#btn_position').on('click',refreshLocation);
  $("#verCategoriasBtn").on('click',viewCategories);
  $('.exit-info').on('click',hideMoreInfo);
  $("#btn_sideMenu").on('click',showSideMenu);
  $(".exit-menu").on('click',hideSideMenu);
  $('#btn_profile').on('click',viewProfile);
  $("#btn_send_pass").on('click',changePassword);
  $("#btnChangePassword").on('click',viewNewPass);
  $('#btn_help').on('click',viewHelp);
  $('#btn_settings').on('click',viewSettings);
  $('#btn_questions').on('click',viewQuestions);
  $('#btn_about').on('click',viewAbout);
  $('#btn_comment').on('click',viewSendComment);
  $('.btn_viewMap').on('click',viewMap);
  $('#btn_user_data').on('click',showProfileData);
  $('#btn_user_history').on('click',showProfileHistory);
  $('.left-back').on('click',goToPage);
  $(".linkToCopy").on('click',copyLink);
  
  $('.question').on('click',toggleAnswer);
  $('#btn_close_session').on('click',closeSession);
  $('.save-profile').on('click',editProfile);
  $('.btn_send_comment').on('click',sendComment);

  $('#resetPassword').on('click',viewPasswordReset);
  $('#fbLink').on('click',viewFbLink);
  $('#InstagramLink').on('click',viewInstagramLink);

  //$(".findy-category").on('click',viewSubCategories);
  
  //$("#mapPage").on("pageshow", loadMapPage);
  //$("#profilePage").on("pageshow", loadVisitsFromUser);
  //$("#helpPage").on("pageshow",loadDocs);  
  document.addEventListener("backbutton", onBackKeyDown, false);
  $.mobile.loading("hide");
}

function onBackKeyDown() {
  if (currPage == 'logIn' || currPage == 'registerPage') {
    viewMenu();
    //navigator.notification.confirm('menu',confirmMenu,'Going Back',['Vamos!','Me Quedo']);
  }
  if (currPage == 'terms' || currPage == 'politics') {
    redirectRegister();
  }
  if(currPage == 'mapPage'){
    if (sideMenu) {
      hideSideMenu();
    }else{
      navigator.notification.confirm('Quiere salir de la app?',confirmExit,'Exit',['Si','No']);
    }
  }
  if(currPage == 'ctgPage' || currPage == 'helpPage' || currPage == 'profilePage' || currPage == 'moreInfo'){
    viewMap();
  }
  if (currPage == 'passwordPage') {
    viewProfile();
  }
  if (currPage == 'questionsPage' || currPage == 'aboutPage' || currPage == 'commentsPage') {
    viewHelp();
  }
  if (currPage == 'subCtgPage') {
    viewCategories();
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
$(document).on("pagebeforeshow","#menu",loadMenuPage);
$(document).on("pagebeforeshow","#registerPage",loadDocs);
$(document).on("pagebeforeshow","#terms",loadTerms);
$(document).on("pagebeforeshow","#politics",loadPolitics);
$(document).on("pagebeforeshow","#mapPage",loadMapPage);
$(document).on("pagebeforeshow","#profilePage",loadProfilePage);
$(document).on("pagebeforeshow","#helpPage",loadDocs);
$(document).on("pagebeforeshow","#ctgPage",loadCtgPage);
$(document).on("pagebeforeshow","#subCtgPage",validateCtgLoad);


//PREVENT MIN HEIGHT JQUERY MOBILE
$(document).on( "pagecontainershow", function ( e, data ) {
   var activePage = data.toPage;
   activePage.css( "height", '100%' );
});
$(window).on( "throttledresize", function ( e ) {
   var activePage = $.mobile.pageContainer.pagecontainer( "getActivePage" );
   activePage.css( "height", '100%' );
});

/*------- LOAD PAGES --------*/
function loadMenuPage(){
  var i = Math.floor((Math.random() * 4) + 0);
  var arrayImgs = ['findy_fondo_inicio.png','findy_locales.png','findy_como_llegar.png','findy_tiempo_real.png'];
  var imglink = arrayImgs[i];
  console.log(imglink);
  $("#menu-back").css('background-image',"url('img/dummy/"+imglink+"')");
}
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
      //console.log(response);
      ctg = response;
      var ctgDiv = $("#categories");
      ctgDiv.html('');
      ctg.forEach(function(ctg){
        ctgDiv.append("<div class='findy-category' ctg-id='"+ctg['id']+"' ctg-image='"+ctg.image+"' ctg-name='"+ctg['name']+"' style='float: left;'><div class='ctg-absolute'><img width='50' height='50' src='"+ctg_icon_url+ctg.image+"'><p class='ctg-name'>"+ctg['name']+"</p></div></div>");
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
    listDiv.append("<div class='subCtg' subCtg='"+subCtg['id']+"' style='border-bottom: 1px solid #c4c4c4;'><div class='right-arrow' style='background-color: transparent'><img width='20' height='20' src='img/icons/continue.png'></div><p>"+subCtg['name']+"</p></div>");
  });
  $('.subCtg').on('click',showMapCategories);
}

function loadPositionCategories(ctgId){
  console.log('cargando posiciones por categoria.....');
  $.mobile.loading("show", {
    text: "buscando comercios...",
    textVisible: true,
    textonly:false
  });
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

      currCtg = ctgId;
      commerceArray = response;
      
      loadCommInRange(commerceArray,8000);
      $.mobile.loading("hide");
    },
    error:function(error){
      $.mobile.loading("hide");
      navigator.notification.alert('Error en la carga de coordenadas')
    }
  });
}

function refreshCtgCommerceLocation(ctgId){
  console.log('cargando posiciones por categoria.....');
  $.mobile.loading("show", {
    text: "espere...",
    textVisible: true,
    textonly:false
  });
  $.ajax({
    url:base_api_url+'commerces/getCategory',
    type:'post',
    dataType:'json',
    data:{
      'ctgId':ctgId
    },
    success:function(response){
      $.mobile.loading("hide");
      console.log('Commerce Category');
      console.log(response);
      commerceArray = response;
      getCurrentLocation();
    },
    error:function(error){
      $.mobile.loading("hide");
      navigator.notification.alert('Error: no hay conexión a internet')
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
                                  "<img height='35' width='35' src='"+ctg_icon_url+comm.category_img+"'>"+
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
      $('#terms_content').html(response);
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
      $('#politics_content').html(response);
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
function viewMap(){
  window.location.href = "#mapPage";
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
function viewMoreInfo(){
 window.location.href="#moreInfo"; 
}
function viewProfile(){
  $.mobile.loading( "show", {
    text: "cargando",
    textVisible: true,
    textonly:false
  });
  window.location.href = "#profilePage";
}
function viewNewPass(){
  window.location.href = "#passwordPage";
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
function viewPasswordReset(){
  link = "https://user.findy.pe/public/password/reset";
  window.open(link,'_system');
}
function viewFbLink(){
  link = "https://www.facebook.com/FINDY-1159776080854374/?modal=admin_todo_tour";
  window.open(link,'_system');
}
function viewInstagramLink(){
  link = "https://www.instagram.com/findyperu/";
  window.open(link,'_system'); 
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
  $("#ctgHeaderImg").attr('src',ctg_white_icon_url+ image);

  console.log(id);
  $.ajax({
    url:base_api_url+'category/subList',
    type:'post',
    dataType:'json',
    data:{
      'parent':id
    },
    success:function(response){
        //console.log(response);
        if (response.length == 0) {
          $.mobile.loading("hide");
          var ctgId = id;
          console.log(ctgId);
          deleteMarkers();
          loadPositionCategories(ctgId);
          hideInfo();
          window.location.href="#mapPage";
          return;
        }
        loadSubCategories(response);
        window.location.href="#subCtgPage";
    },
    error: function(error) {
      $.mobile.loading("hide");
      navigator.notification.alert('Error: No se pudo contactar con la API... ');
    }
  });
}
function showMapCategories(){
  $.mobile.loading("show", {
    text: "cargando",
    textVisible: true,
    textonly:false
  });
  var ctgId = $(this).attr('subctg');
  //console.log(ctgId);
  deleteMarkers();
  hideInfo();
  $.mobile.loading("hide");
  loadPositionCategories(ctgId);
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
    $.mobile.loading( "hide");
    navigator.notification.alert('Por favor llene todos los datos');
    return;
  }
  //Confirm passwords the same
  if(password !== password_confirm){
    $.mobile.loading( "hide");
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
        $.mobile.loading( "hide");
        navigator.notification.alert(response.message);
      }
      
    },
    error: function(error) {
      $.mobile.loading( "hide");
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
    $.mobile.loading( "hide");
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
        $.mobile.loading( "hide" );
        navigator.notification.alert(response.message);
      }
    },
    error: function(error) {
      $.mobile.loading( "hide");
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
  if (fcLogin) {
    window.CordovaFacebook.logout();
  }
}
function getDataFB(e){
  //console.log('start FB');
  //alert('start FB');

  e.preventDefault();
  window.CordovaFacebook.logout();
  window.CordovaFacebook.login({
    permissions: ["public_profile","email"],
    onSuccess: function(result) {
      if(result.declined.length > 0) {
         navigator.notification.alert("Inicio con facebook cancelado");
      }else{
        var resultado = JSON.stringify(result,null,4);
        //alert('TOKEN FB');
        //alert(resultado.accessToken);
        // METHOD FOR ANDROID
        window.CordovaFacebook.graphRequest({
          path: '/me',
          params: {access_token: resultado.accessToken, fields: "id,name,email"},
          onSuccess: function (userData) {
              //uData = JSON.stringify(userData,null,4);
              //alert(uData);
              facebookCallback(userData);
          },
          onFailure: function (result) {
              if (result.error) {
                  navigator.notification.alert('error!');
                  alert('error', 'There was an error in graph request:' + result.errorLocalized);
              }else{
                navigator.notification.alert('Error Facebook data feed: '+ result.errorLocalized);
              }
          }
        });
        // METHOD FOR IOS
        /*
        window.CordovaFacebook.graphRequest({
          path: '/me?fields=email,name,id&access_token='+resultado.accessToken,
          onSuccess: function (userData) {
              //uData = JSON.stringify(userData,null,4);
              //alert(uData);
              facebookCallback(userData);
          },
          onFailure: function (result) {
              if (result.error) {
                  navigator.notification.alert('Error al obtener datos de facebook!');
                  //alert('error', 'There was an error in graph request:' + result.errorLocalized);
              }
              navigator.notification.alert('Error Facebook data feed');
          }
        });
        */
        
      }
    },
    onFailure: function(result) {
      if(result.cancelled) {
        navigator.notification.alert("Inicio con facebook cancelado");
        //navigator.notification.alert("The user doesn't like my app");
      } else if(result.error) {
        navigator.notification.alert("Ups, ocurrió un error con facebook");
        //navigator.notification.alert("There was an error:" + result.errorLocalized);
      }else{
        navigator.notification.alert("Ups, algo sucedio con facebook");
      }
    }
  });
}

function facebookCallback(fbData){
  var name = fbData.name;
  var email = fbData.email;
  var fbId = fbData.id;
  $.ajax({
        url:base_api_url+'customer/callbackFB',
        type:'post',
        dataType:'json',
        data:{
          'email': email,
          'name':name,
          'fbId':fbId
        },
        success:function(response){
          if (response['status'] == 'error') {
            navigator.notification.alert(response['message']);
            return;
          }
          actionTaken = response.function;
          if (actionTaken == 'logIn' || actionTaken == 'register') {
            user = response['idUser'];
            storage.setItem('userId', response['idUser']);
            storage.setItem('userName',response['user_name']);
            storage.setItem('email',response['email']);
            $('.user_name').html(response['user_name']);
            $('input[name="user_name"]').val(response['user_name']);
            $('input[name="email"]').val(response['email']);
            loadMapPage();
            loadVisitsFromUser();
            fcLogin = true;
            window.location.href = "#mapPage";
          }else{
            fcLogin = false;
            navigator.notification.alert('Error FB!');  
          }
        },
        error: function(error) {
          $.mobile.loading("hide");
          //navigator.notification.alert('Error message:'+ error.responseText);
          navigator.notification.alert('Error: No se pudo comunicar con el servidor de Findy');
          //navigator.notification.alert('Error: No se pudo contactar con la API... Url:'+base_api_url+'customer/validateUser');
        }
      });
}

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
    $.mobile.loading( "hide");
    navigator.notification.alert('Por favor complete los datos en su perfil');
  }else{
    if (email.indexOf('@') == -1) {
      $.mobile.loading( "hide");
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
function changePassword(){
  $.mobile.loading("show", {
    text: "cargando",
    textVisible: true,
    textonly:false
  });
  var custId = storage.getItem('userId');
  old_password = $("#formPassword input[name='old_pass']").val();
  password = $("#formPassword input[name='new_pass']").val();
  password_confirm = $("#formPassword input[name='new_pass_conf']").val();

  if(old_password === '' || password === '' || password_confirm === ''){
    $.mobile.loading( "hide");
    navigator.notification.alert('Por favor llene todos los datos');
    return;
  }
  
  //Confirm passwords the same
  if(password !== password_confirm){
    $.mobile.loading("hide");
    navigator.notification.alert('Las contraseñas no son iguales');
    return;
  }
  $.ajax({
        url:base_api_url+'profile/changePass',
        type:'post',
        dataType:'json',
        data:{
          'custId': custId,
          'old_password': old_password,
          'password':password
        },
        success:function(response){
          navigator.notification.alert('Se han guardado los cambios');
          viewProfile();
        },
        error: function(error) {
          $.mobile.loading("hide");
          navigator.notification.alert('Error: No se pudo comunicar con el servidor de Findy');
          //navigator.notification.alert('Error: No se pudo contactar con la API... Url:'+base_api_url+'customer/validateUser');
        }
      });
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
    $.mobile.loading( "hide");
    navigator.notification.alert('Por favor complete los datos');
  }else{
    if (email.indexOf('@') == -1) {
      $.mobile.loading( "hide");
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
function refreshLocation(){
  hideSideMenu();
  if (currCtg) {
    refreshCtgCommerceLocation(currCtg);
  }else{
    refreshAllCommerceLocation();
  }
}
function getCurrentLocation(){
  $.mobile.loading("show", {
    text: "localizandote...",
    textVisible: true,
    textonly:false
  });
  console.log('GPS start');

  //GET CURRENT POSITION 1 TIME
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {maximunAge:300000, timeout:30000, enableHighAccuracy:true});

  //GET POSITION LIVE
  //navigator.geolocation.watchPosition(onSuccess, onError, {maximunAge:300000, timeout:30000, enableHighAccuracy:true});
};

function geoSuccess(position){
  //alert('Retrieve current location');
  $.mobile.loading("hide");
  $.mobile.loading("show", {
    text: "cargando...",
    textVisible: true,
    textonly:false
  });
  lng = position.coords.longitude;
  lat = position.coords.latitude;


  storage.setItem('PosLng',lng);
  storage.setItem('PosLat',lat);

  position = {lat:lat, lng:lng};

  //navigator.notification.alert("longitude: "+lng+", Latitude: "+lat);
  if (positionArray.length == 0){
    console.log('marker no Existe');
    var markerOptions = {
      map: map,
      position: position,
      title: "You are here",
      icon:'img/marker/blue-dot.png',
    };
    var markerPosition = new google.maps.Marker(markerOptions);
    positionArray.push(markerPosition);
  }else{
    console.log('marker Existe');
    map.setZoom(16);
    positionArray[0].setPosition(position);
  }
  //mapMsg.setCenter(results[0].geometry.location);
  map.panTo({lat:lat, lng:lng});

  console.log('position found');
  //Cargar comercios en rango de 8km
  console.log('buscando rango 8km');
  loadCommInRange(commerceArray,8000); 

  $.mobile.loading("hide");
};

function loadCommInRange(cArray,range){
  posLatLng = new LatLon(parseFloat(storage.getItem('PosLat')),parseFloat(storage.getItem('PosLng')));
  commInRange = [];
  commOutOfRange = [];
  cArray.forEach(function(commerce){
    commLat = commerce.lat;
    commLng = commerce.lng;
    if (calcDistance(commLat,commLng, posLatLng) > range) {
      commOutOfRange.push(commerce);
    }else{
      commInRange.push(commerce);
    }
    //navigator.notification.alert('Distancia a '+commerce.name+': '+calcDistance(commLat, commLng, posLatLng)+' metros');
    console.log('Distancia a '+commerce.name+': '+calcDistance(commLat, commLng, posLatLng)+' metros');
  });
  //hideMapOnArray(map,commOutOfRange);
  console.log(commInRange);
  console.log(commOutOfRange);

  commerceArray = commInRange;
  deleteMarkers();
  createMarkersCommerces(commerceArray);
  if (commerceArray.length == 0) {
        navigator.notification.alert('No hay negocios cerca a 8km');
      }
}

function geoError(error){
  $.mobile.loading("hide");
  navigator.notification.alert("Presione el botón de Localización nuevamente");
  //navigator.notification.alert("code: "+ error.code+ ", message: "+error.message);
};
function calcDistance(lat, lng, pos2) {
    var pos1 = new LatLon(lat, lng);
    return pos1.distanceTo(pos2);
};

/*------ WAZE/MAPS LINKS --------*/

function navigate(){
  /*
  if (!storage.PosLat || !storage.PosLng){
    navigator.notification.alert('No sabemos donde te encuentras. Por favor activa tu GPS para comenzar tu viaje.');
    return;
  }*/
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
  linkGoogleNav = "http://maps.google.com/maps?daddr="+lat+","+lng+"&amp;ll=";
  //linkWazeNav = 'https://www.waze.com/ul?ll='+lat+'%2C'+lng+'&navigate=yes&zoom=17';
  window.open(linkGoogleNav,'_system');
}

function navigateFromHistory(){
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
  linkGoogleNav = "http://maps.google.com/maps?daddr="+lat+","+lng+"&amp;ll=";
  //linkNav = 'https://www.waze.com/ul?ll='+lat+'%2C'+lng+'&navigate=yes&zoom=17';  
  window.open(linkGoogleNav,'_system');
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
  sideMenu = false;
  $("#mapMenu").hide();
}
function showInfo(id){
  $.ajax({
    url:base_api_url+'commerces/info/'+id,
    dataType:"json",
    success:function(comm){
      commerce = comm;
      commerce_img = comm.images;
      $('.commName').html(comm.name);
      $('.commDireccion').html(comm.address);
      $('.commSchedule').html('<strong>Horario de Atención:</strong> '+comm.hourStart+" - "+comm.hourEnd);
      $('.commCategoryImg').attr('src',ctg_icon_url+comm.category_image)
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
  $("#owl-carousel-global").html('<div id="owl-carousel-banner" class="owl-carousel" style="height:100%; background-color: black;"></div>');
  var carousel = $("#owl-carousel-banner");
  carousel.html('');
  commerce_img.forEach(function(imgData){
    carousel.append("<div class='item'><div class='fondo_banner banner-item' style='background: url("+commerce_images+imgData.url+");'></div></div>");
  });
  $("#owl-carousel-banner").owlCarousel({
    navigation : false,
    pagination: false,
    singleItem : true,
    transitionStyle : "fade",
    autoPlay: 5e3,
  });
  $('.comm_name').html(commerce['name']);
  $('.comm_descr').html(commerce['description']);
  $('.comm_start').html(commerce['hourStart']);
  $('.comm_end').html(commerce['hourEnd']);
  $('.comm_days').html(commerce['daysWord']);
  $('.comm_address').html(commerce['address']);
  //$('.moreInfo').show();
  viewMoreInfo();
}
function showSideMenu(){
  sideMenu = true;
  $("#mapMenu").show();
}

function addSearchCounter(id){
  $.ajax({
    url:base_api_url+'commerces/search/count',
    type:'post',
    dataType:'json',
    data:{
      'commId':id
    },
    success:function(response){
      console.log(response.message);
    },
    error: function(error) {
      console.log('Error - counter: No se pudo comunicar con el servidor de Findy');
      //navigator.notification.alert('Error: No se pudo contactar con la API... Url:'+base_api_url+'customer/validateUser');
    }
  });
}

function copyLink(){
  //console.log('copying link!');
  var copyText = $(this);

  copyText.select();

  document.execCommand("copy");

  navigator.notification.alert("Se ha copiado al portapapeles");
}



