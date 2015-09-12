var editor_div;
var property_form;

function show_property_form(layer) {
  property_form = new form('data', {
    'title': {
      'name': 'Title',
      'type': 'text'
    }
  });

  if(layer.properties)
    property_form.set_data(layer.properties);
  else
    property_form.set_data({ 'title': null });

  editor_div.innerHTML = '';
  property_form.show(editor_div);

  var submit = document.createElement('input');
  submit.type = 'button';
  submit.value = 'Save';
  submit.onclick = function(layer, data) {
    layer.properties = property_form.get_data();
  }.bind(this, layer);

  editor_div.appendChild(submit);
}

window.onload = function() {
  editor_div = document.getElementById('property-editor');

  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib}),
    map = new L.Map('map', {layers: [osm], center: new L.LatLng(-37.7772, 175.2756), zoom: 15 });

  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  var drawControl = new L.Control.Draw({
    draw: {
      position: 'topleft',
      polygon: {
	title: 'Draw a sexy polygon!',
	allowIntersection: false,
	drawError: {
          color: '#b00b00',
          timeout: 1000
	},
	shapeOptions: {
          color: '#bada55'
	},
	showArea: true
      },
      polyline: {
        metric: false
      },
      circle: {
        shapeOptions: {
          color: '#662d91'
        }
      }
    },
    edit: {
      featureGroup: drawnItems
    }
  });
  map.addControl(drawControl);

  map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    if(type === 'marker') {
      layer.bindPopup('A popup!');
    }

    drawnItems.addLayer(layer);

    layer.on('click', function(layer) {
      show_property_form(layer);
    }.bind(this, layer));

    show_property_form(layer);
  });
}	
