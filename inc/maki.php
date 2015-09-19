<?php
$maki_icons_src = json_decode(file_get_contents('icons/maki.json'), true);
$maki_icons = array();
foreach($maki_icons_src as $el) {
  $maki_icons[$el['icon']] = $el['name'];
}
html_export_var(array('maki_icons' => $maki_icons));
