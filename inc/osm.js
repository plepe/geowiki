function GeoWikiOSM() {
  this.editor_wrapper_div = document.createElement('div');
  this.editor_wrapper_div.className = 'editor-wrapper';
  var div = document.createElement('div');
  this.editor_wrapper_div.appendChild(div);
  this.editor_div = document.createElement('form');
  div.appendChild(this.editor_div);
  document.body.appendChild(this.editor_wrapper_div);

  this.form = new form("osm_data", {
    'id': {
      'name': 'Node ID',
      'type': 'text'
    }
  });

  this.form.show(this.editor_div);

  var input = document.createElement('input');
  input.type = 'submit';
  input.value = 'Load';
  this.editor_div.appendChild(input);
  this.editor_div.onsubmit = function() {
    var data = this.form.get_data();

    document.body.removeChild(this.editor_wrapper_div);
    var query = "[out:json];node(" + data.id + ");out meta geom;";
    
    // http://overpass-api.de/api/interpreter

    return false;
  }.bind(this);
}

function GeoWikiOSM_open() {
  var geowiki_osm = new GeoWikiOSM();
  geowiki_osm.show();
}

register_hook('init', function() {
  var a = document.getElementById('menu_osm');
  a.href = 'javascript:GeoWikiOSM_open()';
});
