<?php include "conf.php"; /* load a local configuration */ ?>
<?php include "modulekit/loader.php"; /* loads all php-includes */ ?>
<?php call_hooks('init'); ?>
<?php
$marker_size = array(
  'small' => 12,
  'medium' => 18,
  'large' => 24,
);
if((!$_REQUEST['marker-size']) || ($_REQUEST['marker-size'] == 'undefined'))
  $_REQUEST['marker-size'] = 'medium';
elseif(!array_key_exists($_REQUEST['marker-size'], $marker_size)) {
  print "Invalid request";
  exit(1);
}

if((!$_REQUEST['marker-symbol']) || ($_REQUEST['marker-symbol'] == 'undefined'))
  $_REQUEST['marker-symbol'] = 'marker';
elseif(!preg_match('/^[a-z0-9\-]+$/', $_REQUEST['marker-symbol'])) {
  print "Invalid request";
  exit(1);
}

if((!$_REQUEST['marker-color']) || ($_REQUEST['marker-color'] == 'undefined'))
  $_REQUEST['marker-color'] = '#444444';
elseif(!preg_match('/^#[a-fA-F0-9]{3,6}$/', $_REQUEST['marker-color'])) {
  print "Invalid request";
  exit(1);
}

$marker_size = $marker_size[$_REQUEST['marker-size']];

$content = file_get_contents("icons/{$_REQUEST['marker-symbol']}-{$marker_size}.svg", "r");
$content = strtr($content, array("#444444" => $_REQUEST['marker-color']));

Header("Content-Type: image/svg+xml");
print $content;
