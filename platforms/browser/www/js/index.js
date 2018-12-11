//var base_api_url='http://localhost/findy/public/api/';
var base_api_url='http://findy.pe/public/api/';
var storage = window.localStorage;
var lng = null;
var lat = null;
var commerceArray = null;
var commerce = null;
var user = null;

window.onload= function () {
    $('#btn_fb').on('click',getDataFB);
  	//$("#getLocation").on("click",getCurrentLocation);
    //botones listeners
    $('.btn_link_logIn').on('click',viewLogIn);
    $('.btn_link_register').on('click',viewRegister);
    $('.btn_nav').on('click',navigate);
    $('.btnMoreInfo').on('click',showMoreInfo);
    $('.btnLessInfo').on('click',function(){$('.moreInfo').hide();$('.info').show()})
    $('#btnLogIn').on("click",validateLogIn);
    $('#btnRegister').on("click",requestRegister);
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
    
    $('.question').on('click',toggleAnswer);
    $('#btn_close_session').on('click',closeSession);
    $('.save-profile').on('click',editProfile);
    $('.btn_send_comment').on('click',sendComment);

    //$(".findy-category").on('click',viewSubCategories);
    
    //load pages
    $("#mapPage").on("pageshow", loadMapPage);
};

//PREVENT MIN HEIGHT JQUERY MOBILE
$(document).on( "pagecontainershow", function ( e, data ) {
   var activePage = data.toPage;
   setTimeout(function () {
      //var currentHeight = activePage.css( "min-height" );
      activePage.css( "height", '100%' ); /* subtract 1px or set your custom height */
   }, 50); /* set delay here */
});
$(window).on( "throttledresize", function ( e ) {
   var activePage = $.mobile.pageContainer.pagecontainer( "getActivePage" );
   setTimeout(function () {
      //var currentHeight = activePage.css( "min-height" );
      activePage.css( "height", '100%' );
   }, 50);
});

/*------- LOAD PAGES --------*/

function loadMapPage(){
  if(!map){
    initMap();
    //getCurrentLocation();
    loadCommerceLocation(); 
    loadCategories();
  }
}

/*------- LOAD DATA FUNCTIONS ------------*/

function loadCategories(){
  $.ajax({
    url:base_api_url+'category/all',
    dataType:"json",
    success:function(response){
      console.log('categories');
      console.log(response);
      ctg = response;
      var ctgDiv = $("#categories");
      ctgDiv.html('');
      ctg.forEach(function(ctg){
        ctgDiv.append("<div class='findy-category' ctg-id='"+ctg['id']+"' style='float: left;'><div class='ctg-absolute'><img width='50' height='50' src='http://findy.pe/public/img/categoria/"+ctg.image+"'><p class='ctg-name'>"+ctg['name']+"</p></div></div>");
      });
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
    listDiv.append("<div class='subCtg' subCtg='"+subCtg['id']+"' style='border-bottom: 1px solid black;'><span class='right-arrow'>></span><p>"+subCtg['name']+"</p></div>");
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
                      url: "http://findy.pe/public/img/marker/"+comm.category_img,
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
            
             id = marker.getTitle();
             showInfo(id);
           });
      });
    },
    error:function(error){
      navigator.notification.alert('Error en la carga de coordenadas')
    }
  });
}

/*------- REDIRECT / SHOW FUNCTIONS ------------*/

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
  var id = $(this).attr('ctg-id');
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
        $('.user_name').html(response['user_name']);
        $('input[name="user_name"]').val(response['user_name']);
        $('input[name="email"]').val(response['email']);
        loadMapPage();

        window.location.href = "#mapPage";
      }else{
        navigator.notification.alert(response.message);
      }
    },
    error: function(error) {
      navigator.notification.alert('Error: No se pudo comunicar con el servidor de Findy');
      //navigator.notification.alert('Error: No se pudo contactar con la API... Url:'+base_api_url+'customer/validateUser');
    }
  });
}

function closeSession(){
  window.location.href = "#logIn";
}
function getDataFB(e){
  e.preventDefault();
  facebookConnectPlugin.login(["public_profile","email"],fbSuccess,fbError);
}
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
}
/*------- EDIT DATA ----------*/
function editProfile(){
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
          navigator.notification.alert('Se han guardado los cambios');
        },
        error: function(error) {
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

  //GET CURRENT POSITION 1 TIME
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {maximunAge:300000, timeout:30000, enableHighAccuracy:true});

  //GET POSITION LIVE
  //navigator.geolocation.watchPosition(onSuccess, onError, {maximunAge:300000, timeout:30000, enableHighAccuracy:true});
};

function geoSuccess(position){
  //alert('Retrieve current location');
  lng = position.coords.longitude;
  lat = position.coords.latitude;

  posLatLng = new LatLon(lat,lng);

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

  commerceArray.forEach(function(commerce){
    commLat = commerce.lat;
    commLng = commerce.lng;
    alert('Distancia a '+commerce.name+': '+calcDistance(commLat, commLng, posLatLng))+' metros';
  });
};

function geoError(error){
  navigator.notification.alert("code: "+ error.code+ ", message: "+error.message);
};
function calcDistance(lat, lng, pos2) {
    var pos1 = new LatLon(lat, lng);
    return pos1.distanceTo(pos2);
};
/*------ WAZE/MAPS LINKS --------*/

function navigate(){
  //navigator.notification.alert("Start Call to navigator");
  lat = $('.linkNavigation').attr('lat');
  lng = $('.linkNavigation').attr('lng');

  lat = parseFloat(lat);
  lng = parseFloat(lng);
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

function onSuccessNav(){
    navigator.notification.alert("Navigator Correctamente Iniciado");
}

function onErrorNav(errMsg){
    navigator.notification.alert("Error en Navegador: "+errMsg);
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
      $('.commCategoryImg').attr('src','http://findy.pe/public/img/categoria/'+comm.category_image)
      $('.linkNavigation').attr('lat',comm.lat);
      $('.linkNavigation').attr('lng',comm.lng);
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



