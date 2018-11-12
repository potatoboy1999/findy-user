var base_api_url='http://localhost/findy/public/api/';
window.onload= function () {
  	$("#getLocation").on("click",getCurrentLocation);
    initMap();
    loadCommerceLocation();
};

function getCurrentLocation(){
  alert('Get GPS Start');
  navigator.geolocation.getCurrentPosition(onSuccess, onError, {maximunAge:300000, timeout:30000, enableHighAccuracy:true});
};

function onSuccess(position){
  //alert('Retrieve current location');
  var lng = position.coords.longitude;
  var lat = position.coords.longitude;
  var timestamp = position.timestamp;

  //alert("longitude: "+lng+", Latitude: "+lat+", Timestamp: "+timestamp);
  map.setCenter({lat:lat, lng:lng});
};
function onError(error){
  alert("code: "+ error.code+ ", message: "+error.message);
};