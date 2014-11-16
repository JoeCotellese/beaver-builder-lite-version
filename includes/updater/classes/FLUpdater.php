<?php

/**
 * @class FLUpdater
 */
final class FLUpdater {

	/**
	 * @property $_api_url
	 * @static
	 * @private
	 */
	static private $_api_url = 'http://www.wpbeaverbuilder.com/';

	/**
	 * @property $_products
	 * @static
	 * @private
	 */
	static private $_products = array();

	/**
	 * @property $settings
	 * @private
	 */
	private $settings = array();

	/**
	 * @method __construct
	 */
	public function __construct($settings = array())
	{
		$this->settings = $settings;
		
		if($settings['type'] == 'plugin') {
			add_filter('pre_set_site_transient_update_plugins', array($this, 'update_check'));
			add_filter('plugins_api', array($this, 'plugin_info'), 10, 3);
		}
		else if($settings['type'] == 'theme') {
			add_filter('pre_set_site_transient_update_themes', array($this, 'update_check'));
		}
	}

	/**
	 * @method update_check
	 */
	public function update_check($transient)
	{
        if(empty($transient->checked)) {
            return $transient;
        }
	    
        $response = FLUpdater::api_request(array(
	        'fl-api-method' => 'update_check',
	        'email'         => FLUpdater::get_subscription_email(),
	        'domain'        => network_home_url(),
	        'product'       => $this->settings['name'],
	        'slug'          => $this->settings['slug']
	    ));
	    
        if(isset($response) && $response !== false && is_object($response) && !isset($response->errors)) {
        
            if($this->settings['type'] == 'plugin') {
            
                if($this->settings['slug'] == 'bb-plugin') {
                    $plugin = $this->settings['slug'] . '/fl-builder.php';
                }
                else {
                    $plugin = $this->settings['slug'] . '/' . $this->settings['slug'] . '.php';
                }
            
                $new_ver  = $response->new_version;
    			$curr_ver = $this->settings['version'];
    			
    			if(version_compare($new_ver, $curr_ver, '>')) {
    			    $transient->response[$plugin] = $response;
    			}
            }
            else if($this->settings['type'] == 'theme') {
                
                $new_ver  = $response->new_version;
    			$curr_ver = $this->settings['version'];
    			
    			if(version_compare($new_ver, $curr_ver, '>')) {
    			    $transient->response[$this->settings['slug']] = array(
    					'new_version' 	=> $response->new_version,
    					'url' 			=> $response->url,
    					'package' 		=> $response->package
					);
    			}
            }
        }

		return $transient;
	}

	/**
	 * @method plugin_info
	 */
	public function plugin_info($false, $action, $args)
	{
		if(!isset($args->slug) || $args->slug != $this->settings['slug']) {
            return $false;
		}
		
		$response = FLUpdater::api_request(array(
	        'fl-api-method' => 'plugin_info',
	        'email'         => FLUpdater::get_subscription_email(),
	        'domain'        => network_home_url(),
	        'product'       => $this->settings['name'],
	        'slug'          => $this->settings['slug']
	    ));
	    
	    if(isset($response) && is_object($response) && $response !== false) {
	        $response->name     = $this->settings['name'];
	        $response->sections = (array)$response->sections;
    	    return $response;
	    }
	        
	    return $false;
	}
	
	/**
	 * @method init
	 * @static
	 */
	static public function init()
	{
	    include FL_UPDATER_DIR . 'includes/config.php';
	    
	    foreach($config as $path) {
    	    if(file_exists($path)) {
        	    require_once $path;
    	    }
	    }
	}
	
	/**
	 * @method add_product
	 * @static
	 */
	static public function add_product($args = array())
	{
		if(is_array($args) && isset($args['slug'])) {
		
		    if($args['type'] == 'plugin') {
    		    if(file_exists(WP_CONTENT_DIR . '/plugins/' . $args['slug'])) {
        		    self::$_products[$args['name']] = $args;
        		    new FLUpdater(self::$_products[$args['name']]);
    		    }
		    }
		    if($args['type'] == 'theme') {
    		    if(file_exists(WP_CONTENT_DIR . '/themes/' . $args['slug'])) {
        		    self::$_products[$args['name']] = $args;
        		    new FLUpdater(self::$_products[$args['name']]);
    		    }
		    }
		}
	}
	
	/**
     * @method render_form
	 * @static
     */
	static public function render_form() 
	{
		// Activate a subscription?
        if(isset($_POST['fl-updater-nonce'])) {
        	if(wp_verify_nonce($_POST['fl-updater-nonce'], 'updater-nonce')) {
				self::save_subscription_email($_POST['email']); 
			}
        }
        
        $status = self::get_subscription_status();
        
        // Include the form ui.
		include FL_UPDATER_DIR . 'includes/form.php';
	}

	/**
	 * @method get_subscription_email
	 * @static
	 */
	static public function get_subscription_email()
	{
		$value = get_site_option('fl_themes_subscription_email');
		
		return $value ? $value : '';
	}

	/**
	 * @method save_subscription_email
	 * @static
	 */
	static public function save_subscription_email($email)
	{
		update_site_option('fl_themes_subscription_email', sanitize_email($email));
	}

	/**
	 * @method key_status
	 * @static
	 */
	static public function get_subscription_status()
	{
	    $status = self::api_request(array(
	        'fl-api-method' => 'subscription_status',
	        'email'         => FLUpdater::get_subscription_email()
	    ));
	    
	    if(isset($status->active) && $status->active) {
    	    return $status;
	    }
	    
	    return false;
	}
	
	/**
	 * @method api_request
	 * @static
	 * @private
	 */
	static private function api_request($args = array())
	{
	    $params = array();
	    
	    foreach($args as $key => $val) {
    	    $params[] = $key . '=' . urlencode($val);
	    }

	    return self::remote_get(self::$_api_url . '?' . implode('&', $params));
	}

	/**
	 * @method remote_get
	 * @static
	 * @private
	 */
	static private function remote_get($url)
	{
		$request = wp_remote_get($url);

		if(is_wp_error($request)) {
    		return false;
		}
		if(wp_remote_retrieve_response_code($request) != 200) {
		    return false;
        }
		  
        $response = json_decode(wp_remote_retrieve_body($request));
			
		if(isset($response->error)) {
			return false;	
		}
		
		return $response;
    }
}