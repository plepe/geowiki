<?php
function check_param($param) {
  if(!isset($param['id']))
    return false;

  if($param['id'] == '')
    return false;

  if(preg_match("/[\-\(\)'\"`\[\]\n\t!$%&\+\*,\.\/:;=<>\?\\\{\}\^\|\~]/", $param['id']))
    return false;

  return true;
}

function ajax_load($param) {
  global $data_path;

  if(!check_param($param))
    return null;

  $path = "{$data_path}/{$param['id']}";

  $map_properties = json_decode(file_get_contents("{$path}/map.json"), true);

  $data = array(
    'id' => $param['id'],
    'properties' => $map_properties,
    'features' => array(),
  );

  $d = opendir($path);
  while($r = readdir($d)) {
    if((substr($r, 0, 1) != ".") && ($r != "map.json"))
      $data['features'][] = json_decode(file_get_contents("{$path}/{$r}"), true);
  }
  closedir($d);

  return $data;
}

function ajax_save_all($param, $postdata) {
  global $data_path;

  if(!check_param($param))
    return array(
      'saved' => false,
      'error' => 'Invalid ID',
    );

  // create directory for map data
  $path = "{$data_path}/{$param['id']}";
  if(!is_dir($path))
    mkdir($path);

  $data = json_decode($postdata, true);

  if(array_key_exists("properties", $data))
    file_put_contents("{$path}/map.json", json_readable_encode($data['properties']));

  foreach($data['features'] as $feature) {
    if(!check_param($feature)) {
      $feature['id'] = md5(uniqid());
    }

    file_put_contents("{$path}/_{$feature['id']}.json", json_readable_encode($feature));
  }

  return array(
    'saved' => true,
  );
}

function ajax_save_map_properties($param, $postdata) {
  global $data_path;

  if(!check_param($param))
    return array(
      'saved' => false,
      'error' => 'Invalid ID',
    );

  // create directory for map data
  $path = "{$data_path}/{$param['id']}";
  if(!is_dir($path))
    mkdir($path);

  $data = json_decode($postdata, true);

  file_put_contents("{$path}/map.json", json_readable_encode($data));

  return array(
    'saved' => true,
  );
}

function ajax_save_feature($param, $postdata) {
  global $data_path;

  if(!check_param($param))
    return array(
      'saved' => false,
      'error' => 'Invalid ID',
    );

  // create directory for map data
  $path = "{$data_path}/{$param['id']}";
  if(!is_dir($path))
    mkdir($path);

  $feature = json_decode($postdata, true);

  if(!check_param($feature)) {
    $feature['id'] = md5(uniqid());
  }

  file_put_contents("{$path}/_{$feature['id']}.json", json_readable_encode($feature));

  return array(
    'saved' => true,
  );
}
