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

function LatLon(lat, lon) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLon)) return new LatLon(lat, lon);

    this.lat = Number(lat);
    this.lon = Number(lon);
}
LatLon.prototype.distanceTo = function(point, radius) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    // a = sin²(Δφ/2) + cos(φ1)⋅cos(φ2)⋅sin²(Δλ/2)
    // tanδ = √(a) / √(1−a)
    // see mathforum.org/library/drmath/view/51879.html for derivation

    var R = radius;
    var φ1 = this.lat.toRadians(),  λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();
    var Δφ = φ2 - φ1;
    var Δλ = λ2 - λ1;

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2)
          + Math.cos(φ1) * Math.cos(φ2)
          * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
};

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
					
					id = marker.getTitle();
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

function selectByRange(arrayCommerces,Poslat,Poslng) {
	
}

function setMapOnAll(map) {
	for (var i = 0; i < arrayMarkers.length; i++) {
		arrayMarkers[i].setMap(map);
	}
}
function deleteMarkers() {
	setMapOnAll(null);
	arrayMarkers = [];
}