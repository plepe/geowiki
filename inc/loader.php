<?php
function git_exec($cmd) {
  global $data_path;
  $user = "Anonymous";
  $email = "someone@example.com";

  $x = new AdvExec();
  return $x->exec("git " .
           "-c user.name=" . shell_escape($user) . " " .
           "-c user.email=" . shell_escape($email) . " " .
           $cmd, $data_path);
}

function git_commit($msg) {
  $user = "Anonymous";
  $email = "someone@example.com";
  return git_exec(
           "commit " .
           "-m " . shell_escape($message) . " " .
           "--allow-empty-message ".
           "--author=" . shell_escape("{$user} <{$email}>")
  );
}

function git_init() {
  return git_exec("init");
}

function git_rev() {
  $result = git_exec("rev-parse HEAD");
  return trim($result[1]);
}

function git_checkout($rev=null) {
  if($rev === null)
    $rev = 'master';

  git_exec('checkout ' . shell_escape($rev));
}

function git_merge() {
  $rev = git_rev();

  git_checkout();
  $result = git_exec('merge --no-commit --no-ff ' . shell_escape($rev));
  git_exec('merge --abort');

  file_put_contents("/tmp/foo", print_r($result, 1), FILE_APPEND);
  if($result[0] == 0) {
    git_exec('merge ' . shell_escape($rev));
    return true;
  }

  return false;
}

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

  git_init();

  $path = "{$data_path}/{$param['id']}";

  if(array_key_exists('rev', $param)) {
    git_checkout($param['rev']);
  }

  $map_properties = json_decode(file_get_contents("{$path}/map.json"), true);

  $data = array(
    'id' => $param['id'],
    'rev' => git_rev(),
    'properties' => $map_properties,
    'features' => array(),
  );

  $d = opendir($path);
  while($r = readdir($d)) {
    if((substr($r, 0, 1) != ".") && ($r != "map.json"))
      $data['features'][] = json_decode(file_get_contents("{$path}/{$r}"), true);
  }
  closedir($d);

  git_checkout();

  return $data;
}

function ajax_load_changes($param) {
  global $data_path;

  $result = git_exec("log --name-only --pretty=oneline --full-index " . shell_escape($param['rev']) . "..master " . shell_escape($param['id']) . " | grep -vE '^[0-9a-f]{40} ' | sort | uniq");

  if($result[1] == "") {
    return array(
      'rev' => git_rev(),
    );
  }

  $ret = array(
    'id' => $param['id'],
    'rev' => git_rev(),
    'type' => 'FeatureCollection',
    'features' => array(),
  );

  foreach(explode("\n", $result[1]) as $file) {
    if($file == "") {
      // do nothing
    }
    elseif(basename($file) == "map.json") {
      $ret['properties'] = json_decode(file_get_contents("{$data_path}/{$file}"), true);
    }
    else {
      if(file_exists("{$data_path}/{$file}")) {
        $ret['features'][] = json_decode(file_get_contents("{$data_path}/{$file}"), true);
      }
      else {
        $ret['features'][] = array("id" => substr(basename($file), 1, 32));
      }
    }
  }

  return $ret;
}

function ajax_save_all($param, $postdata) {
  global $data_path;

  if(!check_param($param))
    return array(
      'saved' => false,
      'error' => 'Invalid ID',
    );

  git_init();

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

  git_exec("add " . shell_escape($param['id']));
  git_commit("save all");

  $rev = git_rev();

  if(!git_merge()) {
    return array(
      'saved' => false,
      'rev' => $rev,
      'error' => "Conflict when merging changes. Please reload and re-do changes.",
    );
  }

  return array(
    'saved' => true,
    'rev' => $rev,
  );
}

function ajax_save_map_properties($param, $postdata) {
  global $data_path;

  git_init();

  if(!check_param($param))
    return array(
      'saved' => false,
      'error' => 'Invalid ID',
    );

  $data = json_decode($postdata, true);

  if(array_key_exists('id', $data) && ($data['id'] != $param['id'])) {
    if(!check_param($data))
      return array(
        'saved' => false,
        'error' => 'Invalid ID',
      );

    git_exec("mv " . shell_escape($param['id']) . " " . shell_escape($data['id']));

    $param['id'] = $data['id'];
  }

  // create directory for map data
  $path = "{$data_path}/{$param['id']}";
  if(!is_dir($path))
    mkdir($path);

  file_put_contents("{$path}/map.json", json_readable_encode($data));

  git_exec("add " . shell_escape($param['id']));
  git_commit("save map properties");

  $rev = git_rev();

  if(!git_merge()) {
    return array(
      'saved' => false,
      'rev' => $rev,
      'error' => "Conflict when merging changes. Please reload and re-do changes.",
    );
  }

  return array(
    'saved' => true,
    'rev' => $rev,
    'id' => $param['id'],
  );
}

function ajax_save_feature($param, $postdata) {
  global $data_path;

  if(!check_param($param))
    return array(
      'saved' => false,
      'error' => 'Invalid ID',
    );

  git_init();

  if(array_key_exists('rev', $param))
    git_checkout($param['rev']);

  // create directory for map data
  $path = "{$data_path}/{$param['id']}";
  if(!is_dir($path))
    mkdir($path);

  $feature = json_decode($postdata, true);

  if(!check_param($feature)) {
    $feature['id'] = md5(uniqid());
  }

  file_put_contents("{$path}/_{$feature['id']}.json", json_readable_encode($feature));

  git_exec("add " . shell_escape($param['id']));
  git_commit("save feature");

  $rev = git_rev();

  if(!git_merge()) {
    return array(
      'saved' => false,
      'rev' => $rev,
      'feature_id' => $feature['id'],
      'error' => "Conflict when merging changes. Please reload and re-do changes.",
    );
  }

  return array(
    'saved' => true,
    'rev' => $rev,
    'feature_id' => $feature['id'],
  );
}

function ajax_save_remove_feature($param, $postdata) {
  global $data_path;

  if(!check_param($param))
    return array(
      'saved' => false,
      'error' => 'Invalid ID',
    );

  git_init();

  if(array_key_exists('rev', $param))
    git_checkout($param['rev']);

  // create directory for map data
  $path = "{$data_path}/{$param['id']}";
  if(!is_dir($path))
    mkdir($path);

  $feature_id = $postdata;

  git_exec("rm " . shell_escape("{$param['id']}/_" . $feature_id . '.json'));

  git_commit("remove feature");

  $rev = git_rev();

  if(!git_merge()) {
    return array(
      'saved' => false,
      'rev' => $rev,
      'error' => "Conflict when merging changes. Please reload and re-do changes.",
    );
  }

  return array(
    'saved' => true,
    'rev' => $rev,
  );
}
