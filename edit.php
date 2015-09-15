<?php include "conf.php"; /* load a local configuration */ ?>
<?php include "modulekit/loader.php"; /* loads all php-includes */ ?>
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
</head>
<body>
        <div id="header">
          <div id="title"><?php print $_REQUEST['id']; ?></div>
        </div>
	<div id="map"></div>
        <div id="property-editor"></div>
        <div id="menu" class='leaflet-control'><a download='data.json' href='javascript:download()'>Download</a></div>
</body>
</html>
