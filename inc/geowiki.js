function geowiki(map, param) {
  this.map = map;
  this.param = param;
  this.properties = null;

  this.editor_div = document.getElementById('property-editor');
  this.editor_div.style.display = 'none';

  ajax('load', this.param, null, this.load_data.bind(this));

  window.setInterval(this.load_changes.bind(this), 10000);
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
    'description': {
      'name': 'Description',
      'type': 'textarea'
    }
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
  this.param.rev = data.rev;
  this.properties = data.properties;
  if(!this.properties)
    this.properties = { title: this.param.id };

  this.drawItems = new L.GeoJSON(data, {
    onEachFeature: function(feature, layer) {
      this.create_popup(layer);
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

    this.create_popup(layer);

    this.drawItems.addLayer(layer);

    this.show_property_form(layer);
  }.bind(this));

  if(data !== null)
    this.map.fitBounds(this.drawItems.getBounds());

  var title = document.getElementById('title');
  var a = document.createElement('a');
  a.href = '#';
  a.onclick = this.edit_map_properties.bind(this);
  a.innerHTML = "<img src='images/edit.png'>";

  title.appendChild(a);
}

geowiki.prototype.load_changes = function() {
  ajax("load_changes", this.param, null, function(data) {
    this.param.rev = data.rev;

    if(data.properties) {
      this.properties = data.properties;
      // TODO: update properties (title, ...)
    }

    if(data.features && data.features.length) {
      var current_features = this.drawItems.getLayers();

      for(var i = 0; i < data.features.length; i++) {
        var feature = data.features[i];

        //check if feature is already loaded -> remove
        for(var j = 0; j < current_features.length; j++) {
          if(current_features[i].feature.id == feature.id)
            this.drawItems.removeLayer(current_features[i]);
        }

        // add new/modified items
        this.drawItems.addData(feature);
      }
    }

  }.bind(this));
}

geowiki.prototype.create_popup = function(layer) {
  var div = document.createElement('div');

  if(layer.feature && layer.feature.properties) {
    if(layer.feature.properties.title) {
      var wrap = document.createElement('div');
      wrap.className = 'title';
      div.appendChild(wrap);

      wrap.innerHTML = htmlspecialchars(layer.feature.properties.title);
    }

    if(layer.feature.properties.description) {
      var wrap = document.createElement('div');
      wrap.className = 'description';
      div.appendChild(wrap);

      wrap.innerHTML = htmlspecialchars(layer.feature.properties.description);
    }
  }

  var edit_link = document.createElement('a');
  edit_link.onclick = this.show_property_form.bind(this, layer);
  edit_link.appendChild(document.createTextNode('edit'));
  div.appendChild(edit_link);

  layer.bindPopup(div);
}

geowiki.prototype.edit_map_properties = function(layer) {
  var form_def = {
    'title': {
      'type': 'text',
      'name': 'Title'
    },
    'id': {
      'type': 'text',
      'name': 'ID',
      'check': [ 'not_regexp', /[\-\(\)\'"`\[\]\n\t!$%&\+\*,\.\/:;=<>\?\\\{\}\^\|\~]/, "Do not use special characters!" ]
    },
    'description': {
      'type': 'textarea',
      'name': 'Description'
    },
  };

  this.map_properties_form = new form('map_properties', form_def);

  if(!this.properties.id)
    this.properties.id = this.param.id;

  this.map_properties_form.set_data(this.properties);

  this.editor_div.innerHTML = '';
  this.editor_div.style.display = 'block';
  this.map_properties_form.show(this.editor_div);

  var submit = document.createElement('input');
  submit.type = 'button';
  submit.value = 'Save';
  submit.onclick = function() {
    this.properties = this.map_properties_form.get_data();

    this.save_map_properties();

    this.editor_div.style.display = 'none';
  }.bind(this);
  this.editor_div.appendChild(submit);

  this.map_properties_form.resize();
}

geowiki.prototype.show_property_form = function(layer) {
  this.property_form = new form('data', this.property_form_def(layer));

  if(layer.feature.properties)
    this.property_form.set_data(layer.feature.properties);
  else {
    this.property_form.set_data(
      layer instanceof L.Polygon ? this.default_properties.polygon :
      layer instanceof L.Polyline ? this.default_properties.polyline :
      this.default_properties.marker
    );
  }

  this.editor_div.innerHTML = '';
  this.editor_div.style.display = 'block';
  this.property_form.show(this.editor_div);

  var submit = document.createElement('input');
  submit.type = 'button';
  submit.value = 'Save';
  submit.onclick = function(layer, data) {
    var data = this.property_form.get_data();
    layer.feature.properties = data;

    if(layer.setStyle)
      layer.setStyle(this.apply_properties(data));
    layer.editing.disable();

    var pos = layer._popup._latlng;
    this.create_popup(layer);
    layer.openPopup(pos);

    this.save_feature(layer);

    this.editor_div.style.display = 'none';

    // TODO: update title
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

  var submit = document.createElement('input');
  submit.type = 'button';
  submit.value = 'Remove';
  submit.onclick = function(layer, data) {
    layer.editing.disable();
    this.drawItems.removeLayer(layer);
    this.save_remove_feature(layer);

    this.editor_div.style.display = 'none';
  }.bind(this, layer);
  this.editor_div.appendChild(submit);

  layer.editing.enable();

  this.property_form.resize();
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
    'properties': this.properties,
    'features': features
  };
}

geowiki.prototype.download = function() {
  alert(JSON.stringify(this.get_geojson_data(), null, '    '));
}

geowiki.prototype.save_all = function() {
  ajax('save_all', page_param, json_readable_encode(this.get_geojson_data()), function(result) {
    if(!result) {
      alert("An unknown error occured when saving data!");
    }

    if(result.saved === true) {
      if(result.rev)
        this.param.rev = result.rev;

      return;
    }

    if(result.error) {
      alert("An error occured when saving: " +  result.error);
    }

    // saved.
  }.bind(this));
}

geowiki.prototype.save_map_properties = function() {
  ajax('save_map_properties', page_param, json_readable_encode(this.properties), function(result) {
    if(!result) {
      alert("An unknown error occured when saving data!");
    }

    if(result.saved === true) {
      if(result.id) {
        this.param.id = result.id;
        history.replaceState(this.param, null, "edit.php?id=" + encodeURIComponent(this.param.id));
      }

      if(result.rev)
        this.param.rev = result.rev;

      return;
    }

    if(result.error) {
      alert("An error occured when saving: " +  result.error);
    }

    // saved.
  }.bind(this));
}

geowiki.prototype.save_feature = function(layer) {
  var d = layer.toGeoJSON();
  d.type = 'Feature';

  ajax('save_feature', page_param, json_readable_encode(d), function(layer, result) {
    if(!result) {
      alert("An unknown error occured when saving data!");
    }

    if(result.feature_id)
      layer.feature.id = result.feature_id;

    if(result.saved === true) {
      if(result.rev)
        this.param.rev = result.rev;

      return;
    }

    if(result.error) {
      alert("An error occured when saving: " +  result.error);
    }

    // saved.
  }.bind(this, layer));
}

geowiki.prototype.save_remove_feature = function(layer) {
  ajax('save_remove_feature', page_param, layer.feature.id, function(result) {
    if(!result) {
      alert("An unknown error occured when saving data!");
    }

    if(result.saved === true) {
      if(result.rev)
        this.param.rev = result.rev;

      return;
    }

    if(result.error) {
      alert("An error occured when saving: " +  result.error);
    }

    // saved.
  }.bind(this));
}
