<?php
$name="Geo-Wiki";

// an ID to identify this module
$id="geowiki";

// An optional description
$description="Collaborative editing of public and private personalized maps";

// these modules should be loaded first
// * needs at least version 1.0 of module 'lang'
$depend=array('modulekit-form', 'modulekit-ajax', 'json_readable_encode');

// these modules will also be loaded if this module is loaded, but
// (preferably) after this
$load=array();

// these files will be included in this order:
$include=array();
$include['php']=array(
  'inc/loader.php',
);
$include['js']=array(
  'inc/bootstrap.js',
);
$include['css']=array(
  'inc/style.css',
);
