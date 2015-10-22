<?php
class Page_edit extends Page {
  function content() {
    global $data_path;

    add_html_header(<<<EOT
	<link rel="stylesheet" href="lib/leaflet/leaflet.css" />
	<link rel="stylesheet" href="lib/leaflet.draw/leaflet.draw.css" />
	
	<!--[if lte IE 8]>
		<link rel="stylesheet" href="lib/leaflet/leaflet.ie.css" />
		<link rel="stylesheet" href="leaflet.draw.ie.css" />
	<![endif]-->
	
	<script src="lib/leaflet/leaflet.js"></script>
	<script src="lib/leaflet.draw/leaflet.draw-src.js"></script>
	<script src="lib/leaflet.polylineDecorator/leaflet.polylineDecorator.js"></script>
EOT
    );

    $ret  = '<div id="header">';
    $ret .= "<a href='.'><img id='logo' src='images/logo.svg' alt='Geowiki'></a>";
    $name = $this->param['id'];

    if(check_param($this->param)) {
      $c = file_get_contents("{$data_path}/{$this->param['id']}/map.json");
      if($c) {
        $c = json_decode($c, true);
        if(is_array($c) && array_key_exists('title', $c)) {
          $name = $c['title'];
        }
      }
    }

    $ret .= "<span id='title'>{$name}</span>\n";
    $ret .= "</div>\n";
    $ret .= "<div id='map'></div>\n";
    $ret .= "<div id='editor-wrapper'><div>\n";
    $ret .= "  <form id='editor'></form>\n";
    $ret .= "</div></div>\n";
    $ret .= "<div id='menu' class='leaflet-control leaflet-bar'>\n";
    $ret .= "  <a id='menu_download'><img class='custom-icon' src='images/data-transfer-download.svg' alt='Download' title='Download' /></a>\n";
    $ret .= "</div>\n";

    return $ret;
  }
}


