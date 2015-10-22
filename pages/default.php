<?php
class Page_default extends Page {
  function content() {
    global $data_path;

    $ret  = "Available maps:<ul>\n";

    $d = opendir($data_path);
    while($r = readdir($d)) {
      if(substr($r, 0, 1) != ".") {
        $r = pathinfo($r);
        $name = $r['filename'];

        $c = file_get_contents("{$data_path}/{$r['filename']}/map.json");
        if($c) {
          $c = json_decode($c, true);
          if(is_array($c) && array_key_exists('title', $c)) {
            $name = $c['title'];
          }
        }

        $ret .= "<li><a href='?page=edit&amp;id={$r['filename']}'>{$name}</a></li>\n";
      }
    }
    closedir($d);

    $ret .= "</ul>\n";
    $ret .= "Create new:<ul>\n";
    $ret .= "<li><a href='?page=edit&amp;id=" . md5(uniqid()) . "'>empty map</a></li>\n";
    $ret .= "</ul>\n";

    return $ret;
  }
}

