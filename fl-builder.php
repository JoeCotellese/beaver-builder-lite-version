<?php
/**
 * Plugin Name: Beaver Builder Plugin (Lite Version)
 * Plugin URI: http://www.wpbeaverbuilder.com
 * Description: A drag and drop frontend WordPress page builder plugin that works with almost any theme!
 * Version: 1.3.8.1
 * Author: The Beaver Builder Team
 * Author URI: http://www.wpbeaverbuilder.com
 * Copyright: (c) 2014 Beaver Builder
 * License: GNU General Public License v2.0
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: fl-builder
 */
define('FL_BUILDER_VERSION', '1.3.8.1');
define('FL_BUILDER_DIR', plugin_dir_path(__FILE__));
define('FL_BUILDER_URL', plugins_url('/', __FILE__));
define('FL_BUILDER_LITE', true);
define('FL_BUILDER_SUPPORT_URL', 'http://www.wpbeaverbuilder.com/support');
define('FL_BUILDER_UPGRADE_URL', 'http://www.wpbeaverbuilder.com/pricing/?upgrade');
define('FL_BUILDER_DEMO_URL', 'http://demos.wpbeaverbuilder.com');
define('FL_BUILDER_OLD_DEMO_URL', 'http://demos.fastlinemedia.com');
define('FL_BUILDER_DEMO_CACHE_URL', 'http://demos.wpbeaverbuilder.com/wp-content/uploads/fl-builder/');

/* Classes */
require_once 'classes/FLBuilder.php';
require_once 'classes/FLBuilderAdmin.php';
require_once 'classes/FLBuilderAdminPosts.php';
require_once 'classes/FLBuilderAutoSuggest.php';
require_once 'classes/FLBuilderColor.php';
require_once 'classes/FLBuilderLoop.php';
require_once 'classes/FLBuilderModel.php';
require_once 'classes/FLBuilderModule.php';
require_once 'classes/FLBuilderPhoto.php';
require_once 'classes/FLBuilderUpdate.php';
require_once 'classes/FLBuilderUtils.php';

/* Updater */
require_once 'includes/updater/updater.php';

/* Plugin Activation */
register_activation_hook(__FILE__,                             'FLBuilderAdmin::activate');

/* Localization */
add_action('plugins_loaded',                                   'FLBuilder::load_plugin_textdomain');

/* Updates */
add_action('init',                                             'FLBuilderUpdate::init');

/* Load Settings and Modules */
add_action('init',                                             'FLBuilderModel::load_settings', 10);
add_action('init',                                             'FLBuilderModel::load_modules', 11);

/* Admin AJAX Actions */
add_action('wp_ajax_fl_builder_update',                        'FLBuilderModel::update');

/* Admin AJAX Filters */
add_filter('heartbeat_received',                               'FLBuilderModel::lock_post', 10, 2);

/* Admin Actions */
add_action('init',                                             'FLBuilderAdmin::init');
add_action('current_screen',                                   'FLBuilderAdminPosts::init');
add_action('before_delete_post',                               'FLBuilderModel::delete_post');
add_action('save_post',                                        'FLBuilderModel::save_revision');
add_action('wp_restore_post_revision',                         'FLBuilderModel::restore_revision', 10, 2);

/* Admin Filters */
add_filter('redirect_post_location',                           'FLBuilderAdminPosts::redirect_post_location');
add_filter('page_row_actions',                                 'FLBuilderAdminPosts::render_row_actions_link');
add_filter('post_row_actions',                                 'FLBuilderAdminPosts::render_row_actions_link');
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'FLBuilderAdmin::render_plugin_action_links');

/* AJAX Actions */
add_action('fl_ajax_fl_builder_update',                        'FLBuilderModel::update');
add_action('fl_ajax_fl_builder_autosuggest',                   'FLBuilderAutoSuggest::init');
add_action('fl_ajax_fl_builder_render_layout',                 'FLBuilder::render_layout');
add_action('fl_ajax_fl_builder_render_preview',                'FLBuilder::render_preview');
add_action('fl_ajax_fl_builder_render_settings_form',          'FLBuilder::render_settings_form');
add_action('fl_ajax_fl_builder_render_global_settings',        'FLBuilder::render_global_settings');
add_action('fl_ajax_fl_builder_render_template_selector',      'FLBuilder::render_template_selector');
add_action('fl_ajax_fl_builder_render_user_template_settings', 'FLBuilder::render_user_template_settings');
add_action('fl_ajax_fl_builder_render_icon_selector',          'FLBuilder::render_icon_selector');
add_action('fl_ajax_fl_builder_render_new_row',                'FLBuilder::render_new_row');
add_action('fl_ajax_fl_builder_render_row_settings',           'FLBuilder::render_row_settings');
add_action('fl_ajax_fl_builder_render_new_column_group',       'FLBuilder::render_new_column_group');
add_action('fl_ajax_fl_builder_render_column_settings',        'FLBuilder::render_column_settings');
add_action('fl_ajax_fl_builder_render_new_module_settings',    'FLBuilder::render_new_module_settings');
add_action('fl_ajax_fl_builder_render_module_settings',        'FLBuilder::render_module_settings');

/* Actions */
add_action('init',                                             'FLBuilder::register_templates_post_type');
add_action('send_headers',                                     'FLBuilder::no_cache_headers');
add_action('wp',                                               'FLBuilder::ajax');
add_action('wp',                                               'FLBuilder::init');
add_action('wp_enqueue_scripts',                               'FLBuilder::layout_styles_scripts');
add_action('wp_enqueue_scripts',                               'FLBuilder::styles_scripts');
add_action('admin_bar_menu',                                   'FLBuilder::admin_bar_menu', 999);
add_filter('template_include',                                 'FLBuilder::render_template', 999);
add_action('wp_footer',                                        'FLBuilder::include_jquery');
add_action('wp_footer',                                        'FLBuilder::render_ui');
add_action('wp_footer',                                        'FLBuilder::render_js_config');

/* Filters */
add_filter('body_class',                                       'FLBuilder::body_class');
add_filter('wp_default_editor',                                'FLBuilder::default_editor');
add_filter('mce_css',                                          'FLBuilder::add_editor_css');
add_filter('mce_buttons_2',                                    'FLBuilder::editor_buttons_2');
add_filter('mce_external_plugins',                             'FLBuilder::editor_external_plugins', 9999);
add_filter('the_content',                                      'FLBuilder::render_content');
