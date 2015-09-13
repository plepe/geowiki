var editor_div;
var property_form;
var drawnItems;

function show_property_form(layer) {
  property_form = new form('data', {
    'title': {
      'name': 'Title',
      'type': 'text'
    },
    'stroke': {
      'name': 'Stroke Color',
      'type': 'color'
    },
    'stroke-width': {
      'name': 'Stroke Width',
      'type': 'float'
    },
    'stroke-opacity': {
      'name': 'Stroke Opacity',
      'type': 'float'
    },
  });

  if(layer.feature.properties)
    property_form.set_data(layer.feature.properties);
  else {
    property_form.set_data({
      'title': '',
      'stroke': '#b00b00',
      'stroke-width': 3,
      'stroke-opacity': 1.0
    });
  }

  editor_div.innerHTML = '';
  property_form.show(editor_div);

  var submit = document.createElement('input');
  submit.type = 'button';
  submit.value = 'Save';
  submit.onclick = function(layer, data) {
    var data = property_form.get_data();
    layer.feature.properties = data;

    layer.setStyle({
      'color': data['stroke'],
      'weight': data['stroke-width'],
      'opacity': data['stroke-opacity']
    });
  }.bind(this, layer);
  editor_div.appendChild(submit);

  var submit = document.createElement('input');
  submit.type = 'button';
  submit.value = 'Close';
  submit.onclick = function(layer, data) {
    editor_div.style.display = 'none';
  }.bind(this, layer);
  editor_div.appendChild(submit);

  editor_div.style.display = 'block';
}

function download() {
  alert(JSON.stringify(drawnItems.toGeoJSON(), null, '    '));
}

window.onload = function() {
  editor_div = document.getElementById('property-editor');
  editor_div.style.display = 'none';

  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib}),
    map = new L.Map('map', {layers: [osm], center: new L.LatLng(-37.7772, 175.2756), zoom: 15 });

  var data = {};
  drawnItems = new L.GeoJSON(data, {
    onEachFeature: function(feature, layer) {
      layer.on('click', function(layer) {
        show_property_form(layer);
      }.bind(this, layer));
    }
  });
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

    layer.feature = {};

    if(type === 'marker') {
      layer.bindPopup('A popup!');
    }

    drawnItems.addLayer(layer);

    layer.on('click', function(layer) {
      show_property_form(layer);
    }.bind(this, layer));

    show_property_form(layer);
  });

  var top_left = document.getElementsByClassName('leaflet-top leaflet-left');
  if(top_left.length)
    top_left[0].appendChild(document.getElementById('menu'));
}	
