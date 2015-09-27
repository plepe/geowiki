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
	
	<script src="lib/leaflet/leaflet-src.js"></script>
	<script src="lib/leaflet.draw/leaflet.draw-src.js"></script>

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
</head>
<body>
<?php
$auth_display = new AuthDisplay($auth);
print $auth_display->show();

$page = get_page($_REQUEST);
if($page) {
  $ret = $page->content($_REQUEST);
  print $ret;
}
?>
</body>
</html>
