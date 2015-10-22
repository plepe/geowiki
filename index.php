<?php include "conf.php"; /* load a local configuration */ ?>
<?php include "modulekit/loader.php"; /* loads all php-includes */ ?>
<?php session_start(); ?>
<?php call_hooks('init'); ?>
<?php Header("Content-Type: text/html; charset=utf8"); ?>
<?php
$user_menu = auth_user_menu();

$page = get_page($_REQUEST);
if($page) {
  $content = $page->content();
}
else {
  $content = "Invalid page!";
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Geo-Wiki</title>
    <?php print modulekit_to_javascript(); /* pass modulekit configuration to JavaScript */ ?>
    <?php print modulekit_include_js(); /* prints all js-includes */ ?>
    <?php print modulekit_include_css(); /* prints all css-includes */ ?>
    <?php print_add_html_headers(); /* print additional html headers */ ?>

    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
</head>
<body>
<?php
print $content;
print $user_menu;
?>
</body>
</html>
