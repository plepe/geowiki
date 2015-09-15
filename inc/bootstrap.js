var page_param;
var map;

window.onload = function() {
  page_param = page_resolve_url_params();

  var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});

  if(!document.getElementById('map'))
    return;

  map = new L.Map('map', {layers: [osm], center: new L.LatLng(0, 0), zoom: 2 });

  new geowiki(map, page_param);
  //load_data(null);

  var top_left = document.getElementsByClassName('leaflet-top leaflet-left');
  if(top_left.length)
    top_left[0].appendChild(document.getElementById('menu'));
}
