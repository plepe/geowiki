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
	
	<script src="lib/leaflet/leaflet-src.js"></script>
	<script src="lib/leaflet.draw/leaflet.draw-src.js"></script>

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
</head>
<body>
Available maps:<ul>
<?php
$d = opendir($data_path);
while($r = readdir($d)) {
  if(substr($r, 0, 1) != ".") {
    $r = pathinfo($r);
    print "<li><a href='edit.php?id={$r['filename']}'>{$r['filename']}</a></li>\n";
  }
}
closedir($d);
?>
</ul>
Create new:<ul>
<li><a href='edit.php?id=<?php print md5(uniqid()); ?>'>empty map</a></li>
</ul>
</body>
</html>
