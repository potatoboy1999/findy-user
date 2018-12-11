'use strict';
if (typeof module!='undefined' && module.exports) var Dms = require('./dms'); // ≡ import Dms from 'dms.js'

var map = null;
var arrayMarkers = [];
//var base_api_url='http://localhost/findy/public/api/';
var base_api_url='http://findy.pe/public/api/';

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
			commerceArray.forEach(function(comm){
				//alert('Comercio: '+comm.name+', lat:'+comm.lat+', lng:'+comm.lng);
				
				var pos = {lat:parseFloat(comm.lat),lng:parseFloat(comm.lng)}
				//set marker icons
				//console.log('creando el icono');
				var icon = {
	                    url: "http://findy.pe/public/img/marker/"+comm.category_img,
	                    size: new google.maps.Size(40, 55),
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
	         map.addListener('click', function() {
					hideInfo();
					hideMoreInfo();
				});
	         marker.addListener('click', function() {
					map.setZoom(18);
					map.panTo(marker.getPosition());
					var id = marker.getTitle();
					showInfo(id);
				});
			});
		},
		error:function(error){
			navigator.notification.alert('Error en la carga de coordenadas')
		}
	});
	//alert('Comercios cargados exitosamente');
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