
//var marker_icon_url = 'http://localhost/findy/public/img/marker/';
//var marker_trans_icon_url = 'http://localhost/findy/public/img/marker_transparent/';
var marker_icon_url = 'https://admin.findy.pe/img/marker/';
var marker_trans_icon_url = 'https://admin.findy.pe/img/marker_transparent/';

'use strict';
if (typeof module!='undefined' && module.exports) var Dms = require('./dms'); // ≡ import Dms from 'dms.js'

var map = null;
var arrayMarkers = [];
//var base_api_url='http://localhost/findy/public/api/';
var base_api_url='http://admin.findy.pe/api/';

function initMap() {
	arrayMarkers = [];
	// Crear Estilo
	var style = [
					  {
					    "featureType": "poi",
					    "elementType": "labels.text",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  },
					  {
					    "featureType": "poi.attraction",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  },
					  {
					    "featureType": "poi.business",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  },
					  {
					    "featureType": "poi.government",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  },
					  {
					    "featureType": "poi.medical",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  },
					  {
					    "featureType": "poi.place_of_worship",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  },
					  {
					    "featureType": "poi.school",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  },
					  {
					    "featureType": "road",
					    "elementType": "labels.icon",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  },
					  {
					    "featureType": "transit",
					    "stylers": [
					      {
					        "visibility": "off"
					      }
					    ]
					  }
					];
  	// INICIALIZAR MAPA
  	var options = { 
		center: {lat: -12.066367, lng: -76.952500},
		zoom: 17,
		streetViewControl: false,
		rotateControl: false,
		fullscreenControl: false,
		zoomControl: false,
		mapTypeControl: false,
		styles: style
  	};
	map = new google.maps.Map(document.getElementById('map'), options);
}

function refreshAllCommerceLocation(){
	$.mobile.loading("show", {
		text: "espere...",
		textVisible: true,
		textonly:false
	});
	$.ajax({
		url:base_api_url+'commerces/locations',
		dataType:"json",
		success:function(response){
			$.mobile.loading("hide");
			console.log('all commerces:');
			console.log(response);
			commerceArray = response;
			getCurrentLocation();
		},
		error:function(error){
			$.mobile.loading("hide");
			navigator.notification.alert('Error: no hay conexión a internet');
		}
	});
}

function loadCommerceLocation(){
	//alert('Cargar los comercios en el mapa');
	$.ajax({
		url:base_api_url+'commerces/locations',
		dataType:"json",
		success:function(response){
			console.log('commerces');
			console.log(response);
			commerceArray = response;
			getCurrentLocation();

			console.log('commerceArray:');
			console.log(commerceArray);

			createMarkersCommerces(commerceArray);

			console.log('TODOS los comercios mostrados');
		},
		error:function(error){
			navigator.notification.alert('Error en la carga de comercios')
		}
	});
	//alert('Comercios cargados exitosamente');
}
function createMarkersCommerces(arrayCommerces){
	//delete previouse markers
	arrayMarkers = [];

	commerceArray.forEach(function(comm){
		var bStatus = comm.bussiness_status;
		var img = marker_icon_url+comm.category_img;
		if (bStatus == 0) {
			img = marker_trans_icon_url+comm.category_img;
		}
		var pos = {lat:parseFloat(comm.lat),lng:parseFloat(comm.lng)}
		//set marker icons
		var icon = {
                 url: img,
                 size: new google.maps.Size(40, 55),
                 origin: new google.maps.Point(0, 0),
                 anchor: new google.maps.Point(17, 50),
                 scaledSize: new google.maps.Size(40, 55),
                 labelOrigin: new google.maps.Point(20, 65)
               };
      //Create the Marker
      var marker = new google.maps.Marker({
                     map: map,
                     icon: icon,
                     title: comm.id.toString(),
                     position: pos,
                     label: comm.name,
                     labelOrigin: new google.maps.Point(20, 65),
                     labelClass: "labels"
                   });
      arrayMarkers.push(marker);
      map.addListener('click', function() {
			hideInfo();
			hideMoreInfo();
		});
      marker.addListener('click', function() {
			map.setZoom(18);
			map.panTo(marker.getPosition());
			var id = marker.getTitle();
			addSearchCounter(id);
			showInfo(id);
		});
	});
}

function setMapOnAll(map) {
	for (var i = 0; i < arrayMarkers.length; i++) {
		arrayMarkers[i].setMap(map);
	}
}
function hideMapOnArray(map, arrayComm) {
	for (var i = 0; i < arrayMarkers.length; i++) {
		arrayComm.forEach(function(comm){
			if (arrayMarkers[i].getTitle() == comm.id) {
				arrayMarkers[i].setMap(null);
			}
		});
	}
}
function deleteMarkers() {
	setMapOnAll(null);
	arrayMarkers = [];
}