<?php
$name="Geo-Wiki";

// an ID to identify this module
$id="geowiki";

// An optional description
$description="Collaborative editing of public and private personalized maps";

// these modules should be loaded first
// * needs at least version 1.0 of module 'lang'
$depend=array('hooks', 'modulekit-form', 'modulekit-ajax', 'json_readable_encode', 'page', 'str_to_id', 'adv_exec', 'shell_escape', 'modulekit-auth', 'auth_display', "page_auth_admin");

// these modules will also be loaded if this module is loaded, but
// (preferably) after this
$load=array();

// these files will be included in this order:
$include=array();
$include['php']=array(
  'inc/loader.php',
  'inc/maki.php',
);
$include['js']=array(
  'inc/bootstrap.js',
  'inc/geowiki.js',
  'inc/functions.js',
);
$include['css']=array(
  'inc/style.css',
);
