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
    'marker-symbol': 'marker',
    'marker-size': 'medium',
    'marker-color': '#444444'
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

  var maki_icons_values = {};
  for(var i = 0; i < maki_icons.length; i++) {
    maki_icons_values[maki_icons[i].icon] = {
      name: maki_icons[i].name,
      desc: "<img src='icons/" + maki_icons[i].icon + "-12.svg'>" +
            "<img src='icons/" + maki_icons[i].icon + "-18.svg'>" +
            "<img src='icons/" + maki_icons[i].icon + "-24.svg'>"
    };
  }

  if(layer instanceof L.Marker) {
    ret['marker-symbol'] = {
      'name': 'Marker Icon',
      'type': 'select',
      'values': maki_icons_values,
      'desc': "<a href='https://www.mapbox.com/maki/'>List of Maki icons</a>."
    };
    ret['marker-size'] = {
      'name': 'Marker size',
      'type': 'radio',
      'values': { 'small': 'small', 'medium': 'medium', 'large': 'large' },
      'default': 'medium'
    };
    ret['marker-color'] = {
      'name': 'Marker Color',
      'type': 'color',
      'default': '#444444'
    };
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
    }.bind(this),
    pointToLayer: function(feature, latlng) {
      return new L.Marker(latlng, this.apply_properties(feature.properties));
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
      circle: false,
      rectangle: {
        shapeOptions: this.apply_properties(this.default_properties.polygon)
      },
      marker: {
        shapeOptions: this.apply_properties(this.default_properties.marker),
        icon: this.apply_properties(this.default_properties.marker).icon
      }
    },
    edit: {
      featureGroup: this.drawItems,
      edit: false,
      remove: false
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

  this.update_map_properties();
}

geowiki.prototype.update_map_properties = function() {
  var title = document.getElementById('title');
  var a = document.createElement('a');
  a.href = '#';
  a.onclick = this.edit_map_properties.bind(this);
  a.innerHTML = "<img src='images/edit.png'>";

  title.appendChild(a);

  var a = document.getElementById('menu_download');
  a.href = 'download.php?id=' + this.param.id;
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
          if(current_features[j].feature.id == feature.id)
            this.drawItems.removeLayer(current_features[j]);
        }

        // add new/modified items
        if(feature.geometry)
          this.drawItems.addData(feature);
      }
    }

  }.bind(this));
}

/**
 * bind a popup on the current layer from current data
 * @param item layer A Leaflet Layer (e.g. Marker, Polygon, ...)
 * @param object data Override properties of the current object (by default
 *   the properties of the current object are used)
 * @return null
 */
geowiki.prototype.create_popup = function(layer, data) {
  var div = document.createElement('div');

  if(!data) {
    if(layer.feature && layer.feature.properties)
      data = layer.feature.properties;
  }

  if(data) {
    if(data.title) {
      var wrap = document.createElement('div');
      wrap.className = 'title';
      div.appendChild(wrap);

      wrap.innerHTML = htmlspecialchars(data.title);
    }

    if(data.description) {
      var wrap = document.createElement('div');
      wrap.className = 'description';
      div.appendChild(wrap);

      wrap.innerHTML = htmlspecialchars(data.description);
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
    'description': {
      'type': 'textarea',
      'name': 'Description'
    },
  };

  this.map_properties_form = new form('map_properties', form_def);

  this.map_properties_form.set_data(this.properties);

  this.editor_div.innerHTML = '';
  this.editor_div.style.display = 'block';
  this.map_properties_form.show(this.editor_div);

  var submit = document.createElement('input');
  submit.type = 'button';
  submit.value = 'Save';
  submit.onclick = function() {
    this.properties = this.map_properties_form.get_data();

    this.save_map_properties(function(success) {
      if(success) {
        this.editor_div.style.display = 'none';
      }
    }.bind(this));
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

  this.property_form.onchange = function() {
    var data = this.property_form.get_data();
    console.log(data);

    var style = this.apply_properties(data)
    if(layer.setStyle)
      layer.setStyle(style);
    if(style.icon)
      layer.setIcon(style.icon);

    var pos = layer._popup._latlng;
    this.create_popup(layer, data);
    layer.openPopup(pos);
  }.bind(this);

  var submit = document.createElement('input');
  submit.type = 'button';
  submit.value = 'Save';
  submit.onclick = function(layer, data) {
    if(!this.property_form.is_complete()) {
      this.property_form.show_errors();
      return;
    }

    var data = this.property_form.get_data();
    layer.feature.properties = data;

    var style = this.apply_properties(data)
    if(layer.setStyle)
      layer.setStyle(style);
    if(style.icon)
      layer.setIcon(style.icon);

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
  submit.value = 'Cancel';
  submit.onclick = function(layer, data) {
    layer.editing.disable();

    if(!layer.feature.properties) {
      this.drawItems.removeLayer(layer);
    }
    else {
      var data = this.property_form.get_orig_data();
      layer.feature.properties = data;

      var style = this.apply_properties(data)
      if(layer.setStyle)
        layer.setStyle(style);
      if(style.icon)
        layer.setIcon(style.icon);
    }

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
  if('marker-symbol' in data) {
    var size = { 'small': '12', 'medium': '18', 'large': '24' }[data['marker-size'] || 'medium'];
    ret.icon = L.icon({
      iconUrl: 'marker.php?' +
        'marker-symbol=' + encodeURIComponent(data['marker-symbol']) +
        '&marker-size=' + encodeURIComponent(data['marker-size']) +
        '&marker-color=' + encodeURIComponent(data['marker-color']),
      iconSize: [ size, size ]
    });
  }

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

geowiki.prototype.save_map_properties = function(callback) {
  ajax('save_map_properties', page_param, json_readable_encode(this.properties), function(callback, result) {
    if(!result) {
      alert("An unknown error occured when saving data!");
      callback(false);
      return;
    }

    if(result.saved === true) {
      if(result.id) {
        this.param.id = result.id;
        history.replaceState(this.param, null, "edit.php?id=" + encodeURIComponent(this.param.id));
      }

      if(result.rev)
        this.param.rev = result.rev;
    }

    if(result.error) {
      alert("An error occured when saving: " +  result.error);
    }

    callback(result.saved);
    // saved.
  }.bind(this, callback));
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
