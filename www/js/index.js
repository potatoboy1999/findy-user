//var base_api_url='http://localhost/findy/public/api/';
var base_api_url='http://findy.pe/public/api/';
var commerce = null;

window.onload= function () {
  	//$("#getLocation").on("click",getCurrentLocation);
    getCurrentLocation();
    initMap();
    loadCommerceLocation();
    $('#btn_nav').on('click',navigate);
    $('#btnLogIn').on("click",validateLogIn);
    $('#btnRegister').on("click",requestRegister);
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
      navigator.notification.alert(response.message);
      window.location.href = "#logIn";
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
  console.log(email+','+password);
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

function getCurrentLocation(){
  //alert('Get GPS Start');
  navigator.geolocation.getCurrentPosition(onSuccess, onError, {maximunAge:300000, timeout:30000, enableHighAccuracy:true});
};

function onSuccess(position){
  //alert('Retrieve current location');
  var lng = position.coords.longitude;
  var lat = position.coords.latitude;
  var timestamp = position.timestamp;

  //alert("longitude: "+lng+", Latitude: "+lat+", Timestamp: "+timestamp);
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
  //map.panTo({lat:lat, lng:lng});
};
function onError(error){
  navigator.notification.alert("code: "+ error.code+ ", message: "+error.message);
};
function hideInfo(){
  $('.info').hide();
}
function showInfo(id){
  $.ajax({
    url:base_api_url+'commerces/info/'+id,
    dataType:"json",
    success:function(comm){
      commerce = comm;
      $('.commName').html(comm.name);
      $('.commDireccion').html(comm.address);
      $('#commCategoryImg').attr('src','http://findy.pe/public/img/categoria/'+comm.category_image)
      $('.linkNavigation').attr('lat',comm.lat);
      $('.linkNavigation').attr('lng',comm.lng);
      $('.info').show();
      //$('.commSchedule').html(comm.name);
    },
    error:function(error){
      navigator.notification.alert('Error, no se pudo obtener la información');
    }
  });
}
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