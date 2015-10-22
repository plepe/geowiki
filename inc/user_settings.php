<?php
register_hook("auth_user_settings_form", function(&$form_def) {
  $form_def['color'] = array(
    'type'=>'color',
    'name'=>'User color',
    'desc'=>'This color will be used as default color when drawing',
  );
});

