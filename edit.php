<?php include "conf.php"; /* load a local configuration */ ?>
<?php include "modulekit/loader.php"; /* loads all php-includes */ ?>
<?php call_hooks('init'); ?>
<?php session_start(); ?>
<?php $auth = new Auth(); ?>
<?php
if((isset($auth_config['require-group'])) && (!$auth->access($auth_config['require-group']))) {
  page_reload("auth.php");
  print "Access denied";
  exit(0);
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Geo-Wiki</title>
    <?php print modulekit_to_javascript(); /* pass modulekit configuration to JavaScript */ ?>
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
    <?php print_add_html_headers(); /* print additional html headers */ ?>

	<link rel="stylesheet" href="lib/leaflet/leaflet.css" />
	<link rel="stylesheet" href="lib/leaflet.draw/leaflet.draw.css" />
	
	<!--[if lte IE 8]>
		<link rel="stylesheet" href="lib/leaflet/leaflet.ie.css" />
		<link rel="stylesheet" href="leaflet.draw.ie.css" />
	<![endif]-->
	
	<script src="lib/leaflet/leaflet.js"></script>
	<script src="lib/leaflet.draw/leaflet.draw.js"></script>

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

</head>
<body>
<?php
$auth_display = new AuthDisplay($auth);
print $auth_display->show();
?>
        <div id="header">
          <a href='.'><img id='logo' src='images/logo.svg' alt='Geowiki'></a>
<?php
$name = $_REQUEST['id'];

if(check_param($_REQUEST)) {
  $c = file_get_contents("{$data_path}/{$_REQUEST['id']}/map.json");
  if($c) {
    $c = json_decode($c, true);
    if(is_array($c) && array_key_exists('title', $c)) {
      $name = $c['title'];
    }
  }
}
?>
          <span id="title"><?php print $name; ?></span>
        </div>
	<div id="map"></div>
        <div id="property-editor"></div>
        <div id="menu" class='leaflet-control leaflet-bar'>
          <a id="menu_download"><img class='custom-icon' src='images/data-transfer-download.svg' alt='Download' title='Download' /></a>
        </div>
</body>
</html>
