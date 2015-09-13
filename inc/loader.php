<?php
function ajax_load($param) {
  return json_decode(file_get_contents("{$param['id']}.json"), true);
}
