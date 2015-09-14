function geowiki(map, param) {
  this.map = map;
  this.param = param;

  this.editor_div = document.getElementById('property-editor');
  this.editor_div.style.display = 'none';

  ajax('load', this.param, null, this.load_data.bind(this));
}

geowiki.prototype.load_data = function(data) {
  this.drawItems = new L.GeoJSON(data, {
    onEachFeature: function(feature, layer) {
      layer.on('click', function(layer) {
        this.show_property_form(layer);
      }.bind(this, layer));
    }.bind(this),
    style: function(feature) {
      return this.apply_properties(feature.properties);
    }.bind(this)
  });
  map.addLayer(this.drawItems);

  this.drawControl = new L.Control.Draw({
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
      featureGroup: this.drawItems
    }
  });
  this.map.addControl(this.drawControl);

  this.map.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;

    layer.feature = {};

    if(type === 'marker') {
      layer.bindPopup('A popup!');
    }

    this.drawItems.addLayer(layer);

    layer.on('click', function(layer) {
      this.show_property_form(layer);
    }.bind(this, layer));

    this.show_property_form(layer);
  }.bind(this));

  if(data !== null)
    this.map.fitBounds(this.drawItems.getBounds());
}

geowiki.prototype.show_property_form = function(layer) {
  this.property_form = new form('data', {
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
    this.property_form.set_data(layer.feature.properties);
  else {
    this.property_form.set_data({
      'title': '',
      'stroke': '#b00b00',
      'stroke-width': 3,
      'stroke-opacity': 1.0
    });
  }

  this.editor_div.innerHTML = '';
  this.property_form.show(this.editor_div);

  var submit = document.createElement('input');
  submit.type = 'button';
  submit.value = 'Save';
  submit.onclick = function(layer, data) {
    var data = this.property_form.get_data();
    layer.feature.properties = data;

    layer.setStyle(this.apply_properties(data));
    layer.editing.disable();

    this.save();

    this.editor_div.style.display = 'none';
  }.bind(this, layer);
  this.editor_div.appendChild(submit);

  var submit = document.createElement('input');
  submit.type = 'button';
  submit.value = 'Close';
  submit.onclick = function(layer, data) {
    layer.editing.disable();

    this.editor_div.style.display = 'none';
  }.bind(this, layer);
  this.editor_div.appendChild(submit);

  layer.editing.enable();

  this.editor_div.style.display = 'block';
}

geowiki.prototype.apply_properties = function(data) {
  if(!data)
    return {};

  return {
    'color': data['stroke'],
    'weight': data['stroke-width'],
    'opacity': data['stroke-opacity']
  };
}

geowiki.prototype.get_geojson_data = function() {
  var features = [];
  var items = this.drawItems.getLayers();

  for(var i = 0; i < items.length; i++) {
    var d = items[i].toGeoJSON();
    d.type = 'Feature';

    features.push(d);
  }

  return {
    'type': 'FeatureCollection',
    'features': features
  };
}

geowiki.prototype.download = function() {
  alert(JSON.stringify(this.get_geojson_data(), null, '    '));
}

geowiki.prototype.save = function() {
  ajax('save', page_param, json_readable_encode(this.get_geojson_data()), function() {
    // saved.
  });
}
