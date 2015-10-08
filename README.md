# geowiki
Collaborative editing of public and private personalized maps.

Installation
============
Run the following commands:
```sh
git clone https://github.com/plepe/geowiki.git
cd geowiki
git submodule init
git submodule update
```

Download leaflet from http://leafletjs.com/download.html and extract to lib/leaflet, so that lib/leaflet/leaflet.js exists.

Download leaflet.draw from https://github.com/Leaflet/Leaflet.draw/releases and extract to lib/leaflet.draw, so that lib/leaflet.draw/leaflet.draw.js exists.

Download leaflet.PolylineDecorator from https://github.com/bbecquet/Leaflet.PolylineDecorator/releases and extract to lib/leaflet.polylineDecorator, so that lib/leaflet.polylineDecorator/leaflet.polylineDecorator.js exists.

Copy `conf.php-dist` to `conf.php` and adapt to your needs.

Make sure that your `$data_path` is writable by the webserver, but not accessible from a browser.
