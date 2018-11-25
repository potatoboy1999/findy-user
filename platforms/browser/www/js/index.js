var base_api_url='http://localhost/findy/public/api/';
var commerce = null;

window.onload= function () {
  	//$("#getLocation").on("click",getCurrentLocation);
    getCurrentLocation();
    initMap();
    loadCommerceLocation();
    $('#btn_nav').on('click',navigate);
};

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
  map.panTo({lat:lat, lng:lng});
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
  lat = $('.linkNavigation').attr('lat');
  lng = $('.linkNavigation').attr('lng');
  //linkNav = 'https://www.waze.com/ul?ll='+lat+'%2C'+lng+'&navigate=yes&zoom=17';
  //navigator.notification.alert(linkNav);
  launchnavigator.navigate([lat,lng],{start:"-21.9,-70.88888999"});
  //window.open(linkNav,'_system');
}