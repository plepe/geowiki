function geowiki(map, param) {
  this.map = map;
  this.param = param;

  this.editor_div = document.getElementById('property-editor');
  this.editor_div.style.display = 'none';

  ajax('load', this.param, null, this.load_data.bind(this));
}

geowiki.prototype.default_properties = {
  'polyline': {
    'stroke': '#ff0000',
    'stroke-width': 2,
    'stroke-opacity': 0.8
  },
  'polygon': {
    'stroke': '#ff0000',
    'stroke-width': 2,
    'stroke-opacity': 0.8,
    'fill': '#7f0000',
    'fill-opacity': 0.2
  },
  'marker': {
  }
};

geowiki.prototype.property_form_def = function(layer) {
  var ret = {
    'title': {
      'name': 'Title',
      'type': 'text'
    },
  };

  if(layer instanceof L.Polygon) {
    ret['fill'] = {
      'name': 'Fill Color',
      'type': 'color'
    };
    ret['fill-opacity'] = {
      'name': 'Fill Opacity',
      'type': 'float'
    };
  }

  if(layer instanceof L.Polyline) {
    ret['stroke'] = {
      'name': 'Stroke Color',
      'type': 'color'
    };
    ret['stroke-width'] = {
      'name': 'Stroke Width',
      'type': 'float'
    };
    ret['stroke-opacity'] = {
      'name': 'Stroke Opacity',
      'type': 'float'
    };
  }

  if(layer instanceof L.Marker) {
  }

  return ret;

};

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
        shapeOptions: this.apply_properties(this.default_properties.polygon),
	showArea: true
      },
      polyline: {
        metric: false,
        shapeOptions: this.apply_properties(this.default_properties.polyline)
      },
      circle: {
        shapeOptions: this.apply_properties(this.default_properties.polygon)
      },
      rectangle: {
        shapeOptions: this.apply_properties(this.default_properties.polygon)
      },
      marker: {
        shapeOptions: this.apply_properties(this.default_properties.marker)
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
  this.property_form = new form('data', this.property_form_def(layer));

  if(layer.feature.properties)
    this.property_form.set_data(layer.feature.properties);
  else {
    this.property_form.set_data(this.default_properties.polyline);
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

  var ret = {};
  if('stroke' in data)
    ret.color = data['stroke'];
  if('stroke-width' in data)
    ret.weight = data['stroke-width'];
  if('stroke-opacity' in data)
    ret.opacity= data['stroke-opacity'];
  if('fill' in data)
    ret.fillColor = data['fill'];
  if('fill-opacity' in data)
    ret.fillOpacity = data['fill-opacity'];

  return ret;
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
