<?php
function check_param($param) {
  if(preg_match("/\-\(\)'\"`\[\]\n\t!$%&\+\*,\.\/:;=<>\?\\\{\}\^\|\~/", $param['id']))
    return false;

  return true;
}

function ajax_load($param) {
  global $data_path;

  if(!check_param($param))
    return null;

  return json_decode(file_get_contents("{$data_path}{$param['id']}.json"), true);
}

function ajax_save($param, $postdata) {
  global $data_path;

  if(!check_param($param))
    return null;

  file_put_contents("{$data_path}{$param['id']}.json", $postdata);
}
