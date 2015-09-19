<?php include "conf.php"; /* load a local configuration */ ?>
<?php include "modulekit/loader.php"; /* loads all php-includes */ ?>
<?php
$content = ajax_load($_REQUEST);

if(!$content) {
  print "An error occured downloading map";
  exit(1);
}

Header("Content-Type: application/json");
Header("Content-Disposition: attachment; filename=" . urlencode($_REQUEST['id']) . ".json");
print json_readable_encode($content);
