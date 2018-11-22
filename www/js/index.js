var base_api_url='http://localhost/findy/public/api/';
window.onload= function () {
  	//$("#getLocation").on("click",getCurrentLocation);
    getCurrentLocation();
    initMap();
    loadCommerceLocation();
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
  map.setCenter({lat:lat, lng:lng});
};
function onError(error){
  alert("code: "+ error.code+ ", message: "+error.message);
};