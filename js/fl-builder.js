var FLBuilder;

(function($){

    /**
     * The main builder interface class.
     * 
     * @class FLBuilder
     * @static
     */
    FLBuilder = {
    
        /**
         * @param preview
         */ 
        preview                     : null,
    
        /**
         * @param _actionsLightbox
         * @private
         */ 
        _actionsLightbox            : null,
        
        /**
         * @param _addModuleAfterRowRender
         * @private
         */ 
        _addModuleAfterRowRender    : null,
        
        /**
         * @param _contentClass
         * @private
         */ 
        _contentClass               : false,
        
        /**
         * @param _dragEnabled
         * @private
         */ 
        _dragEnabled                : false,
        
        /**
         * @param _dragging
         * @private
         */ 
        _dragging                   : false,
        
        /**
         * @param _exitUrl
         * @private
         */ 
        _exitUrl                    : null,
        
        /**
         * @param _lightbox
         * @private
         */ 
        _lightbox                   : null,
        
        /**
         * @param _lightboxScrollbarTimeout
         * @private
         */ 
        _lightboxScrollbarTimeout   : null,
        
        /**
         * @param _loadedModuleAssets
         * @private
         */ 
        _loadedModuleAssets         : [],
        
        /**
         * @param _moduleHelpers
         * @private
         */ 
        _moduleHelpers              : {},
        
        /**
         * @param _multiplePhotoSelector
         * @private
         */ 
        _multiplePhotoSelector      : null,
        
        /**
         * @param _newColGroupParent
         * @private
         */ 
        _newColGroupParent          : null,
        
        /**
         * @param _newColGroupPosition
         * @private
         */ 
        _newColGroupPosition        : 0,
        
        /**
         * @param _newRowPosition
         * @private
         */ 
        _newRowPosition             : 0,
        
        /**
         * @param _selectedTemplateId
         * @private
         */ 
        _selectedTemplateId         : null,
        
        /**
         * @param _selectedTemplateType
         * @private
         */ 
        _selectedTemplateType       : null,
        
        /**
         * @param _singlePhotoSelector
         * @private
         */ 
        _singlePhotoSelector        : null,
        
        /**
         * @param _singleVideoSelector
         * @private
         */ 
        _singleVideoSelector        : null,
        
        /**
         * @param _silentUpdate
         * @private
         */ 
        _silentUpdate               : false,
        
        /**
         * @param _silentUpdateCallbackData
         * @private
         */ 
        _silentUpdateCallbackData   : null,
        
        /**
         * @param _templateSettingsEnabled
         * @private
         */ 
        _templateSettingsEnabled    : false,
    
        /**
         * @method _init
         * @private
         */
        _init: function()
        {
	        FLBuilder._initJQueryReadyFix();
	        FLBuilder._initGlobalErrorHandling();
            FLBuilder._initPostLock();
            FLBuilder._initClassNames();
            FLBuilder._initMediaUploader();
            FLBuilder._initOverflowFix();
            FLBuilder._initScrollbars();
            FLBuilder._initLightboxes();
            FLBuilder._initSortables();
            FLBuilder._initTemplateSelector();
            FLBuilder._initTemplateSettings();
            FLBuilder._bindEvents();
            FLBuilder._bindOverlayEvents();
            FLBuilder._setupEmptyLayout();
            FLBuilder._highlightEmptyCols();
        },
        
        /**
	     * Prevent errors thrown in jQuery's ready function
	     * from breaking subsequent ready calls. 
	     *
         * @method _initJQueryReadyFix
         * @private
         */
        _initJQueryReadyFix: function()
        {
	        if ( FLBuilderConfig.debug ) {
		        return;
	        }
	        
			jQuery.fn.oldReady = jQuery.fn.ready;
	        
	        jQuery.fn.ready = function( fn ) {
		        return jQuery.fn.oldReady( function() {
			        try {
			        	if ( 'function' == typeof fn ) {
				        	fn();
			        	}
			        }
			        catch ( e ){
				        FLBuilder.logError( e );
			        }
		        });
	        };
	    },
        
        /**
	     * Try to prevent errors from third party plugins
	     * from breaking the builder.
	     *
         * @method _initGlobalErrorHandling
         * @private
         */
        _initGlobalErrorHandling: function()
        {
	        if ( FLBuilderConfig.debug ) {
		        return;
	        }
	        
        	window.onerror = function( message, file, line, col, error ) {
	        	FLBuilder.logGlobalError( message, file, line, col, error );
				return true;
			};
        },
        
        /**
         * @method _initPostLock
         * @private
         */
        _initPostLock: function()
        {
            if(typeof wp.heartbeat != 'undefined') {
            
                wp.heartbeat.interval(30);
                
                wp.heartbeat.enqueue('fl_builder_post_lock', {
                    post_id: $('#fl-post-id').val()
                });
            }
        },
        
        /**
         * @method _initClassNames
         * @private
         */
        _initClassNames: function()
        {
            $('html').addClass('fl-builder-edit');
            $('body').addClass('fl-builder');
            
            if(FLBuilderConfig.simpleUi) {
                $('body').addClass('fl-builder-simple');
            }
            
            FLBuilder._contentClass = '.fl-builder-content-' + FLBuilderConfig.postId;
        },
        
        /**
         * @method _initMediaUploader
         * @private
         */
        _initMediaUploader: function()
        {
            wp.media.model.settings.post.id = $('#fl-post-id').val();
        },
        
        /**
         * @method _initOverflowFix
         * @private
         */
        _initOverflowFix: function()
        {
            $(FLBuilder._contentClass).parents().css('overflow', 'visible');
        },
        
        /**
         * @method _initScrollbars
         * @private
         */
        _initScrollbars: function()
        {
            $('.fl-nanoscroller').nanoScroller({
                alwaysVisible: true,
                preventPageScrolling: true,
                paneClass: 'fl-nanoscroller-pane',
                sliderClass: 'fl-nanoscroller-slider',
                contentClass: 'fl-nanoscroller-content'
            });
        },
        
        /**
         * @method _initLightboxes
         * @private
         */
        _initLightboxes: function()
        {
            /* Main builder lightbox */
            FLBuilder._lightbox = new FLLightbox({
                className: 'fl-builder-lightbox fl-builder-settings-lightbox'
            });
            
            FLBuilder._lightbox.on('close', FLBuilder._lightboxClosed);
            
            /* Actions lightbox */
            FLBuilder._actionsLightbox = new FLLightbox({
                className: 'fl-builder-actions-lightbox'
            });
        },
        
        /**
         * @method _initSortables
         * @private
         */
        _initSortables: function()
        {
            var defaults = {
                appendTo: 'body',
                cursor: 'move',
                cursorAt: {
                    left: 25, 
                    top: 20
                },
                distance: 1,
                helper: FLBuilder._blockDragHelper,
                start : FLBuilder._blockDragStart,
                sort: FLBuilder._blockDragSort,
                placeholder: 'fl-builder-drop-zone',
                tolerance: 'intersect'
            };
            
            // Row layouts from the builder panel.
            $('.fl-builder-rows').sortable($.extend({}, defaults, {
                connectWith: FLBuilder._contentClass + ', ' + 
                             FLBuilder._contentClass + ' .fl-row-content',
                items: '.fl-builder-block-row',
                stop: FLBuilder._rowDragStop
            }));
            
            // Modules from the builder panel.
            $('.fl-builder-modules, .fl-builder-widgets').sortable($.extend({}, defaults, {
                connectWith: FLBuilder._contentClass + ', ' + 
                             FLBuilder._contentClass + ' .fl-row-content, ' + 
                             FLBuilder._contentClass + ' .fl-col-content',
                items: '.fl-builder-block-module',
                stop: FLBuilder._moduleDragStop
            }));
            
            // Row position.
            $(FLBuilder._contentClass).sortable($.extend({}, defaults, {
                handle: '.fl-row-overlay .fl-block-overlay-actions .fl-block-move',
                helper: FLBuilder._rowDragHelper,
                items: '.fl-row',
                stop: FLBuilder._rowDragStop
            }));
            
            // Column group position.
            $(FLBuilder._contentClass + ' .fl-row-content').sortable($.extend({}, defaults, {
                handle: '.fl-row-overlay .fl-block-overlay-actions .fl-block-move',
                helper: FLBuilder._rowDragHelper,
                items: '.fl-col-group',
                stop: FLBuilder._rowDragStop
            }));
            
            // Module position.
            $(FLBuilder._contentClass + ' .fl-col-content').sortable($.extend({}, defaults, {
                connectWith: FLBuilder._contentClass + ', ' + 
                             FLBuilder._contentClass + ' .fl-row-content, ' + 
                             FLBuilder._contentClass + ' .fl-col-content',
                handle: '.fl-module-overlay .fl-block-overlay-actions .fl-block-move',
                helper: FLBuilder._moduleDragHelper,
                items: '.fl-module',
                stop: FLBuilder._moduleDragStop
            }));
        },
        
        /**
         * @method _bindEvents
         * @private
         */
        _bindEvents: function()
        {
            /* Links */
            $('a').on('click', FLBuilder._linkClicked);
            $('.fl-page-nav .nav a').on('click', FLBuilder._headerLinkClicked);
            
            /* Heartbeat */
            $(document).on('heartbeat-tick', FLBuilder._initPostLock);
            
            /* Unload Warning */
            $(window).on('beforeunload', FLBuilder._warnBeforeUnload);  
            
            /* Bar */
            $('.fl-builder-tools-button').on('click', FLBuilder._toolsClicked);
            $('.fl-builder-done-button').on('click', FLBuilder._doneClicked);
            $('.fl-builder-add-content-button').on('click', FLBuilder._showPanel);
            $('.fl-builder-templates-button').on('click', FLBuilder._changeTemplateClicked);
            $('.fl-builder-upgrade-button').on('click', FLBuilder._upgradeClicked);
            
            /* Panel */
            $('.fl-builder-panel-actions .fl-builder-panel-close').on('click', FLBuilder._closePanel);
            $('.fl-builder-blocks-section-title').on('click', FLBuilder._blockSectionTitleClicked);
            
            /* Drag and Drop */
            $('body').delegate('.fl-builder-block', 'mousedown', FLBuilder._blockDragInit);
            $('body').on('mouseup', FLBuilder._blockDragCancel);
            
            /* Actions Lightbox */
            $('body').delegate('.fl-builder-actions .fl-builder-cancel-button', 'click', FLBuilder._cancelButtonClicked);
            
            /* Save Actions */
            $('body').delegate('.fl-builder-save-actions .fl-builder-publish-button', 'click', FLBuilder._publishButtonClicked);
            $('body').delegate('.fl-builder-save-actions .fl-builder-draft-button', 'click', FLBuilder._draftButtonClicked);
            $('body').delegate('.fl-builder-save-actions .fl-builder-discard-button', 'click', FLBuilder._discardButtonClicked);
            
            /* Tools Actions */
            $('body').delegate('.fl-builder-duplicate-page-button', 'click', FLBuilder._duplicatePageClicked);
            $('body').delegate('.fl-builder-save-user-template-button', 'click', FLBuilder._saveUserTemplateClicked);
            $('body').delegate('.fl-builder-global-settings-button', 'click', FLBuilder._globalSettingsClicked);
            $('body').delegate('.fl-builder-global-settings .fl-builder-settings-save', 'click', FLBuilder._saveGlobalSettingsClicked);
            
            /* Template Selector */
            $('body').delegate('.fl-user-template', 'click', FLBuilder._userTemplateClicked);
            $('body').delegate('.fl-user-template-edit', 'click', FLBuilder._editUserTemplateClicked);
            $('body').delegate('.fl-user-template-delete', 'click', FLBuilder._deleteUserTemplateClicked);
            $('body').delegate('.fl-template-preview', 'click', FLBuilder._templateClicked);
            $('body').delegate('.fl-builder-template-replace-button', 'click', FLBuilder._templateReplaceClicked);
            $('body').delegate('.fl-builder-template-append-button', 'click', FLBuilder._templateAppendClicked);
            $('body').delegate('.fl-builder-template-actions .fl-builder-cancel-button', 'click', FLBuilder._templateCancelClicked);
            
            /* User Template Settings */
            $('body').delegate('.fl-builder-user-template-settings .fl-builder-settings-save', 'click', FLBuilder._saveUserTemplateSettings);
            
            /* Edit User Template */
            $('body').delegate('.fl-builder-cancel-edit-template-button', 'click', FLBuilder._cancelEditUserTemplate);
            $('body').delegate('.fl-builder-save-edit-template-button', 'click', FLBuilder._saveEditUserTemplate);
            
            /* Rows */
            $('body').delegate('.fl-row-overlay .fl-block-remove', 'click', FLBuilder._deleteRowClicked);
            $('body').delegate('.fl-row-overlay .fl-block-copy', 'click', FLBuilder._rowCopyClicked);
            $('body').delegate('.fl-row-overlay .fl-block-settings', 'click', FLBuilder._rowSettingsClicked);
            $('body').delegate('.fl-row-overlay .fl-block-move', 'mousedown', FLBuilder._blockDragInit);
            $('body').delegate('.fl-builder-row-settings .fl-builder-settings-save', 'click', FLBuilder._saveSettings);
            
            /* Columns */
            $('body').delegate('.fl-col-overlay', 'click', FLBuilder._colSettingsClicked);
            $('body').delegate('.fl-col-overlay .fl-block-settings', 'click', FLBuilder._colSettingsClicked);
            $('body').delegate('.fl-builder-col-settings .fl-builder-settings-save', 'click', FLBuilder._saveSettings);
            $('body').delegate('.fl-col-overlay .fl-block-remove', 'click', FLBuilder._deleteColClicked);
            
            /* Modules */
            $('body').delegate('.fl-module-overlay .fl-block-remove', 'click', FLBuilder._deleteModuleClicked);
            $('body').delegate('.fl-module-overlay .fl-block-copy', 'click', FLBuilder._moduleCopyClicked);
            $('body').delegate('.fl-module-overlay .fl-block-move', 'mousedown', FLBuilder._blockDragInit);
            $('body').delegate('.fl-module-overlay .fl-block-columns', 'click', FLBuilder._colSettingsClicked);
            $('body').delegate('.fl-module-overlay .fl-block-settings', 'click', FLBuilder._moduleSettingsClicked);
            $('body').delegate('.fl-module-overlay', 'click', FLBuilder._moduleSettingsClicked);
            $('body').delegate('.fl-builder-module-settings .fl-builder-settings-save', 'click', FLBuilder._saveModuleClicked);
            
            /* Settings */
            $('body').delegate('.fl-builder-settings-tabs a', 'click', FLBuilder._settingsTabClicked);
            $('body').delegate('.fl-builder-settings-cancel', 'click', FLBuilder._settingsCancelClicked);
            
            /* Tooltips */
            $('body').delegate('.fl-help-tooltip-icon', 'mouseover', FLBuilder._showHelpTooltip);
            $('body').delegate('.fl-help-tooltip-icon', 'mouseout', FLBuilder._hideHelpTooltip);
            
            /* Multiple Fields */
            $('body').delegate('.fl-builder-field-add', 'click', FLBuilder._addFieldClicked);
            $('body').delegate('.fl-builder-field-copy', 'click', FLBuilder._copyFieldClicked);
            $('body').delegate('.fl-builder-field-delete', 'click', FLBuilder._deleteFieldClicked);
            
            /* Select Fields */
            $('body').delegate('.fl-builder-settings-fields select', 'change', FLBuilder._settingsSelectChanged);
            
            /* Photo Fields */
            $('body').delegate('.fl-photo-field .fl-photo-select', 'click', FLBuilder._selectSinglePhoto);
            $('body').delegate('.fl-photo-field .fl-photo-edit', 'click', FLBuilder._selectSinglePhoto);
            $('body').delegate('.fl-photo-field .fl-photo-replace', 'click', FLBuilder._selectSinglePhoto);
            
            /* Multiple Photo Fields */
            $('body').delegate('.fl-multiple-photos-field .fl-multiple-photos-select', 'click', FLBuilder._selectMultiplePhotos);
            $('body').delegate('.fl-multiple-photos-field .fl-multiple-photos-edit', 'click', FLBuilder._selectMultiplePhotos);
            $('body').delegate('.fl-multiple-photos-field .fl-multiple-photos-add', 'click', FLBuilder._selectMultiplePhotos);
            
            /* Video Fields */
            $('body').delegate('.fl-video-field .fl-video-select', 'click', FLBuilder._selectSingleVideo);
            $('body').delegate('.fl-video-field .fl-video-replace', 'click', FLBuilder._selectSingleVideo);
            
            /* Icon Fields */
            $('body').delegate('.fl-icon-field .fl-icon-select', 'click', FLBuilder._selectIcon);
            $('body').delegate('.fl-icon-field .fl-icon-replace', 'click', FLBuilder._selectIcon);
            $('body').delegate('.fl-icon-field .fl-icon-remove', 'click', FLBuilder._removeIcon);
            
            /* Settings Form Fields */
            $('body').delegate('.fl-form-field .fl-form-field-edit', 'click', FLBuilder._formFieldClicked);
            $('body').delegate('.fl-form-field-settings .fl-builder-settings-save', 'click', FLBuilder._saveFormFieldClicked);
            
            /* Layout Fields */
            $('body').delegate('.fl-layout-field-option', 'click', FLBuilder._layoutFieldClicked);
            
            /* Links Fields */
            $('body').delegate('.fl-link-field-select', 'click', FLBuilder._linkFieldSelectClicked);
            $('body').delegate('.fl-link-field-search-cancel', 'click', FLBuilder._linkFieldSelectCancelClicked);
            
            /* Loop Builder */
            $('body').delegate('.fl-loop-builder select[name=post_type]', 'change', FLBuilder._loopBuilderPostTypeChange);
        },
        
        /**
         * @method _bindOverlayEvents
         * @private
         */
        _bindOverlayEvents: function()
        {
            var content = $(FLBuilder._contentClass);
            
            content.delegate('.fl-row', 'mouseenter', FLBuilder._rowMouseenter);
            content.delegate('.fl-row', 'mouseleave', FLBuilder._rowMouseleave);
            content.delegate('.fl-row-overlay', 'mouseleave', FLBuilder._rowMouseleave);
            content.delegate('.fl-col', 'mouseenter', FLBuilder._colMouseenter);
            content.delegate('.fl-col', 'mouseleave', FLBuilder._colMouseleave);
            content.delegate('.fl-module', 'mouseenter', FLBuilder._moduleMouseenter);
            content.delegate('.fl-module', 'mouseleave', FLBuilder._moduleMouseleave);
        },
        
        /**
         * @method _destroyOverlayEvents
         * @private
         */
        _destroyOverlayEvents: function()
        {
            var content = $(FLBuilder._contentClass);
            
            content.undelegate('.fl-row', 'mouseenter', FLBuilder._rowMouseenter);
            content.undelegate('.fl-row', 'mouseleave', FLBuilder._rowMouseleave);
            content.undelegate('.fl-row-overlay', 'mouseleave', FLBuilder._rowMouseleave);
            content.undelegate('.fl-col', 'mouseenter', FLBuilder._colMouseenter);
            content.undelegate('.fl-col', 'mouseleave', FLBuilder._colMouseleave);
            content.undelegate('.fl-module', 'mouseenter', FLBuilder._moduleMouseenter);
            content.undelegate('.fl-module', 'mouseleave', FLBuilder._moduleMouseleave);
        },
        
        /**
         * @method _linkClicked
         * @private
         */
        _linkClicked: function(e)
        {
            e.preventDefault();
        },
        
        /**
         * @method _headerLinkClicked
         * @private
         */
        _headerLinkClicked: function(e)
        {
            var link = $(this),
                href = link.attr('href');
            
            e.preventDefault();
            
            FLBuilder._exitUrl = href.indexOf('?') > -1 ? href : href + '?fl_builder';
            FLBuilder._doneClicked();
        },
        
        /**
         * @method _warnBeforeUnload
         * @private
         */ 
        _warnBeforeUnload: function()
        {
            var rowSettings     = $('.fl-builder-row-settings').length > 0,
                colSettings     = $('.fl-builder-col-settings').length > 0,
                moduleSettings  = $('.fl-builder-module-settings').length > 0;
            
            if(rowSettings || colSettings || moduleSettings) {
                return FLBuilderStrings.unloadWarning;
            }
        },
        
        /* TipTips
        ----------------------------------------------------------*/
        
        /**
         * @method _initTipTips
         * @private
         */
        _initTipTips: function()
        {
            $('.fl-tip').tipTip();
        },
        
        /**
         * @method _hideTipTips
         * @private
         */
        _hideTipTips: function()
        {
            $('#tiptip_holder').stop().remove();
        },
        
        /* Panel
        ----------------------------------------------------------*/
        
        /**
         * @method _closePanel
         * @private
         */
        _closePanel: function()
        {
            $('.fl-builder-panel').stop(true, true).animate({ right: '-350px' }, 500, function(){ $(this).hide(); });
            $('.fl-builder-bar .fl-builder-add-content-button').stop(true, true).fadeIn();
        },
        
        /**
         * @method _showPanel
         * @private
         */
        _showPanel: function()
        {
            $('.fl-builder-bar .fl-builder-add-content-button').stop(true, true).fadeOut();
            $('.fl-builder-panel').stop(true, true).show().animate({ right: '0' }, 500);
        },

        /**
         * @method _toolsClicked
         * @private
         */
        _toolsClicked: function()
        {
            var buttons             = {},
                lite                = FLBuilderConfig.lite,
                postType            = FLBuilderConfig.postType,
                enabledTemplates    = FLBuilderConfig.enabledTemplates;
                
            // Duplicate button
            if(postType == 'fl-builder-template') {
                buttons['duplicate-page'] = FLBuilderStrings.duplicateTemplate;
            }
            else {
                buttons['duplicate-page'] = FLBuilderStrings.duplicatePage;
            }
            
            // Template buttons
            if(!lite && postType != 'fl-builder-template' && (enabledTemplates == 'user' || enabledTemplates == 'enabled')) {
            
                buttons['save-user-template'] = FLBuilderStrings.saveTemplate;
                
                if(FLBuilder._templateSettingsEnabled) {
                    buttons['save-template'] = FLBuilderStrings.saveCoreTemplate;
                }
            }
            
            // Global settings button 
            buttons['global-settings'] = FLBuilderStrings.editGlobalSettings;
                
            FLBuilder._showActionsLightbox({
                'className' : 'fl-builder-tools-actions',
                'title'     : FLBuilderStrings.actionsLightboxTitle,
                'buttons'   : buttons
            });
        },
        
        /**
         * @method _doneClicked
         * @private
         */
        _doneClicked: function()
        {
            FLBuilder._showActionsLightbox({
                'className': 'fl-builder-save-actions',
                'title': FLBuilderStrings.actionsLightboxTitle,
                'buttons': {
                    'publish': FLBuilderStrings.publish,
                    'draft': FLBuilderStrings.draft,
                    'discard': FLBuilderStrings.discard
                }
            });
        },
        
        /**
         * @method _upgradeClicked
         * @private
         */
        _upgradeClicked: function()
        {
            window.open(FLBuilderConfig.upgradeUrl);
        },
        
        /**
         * @method _blockSectionTitleClicked
         * @private
         */
        _blockSectionTitleClicked: function()
        {
            var title   = $(this),
                section = title.parent();
                
            if(section.hasClass('fl-active')) {
                section.removeClass('fl-active');
            }
            else {
                $('.fl-builder-blocks-section').removeClass('fl-active');
                section.addClass('fl-active');
            }
            
            FLBuilder._initScrollbars();
        },
        
        /* Save Actions
        ----------------------------------------------------------*/
        
        /**
         * @method _publishButtonClicked
         * @private
         */
        _publishButtonClicked: function()
        {
            FLBuilder.showAjaxLoader();
            
            FLBuilder.ajax({
                action: 'fl_builder_save',
                method: 'save_layout',
                render_assets: 0
            }, FLBuilder._exit);
                
            FLBuilder._actionsLightbox.close();
        },
        
        /**
         * @method _saveButtonClicked
         * @private
         */
        _draftButtonClicked: function()
        {
            FLBuilder.showAjaxLoader();
            FLBuilder._actionsLightbox.close();
            FLBuilder._exit();
        },
        
        /**
         * @method _discardButtonClicked
         * @private
         */
        _discardButtonClicked: function()
        {
            var result = confirm(FLBuilderStrings.discardMessage);
            
            if(result) {
            
                FLBuilder.showAjaxLoader();
                
                FLBuilder.ajax({
                    action: 'fl_builder_save',
                    method: 'clear_draft_layout',
                    render_assets: 0
                }, FLBuilder._exit);
                    
                FLBuilder._actionsLightbox.close();
            }
        },
        
        /**
         * @method _cancelButtonClicked
         * @private
         */
        _cancelButtonClicked: function()
        {
            FLBuilder._exitUrl = null;
            FLBuilder._actionsLightbox.close();
        },
        
        /**
         * @method _exit
         * @private
         */
        _exit: function()
        {
            var href = FLBuilder._exitUrl ? FLBuilder._exitUrl : window.location.href.replace('fl_builder', '');
            
            window.location.href = href;
        },
        
        /* Tools Actions
        ----------------------------------------------------------*/
        
        /**
         * @method _duplicatePageClicked
         * @private
         */
        _duplicatePageClicked: function()
        {
            FLBuilder._actionsLightbox.close();
            FLBuilder.showAjaxLoader();
            
            FLBuilder.ajax({
                action: 'fl_builder_save',
                method: 'duplicate_post'
            }, FLBuilder._duplicatePageComplete);
        },
        
        /**
         * @method _duplicatePageComplete
         * @private
         */
        _duplicatePageComplete: function(response)
        {
            var adminUrl = $('#fl-admin-url').val();
            
            window.location.href = adminUrl + 'post.php?post='+ response +'&action=edit';
        },
        
        /**
         * @method _changeTemplateClicked
         * @private
         */
        _changeTemplateClicked: function()
        {
            FLBuilder._actionsLightbox.close();
            FLBuilder._showTemplateSelector();
        },
        
        /**
         * @method _saveUserTemplateClicked
         * @private
         */
        _saveUserTemplateClicked: function()
        {
            FLBuilder._actionsLightbox.close();
            FLBuilder._showLightbox(false);
            
            FLBuilder.ajax({
                action: 'fl_builder_render_user_template_settings'
            }, FLBuilder._userTemplateSettingsLoaded);
        },
        
        /**
         * @method _globalSettingsClicked
         * @private
         */       
        _globalSettingsClicked: function()
        {
            FLBuilder._actionsLightbox.close();
            FLBuilder._showLightbox(false);
            
            FLBuilder.ajax({
                action: 'fl_builder_render_global_settings'
            }, FLBuilder._globalSettingsLoaded);
        },

        /**
         * @method _globalSettingsLoaded
         * @private
         */  
        _globalSettingsLoaded: function(html)
        {
            FLBuilder._setSettingsFormContent(html);  
                      
            FLBuilder._initSettingsValidation({
                module_margins: {
                    required: true,
                    number: true
                },
                row_margins: {
                    required: true,
                    number: true
                },
                row_padding: {
                    required: true,
                    number: true
                },
                row_width: {
                    required: true,
                    number: true
                },
                responsive_breakpoint: {
                    required: true,
                    number: true
                }
            });
        },

        /**
         * @method _saveGlobalSettingsClicked
         * @private
         */       
        _saveGlobalSettingsClicked: function()
        {
            var form     = $(this).closest('.fl-builder-settings'),
                valid    = form.validate().form(),
                data     = form.serializeArray(),
                settings = {},
                i        = 0;
                
            if(valid) {
                     
                for( ; i < data.length; i++) {
                    settings[data[i].name] = data[i].value;
                }
                
                FLBuilder.showAjaxLoader();
                
                FLBuilder.ajax({
                    action: 'fl_builder_save',
                    method: 'save_global_settings',
                    settings: settings
                }, FLBuilder._updateLayout);
                    
                FLBuilder._lightbox.close();
            }
        },
        
        /* Template Selector
        ----------------------------------------------------------*/
        
        /**
         * @method _initTemplateSelector
         * @private
         */
        _initTemplateSelector: function()
        {
            var rows = $(FLBuilder._contentClass).find('.fl-row');
            
            if(rows.length === 0) {
                FLBuilder._showTemplateSelector();
            }
        },
        
        /**
         * @method _showTemplateSelector
         * @private
         */
        _showTemplateSelector: function()
        {
            if(!FLBuilderConfig.lite) {
            
                FLBuilder._showLightbox(false);
            
                FLBuilder.ajax({
                    action: 'fl_builder_render_template_selector'
                }, FLBuilder._templateSelectorLoaded);
            }
        },
        
        /**
         * @method _templateSelectorLoaded
         * @private
         */
        _templateSelectorLoaded: function(html)
        {
            FLBuilder._setLightboxContent(html);
            
            if($('.fl-user-template').length == 0) {
                $('.fl-user-templates-message').show();
            } 
        },
        
        /**
         * @method _templateClicked
         * @private
         */
        _templateClicked: function()
        {
            var template = $(this),
                index 	 = template.closest('.fl-template-preview').attr('data-index');
            
            if($(FLBuilder._contentClass).children('.fl-row').length > 0) {
                
                if(index == 0) {
                    if(confirm(FLBuilderStrings.changeTemplateMessage)) {
                        FLBuilder._lightbox._node.hide();
                        FLBuilder._applyTemplate(0, false, 'core');
                    }
                }
                else {
                    FLBuilder._selectedTemplateId = index;
                    FLBuilder._selectedTemplateType = 'core';
                    FLBuilder._showTemplateActions();
                    FLBuilder._lightbox._node.hide();
                }                
            }
            else {
                FLBuilder._applyTemplate(index, false, 'core');
            }
        },
        
        /**
         * @method _userTemplateClicked
         * @private
         */
        _userTemplateClicked: function()
        {
            var id = $(this).attr('data-id');
                
            if($(FLBuilder._contentClass).children('.fl-row').length > 0) {
            
                if(id == 'blank') {
                    if(confirm(FLBuilderStrings.changeTemplateMessage)) {
                        FLBuilder._lightbox._node.hide();
                        FLBuilder._applyTemplate('blank', false, 'user');
                    }
                }
                else {            
                    FLBuilder._selectedTemplateId = id;
                    FLBuilder._selectedTemplateType = 'user';
                    FLBuilder._showTemplateActions();
                    FLBuilder._lightbox._node.hide();
                }
            }
            else {
                FLBuilder._applyTemplate(id, false, 'user');
            }
        },
        
        /**
         * @method _editUserTemplateClicked
         * @private
         */
        _editUserTemplateClicked: function(e)
        {
            e.preventDefault();
            e.stopPropagation();
            
            window.open($(this).attr('href'));
        },
        
        /**
         * @method _deleteUserTemplateClicked
         * @private
         */
        _deleteUserTemplateClicked: function(e)
        {
            var template = $(this).closest('.fl-user-template');
            
            if(confirm(FLBuilderStrings.deleteTemplate)) {
                
                FLBuilder.ajax({
                    action: 'fl_builder_save',
                    method: 'delete_user_template',
                    template_id: template.attr('data-id')
                });
            
                template.fadeOut(function(){ 
                    
                    template.remove(); 
            
                    if($('.fl-user-template').length == 0) {
                        $('.fl-user-templates-message').show();
                    }  
                });
            }
            
            e.stopPropagation();
        },
        
        /**
         * @method _showTemplateActions
         * @private
         */
        _showTemplateActions: function()
        {
            FLBuilder._showActionsLightbox({
                'className': 'fl-builder-template-actions',
                'title': FLBuilderStrings.actionsLightboxTitle,
                'buttons': {
                    'template-replace': FLBuilderStrings.templateReplace,
                    'template-append': FLBuilderStrings.templateAppend
                }
            });
        },
        
        /**
         * @method _templateReplaceClicked
         * @private
         */
        _templateReplaceClicked: function()
        {
            if(confirm(FLBuilderStrings.changeTemplateMessage)) {
                FLBuilder._actionsLightbox.close();
                FLBuilder._applyTemplate(FLBuilder._selectedTemplateId, false, FLBuilder._selectedTemplateType);
            }
        },
        
        /**
         * @method _templateAppendClicked
         * @private
         */
        _templateAppendClicked: function()
        {
            FLBuilder._actionsLightbox.close();
            FLBuilder._applyTemplate(FLBuilder._selectedTemplateId, true, FLBuilder._selectedTemplateType);
        },
        
        /**
         * @method _templateCancelClicked
         * @private
         */
        _templateCancelClicked: function()
        {
            FLBuilder._lightbox._node.show();
        },
        
        /**
         * @method _applyTemplate
         * @private
         */
        _applyTemplate: function(id, append, type)
        {
            append  = typeof append === 'undefined' || !append ? '0' : '1';
            type    = typeof type === 'undefined' ? 'core' : type;
            
            FLBuilder._lightbox.close();
            FLBuilder.showAjaxLoader();
        
            if(type == 'core') {
        
                FLBuilder.ajax({
                    action: 'fl_builder_save',
                    method: 'apply_template',
                    index: id,
                    append: append
                }, FLBuilder._updateLayout);
            }
            else {
            
                FLBuilder.ajax({
                    action: 'fl_builder_save',
                    method: 'apply_user_template',
                    template_id: id,
                    append: append
                }, FLBuilder._updateLayout);
            }
        },
        
        /* User Template Settings
        ----------------------------------------------------------*/
        
        /**
         * @method _templateSettingsLoaded
         * @private
         */  
        _userTemplateSettingsLoaded: function(html)
        {
            FLBuilder._setSettingsFormContent(html);  
                      
            FLBuilder._initSettingsValidation({
                name: {
                    required: true
                }
            });
        },
        
        /**
         * @method _saveUserTemplateSettings
         * @private
         */
        _saveUserTemplateSettings: function()
        {
            var form     = $(this).closest('.fl-builder-settings'),
                valid    = form.validate().form(),
                settings = FLBuilder._getSettings(form);
                
            if(valid) {
                     
                FLBuilder.showAjaxLoader();
                
                FLBuilder.ajax({
                    action: 'fl_builder_save',
                    method: 'save_user_template',
                    template_name: settings.name
                }, FLBuilder._saveUserTemplateSettingsComplete);
                    
                FLBuilder._lightbox.close();
            }
        },
        
        /**
         * @method _saveUserTemplateSettingsComplete
         * @private
         */
        _saveUserTemplateSettingsComplete: function()
        {
            FLBuilder._alert(FLBuilderStrings.templateSaved);
        },

        /* Edit User Template
        ----------------------------------------------------------*/
        
        /**
         * @method _cancelEditUserTemplate
         * @private
         */
        _cancelEditUserTemplate: function()
        {
            var result = confirm(FLBuilderStrings.discardMessage);
            
            if(result) {
            
                FLBuilder.showAjaxLoader();
                
                FLBuilder.ajax({
                    action: 'fl_builder_save',
                    method: 'clear_draft_layout',
                    render_assets: 0
                }, FLBuilder._cancelEditUserTemplateComplete);
            }
        },
        
        /**
         * @method _cancelEditUserTemplateComplete
         * @private
         */
        _cancelEditUserTemplateComplete: function()
        {
            window.close();
        },
        
        /**
         * @method _saveEditUserTemplate
         * @private
         */
        _saveEditUserTemplate: function()
        {
            FLBuilder.showAjaxLoader();
            
            FLBuilder.ajax({
                action: 'fl_builder_save',
                method: 'save_layout',
                render_assets: 0
            }, FLBuilder._saveEditUserTemplateComplete);
        },
        
        /**
         * @method _saveEditUserTemplateComplete
         * @private
         */
        _saveEditUserTemplateComplete: function()
        {
            window.close();
        },
        
        /* Template Settings
        ----------------------------------------------------------*/
        
        /**
         * @method _initTemplateSettings
         * @private
         */
        _initTemplateSettings: function()
        {
            if(FLBuilder._templateSettingsEnabled) {
                FLBuilder._bindTemplateSettings();
            }
        },
        
        /* Layout
        ----------------------------------------------------------*/
        
        /**
         * @method _setupEmptyLayout
         * @private
         */
        _setupEmptyLayout: function()
        {
            var content = $(FLBuilder._contentClass);
            
            content.removeClass('fl-builder-empty');
            content.find('.fl-builder-empty-message').remove();
            
            if(content.children('.fl-row').length === 0) {
                content.addClass('fl-builder-empty');
                content.append('<span class="fl-builder-empty-message">'+ FLBuilderStrings.emptyMessage +'</span>');
                FLBuilder._initSortables();
            }
        },
        
        /**
         * @method _updateLayout
         * @private
         */
        _updateLayout: function()
        {
            FLBuilder.showAjaxLoader();
            
            FLBuilder.ajax({
                action: 'fl_builder_render_layout',
                'wp-minify-off': '1'
            }, FLBuilder._renderLayout);
        },
        
        /**
         * @method _renderLayout
         * @private
         */
        _renderLayout: function(data, callback)
        {
            data = typeof data == 'string' ? JSON.parse(data) : data;
        
            var post    = $('#fl-post-id').val(),
                head    = $('head').eq(0),
                body    = $('body').eq(0),
                content = $(FLBuilder._contentClass),
                loader  = $('<img src="' + data.css + '" />'),
                oldCss  = $('#fl-builder-layout-' + post + '-css'),
                oldJs   = $('script[src*="/cache/' + post + '"]'),
                newCss  = $('<link rel="stylesheet" id="fl-builder-layout-' + post + '-css"  href="'+ data.css +'" />'),
                newJs   = $('<script src="'+ data.js +'"></script>');
                
            // Image onerror hack to check if the stylesheet has been loaded.
            loader.on('error', function() 
            {
                // Remove the loader.
                loader.remove();
                
                // Add the new layout css.
                if(oldCss.length > 0) {
                    oldCss.after(newCss);
                }
                else {
                    head.append(newCss);    
                }
                
                // Set a quick timeout to ensure the css has taken effect.
                setTimeout(function()
                {
                    // Set the body height so the page doesn't scroll.
                    body.height(body.height());
                    
                    // Remove the old content and assets.
                    content.empty();
                    oldCss.remove();
                    oldJs.remove();
                    
                    // Add the new content.
                    content.append( FLBuilder._renderLayoutCleanContent( data.html ) );
                    
                    // Add the new layout js.
                    setTimeout(function(){
                        head.append(newJs);
                    }, 50);

                    // Send the layout rendered event.
                    $( FLBuilder._contentClass ).trigger( 'fl-builder.layout-rendered' );
                    
                    // Remove action overlays so they can reset.
                    FLBuilder._removeAllOverlays();
                    
                    // Hide the loader.
                    FLBuilder.hideAjaxLoader();
                    
                    // Run the callback.
                    if(typeof callback != 'undefined') {
                        callback();
                    }
                
                }, 250);
            });
            
            body.append(loader);
        },
        
        /**
         * Remove scripts added by third party plugins
         * that are already present on the page.
         *
         * @method _renderLayoutCleanContent
         * @private
         */
        _renderLayoutCleanContent: function( html )
        {
            var cleaned = $( '<div id="fl-cleaned-content">' + html + '</div>' ),
                src     = '',
                script  = null;
            
            cleaned.find( 'script' ).each( function() {
                
                src     = $( this ).attr( 'src' );
                script  = $( 'script[src="' + src + '"]' );
                
                if ( script.length > 0 ) {
                    $( this ).remove();
                }
            });
            
            return cleaned.html();
        },
        
        /**
         * Called by the JavaScript file once it's loaded 
         * to finish rendering the layout.
         *
         * @method _renderLayoutComplete
         * @private
         */
        _renderLayoutComplete: function()
        {
            FLBuilder._setupEmptyLayout();
            FLBuilder._highlightEmptyCols();
            FLBuilder._initSortables();
            FLBuilder._resizeLayout();
            FLBuilder._initMediaElements();
            FLBuilderLayout.init();
            
            // Reset the body height.
            $('body').height('auto');
        },
        
        /**
         * @method _resizeLayout
         * @private
         */
        _resizeLayout: function()
        {
            $(window).trigger('resize'); 
                
            if(typeof YUI !== 'undefined') {
                YUI().use('node-event-simulate', function(Y) {
                    Y.one(window).simulate("resize");
                });
            }
        },

        /**
         * @method _initMediaElements
         * @private
         */
        _initMediaElements: function()
        {
            var settings = {};
            
            if(typeof $.fn.mediaelementplayer != 'undefined') {
            
                if(typeof _wpmejsSettings !== 'undefined') {
                    settings.pluginPath = _wpmejsSettings.pluginPath;
                }
                
                $('.wp-audio-shortcode, .wp-video-shortcode').mediaelementplayer(settings);                
            }
        },
        
        /* Generic Drag and Drop
        ----------------------------------------------------------*/
        
        /**
         * @method _blockDragHelper
         * @private
         */
        _blockDragHelper: function (e, item) 
        {
            var helper = item.clone();
            
            item.clone().insertAfter(item);
            helper.addClass('fl-builder-block-drag-helper');
            
            return helper;
        },
        
        /**
         * @method _blockDragInit
         * @private
         */
        _blockDragInit: function(e)
        {
            var target      = $(e.target),
                item        = null,
                initialPos  = 0;
                
            // Set the _dragEnabled flag.
            FLBuilder._dragEnabled = true;
            
            // Set the item to a module instance.  
            if(target.closest('.fl-module').length > 0) {
                item      = target.closest('.fl-module');
            }
            // Set the item to a row instance.
            else if(target.closest('.fl-row').length > 0) {
                item      = target.closest('.fl-row');
            }
            // Set the target to the first visible row.
            else if(target.hasClass('fl-builder-block-row')) {
                $('.fl-row').each(function(){
                    if(item === null && $(this).offset().top - $(window).scrollTop() > 0) {
                        item = $(this);
                    }
                });
            }
            // Set the target to the first visible module.
            else if(target.hasClass('fl-builder-block-module')) {
                
                $('.fl-module').each(function(){
                    if(item === null && $(this).offset().top - $(window).scrollTop() > 0) {
                        item = $(this);
                    }
                });
            }
            
            // Get the initial scroll position of the target.
            if(item !== null) {
                initialPos = item.offset().top - $(window).scrollTop();
            }
            else {
                item = target;
            }
            
            // Hide the empty message.
            $('.fl-builder-empty-message').hide();
            
            // Highlight rows.
            $(FLBuilder._contentClass + ' .fl-row').addClass('fl-row-highlight');
            
            // Highlight modules.
            if(item.hasClass('fl-module') || item.hasClass('fl-builder-block-module')) {
                $(FLBuilder._contentClass + ' .fl-col').addClass('fl-col-highlight');
            }
            
            // Clean up the UI for dragging.
            FLBuilder._closePanel();
            FLBuilder._destroyOverlayEvents();
            FLBuilder._removeAllOverlays();
            
            // Scroll to the row or module that was dragged.            
            if(initialPos > 0) {
                scrollTo(0, item.offset().top - initialPos);
            }
        },
        
        /**
         * @method _blockDragStart
         * @private
         */
        _blockDragStart: function(e, ui)
        {
            FLBuilder._dragging = true;
            
            // Refresh sortables.
            $(FLBuilder._contentClass).sortable('refreshPositions');
            $(FLBuilder._contentClass + ' .fl-row-content').sortable('refreshPositions');
            $(FLBuilder._contentClass + ' .fl-col-content').sortable('refreshPositions');
        },
        
        /**
         * @method _blockDragSort
         * @private
         */
        _blockDragSort: function(e, ui)
        {
            if(typeof ui.placeholder === 'undefined') {
                return;
            }
            
            var parent = ui.placeholder.parent(),
                title  = FLBuilderStrings.insert;
            
            if(parent.hasClass('fl-col-content')) {
                if(ui.item.hasClass('fl-builder-block-module')) {
                    title  = ui.item.text();
                }
                else {
                    title  = ui.item.attr('data-name');
                }
            }
            else if(parent.hasClass('fl-row-content')) {
                if(ui.item.hasClass('fl-builder-block-row')) {
                    title  = ui.item.text();
                }
                else {
                    title = FLBuilderStrings.newColumn;
                }
            }
            else if(parent.hasClass('fl-builder-content')) {
                if(ui.item.hasClass('fl-builder-block-row')) {
                    title  = ui.item.text();
                }
                else if(ui.item.hasClass('fl-row')) {
                    title = FLBuilderStrings.row;
                }
                else {
                    title = FLBuilderStrings.newRow;
                }
            }
            
            ui.placeholder.html(title);
        },
        
        /**
         * @method _blockDragStop
         * @private
         */
        _blockDragStop: function(e, ui)
        {
            var parent     = ui.item.parent(),
                initialPos = parent.offset().top - $(window).scrollTop();

            // Show the panel? 
            if(parent.hasClass('fl-builder-blocks-section-content')) {
                FLBuilder._showPanel();
            }
            
            // Finish dragging. 
            FLBuilder._dragEnabled = false;
            FLBuilder._dragging = false;
            FLBuilder._bindOverlayEvents();
            FLBuilder._highlightEmptyCols();
            $('.fl-builder-empty-message').show();
            
            // Scroll the page back to where it was. 
            scrollTo(0, parent.offset().top - initialPos);
        },
        
        /**
         * @method _blockDragCancel
         * @private
         */
        _blockDragCancel: function()
        {
            if(FLBuilder._dragEnabled && !FLBuilder._dragging) {
                FLBuilder._dragEnabled = false;
                FLBuilder._dragging = false;
                FLBuilder._bindOverlayEvents();
                FLBuilder._highlightEmptyCols();
                $('.fl-builder-empty-message').show();
            }
        },
        
        /**
         * @method _removeAllOverlays
         * @private
         */
        _removeAllOverlays: function()
        {
            var modules = $('.fl-module');
            
            modules.removeClass('fl-block-overlay-active');
            modules.find('.fl-module-overlay').remove();
            FLBuilder._removeRowOverlays();
            FLBuilder._hideTipTips();
        },
        
        /* Rows
        ----------------------------------------------------------*/
        
        /**
         * @method _highlightEmptyCols
         * @private
         */
        _highlightEmptyCols: function()
        {
            var rows = $(FLBuilder._contentClass + ' .fl-row'),
            	cols = $(FLBuilder._contentClass + ' .fl-col');
            
            rows.removeClass('fl-row-highlight');
            cols.removeClass('fl-col-highlight');
            
            cols.each(function(){
                
                var col = $(this);
                
                if(col.find('.fl-module').length === 0) {
                    col.addClass('fl-col-highlight');
                }
            });
        },
        
        /**
         * @method _removeRowOverlays
         * @private
         */
        _removeRowOverlays: function()
        {
            $('.fl-row').removeClass('fl-block-overlay-active');
            $('.fl-row-overlay').remove();
        },
        
        /**
         * @method _rowMouseenter
         * @private
         */
        _rowMouseenter: function()
        {
            var row = $(this);
            
            if(!row.hasClass('fl-block-overlay-active')) {
                row.addClass('fl-block-overlay-active');
                row.append('<div class="fl-row-overlay fl-block-overlay" data-node="'+ row.attr('data-node') +'"><div class="fl-block-overlay-header"><div class="fl-block-overlay-actions"><div class="fl-block-overlay-title">'+ FLBuilderStrings.row +'</div><i class="fl-block-move fa fa-arrows fl-tip" title="' + FLBuilderStrings.move + '"></i><i class="fl-block-settings fa fa-wrench fl-tip" title="' + FLBuilderStrings.rowSettings + '"></i><i class="fl-block-copy fa fa-copy fl-tip" title="' + FLBuilderStrings.duplicate + '"></i><i class="fl-block-remove fa fa-times fl-tip" title="' + FLBuilderStrings.remove + '"></i></div><div class="fl-clear"></div></div></div>');
                FLBuilder._initTipTips();
            }
        },
        
        /**
         * @method _rowMouseleave
         * @private
         */
        _rowMouseleave: function(e)
        {
            var toElement       = $(e.toElement) || $(e.relatedTarget),
                isOverlay       = toElement.hasClass('fl-row-overlay'),
                isOverlayChild  = toElement.closest('.fl-row-overlay').length > 0,
                isTipTip        = toElement.is('#tiptip_holder'),
                isTipTipChild   = toElement.closest('#tiptip_holder').length > 0;
            
            if(isOverlay || isOverlayChild || isTipTip || isTipTipChild) {
                return;
            }
            
            FLBuilder._removeRowOverlays();
        },
        
        /**
         * @method _rowDragHelper
         * @private
         */
        _rowDragHelper: function()
        {
            return $('<div class="fl-builder-block-drag-helper" style="width: 190px; height: 45px;">Row</div>');
        },
        
        /**
         * @method _rowDragStop
         * @private
         */
        _rowDragStop: function(e, ui)
        {
            var item   = ui.item,
                parent = item.parent();
                
            FLBuilder._blockDragStop(e, ui);

            // A row was dropped back into the row list.
            if(parent.hasClass('fl-builder-rows')) {
                item.remove();
                return;
            }
            // Add a new row.
            else if(item.hasClass('fl-builder-block')) {
            
                // A row was dropped into another row.
                if(parent.hasClass('fl-row-content')) {
                    FLBuilder._addColGroup(
                        item.closest('.fl-row').attr('data-node'),
                        item.attr('data-cols'), 
                        parent.children('.fl-col-group, .fl-builder-block').index(item)
                    );
                }
                // A row was dropped into the main layout.
                else {  
                    FLBuilder._addRow(
                        item.attr('data-cols'), 
                        parent.children('.fl-row, .fl-builder-block').index(item)
                    );
                }

                // Remove the helper.
                item.remove();
                
                // Show the builder panel.
                FLBuilder._showPanel();
                
                // Show the module list.
                $('.fl-builder-modules').siblings('.fl-builder-blocks-section-title').eq(0).trigger('click');
            }
            // Reorder a row.
            else {
                FLBuilder._reorderRow(
                    item.attr('data-node'), 
                    parent.children('.fl-row').index(item)
                );
            }
        },
        
        /**
         * @method _reorderRow
         * @private
         */     
        _reorderRow: function(node_id, position)
        {
            FLBuilder.ajax({
                action: 'fl_builder_save',
                method: 'reorder_node',
                node_id: node_id,
                position: position,
                silent: true
            }); 
        },
        
        /**
         * @method _addRow
         * @private
         */     
        _addRow: function(cols, position)
        {
            FLBuilder.showAjaxLoader();
        
            FLBuilder._newRowPosition = position;
            
            FLBuilder.ajax({
                action: 'fl_builder_render_new_row',
                cols: cols,
                position: position
            }, FLBuilder._addRowComplete);
        },
        
        /**
         * @method _addRowComplete
         * @private
         */     
        _addRowComplete: function(response)
        {
            var content = $(FLBuilder._contentClass),
                rows    = content.find('.fl-row'),
                row     = $(response),
                module  = null,
                form    = null;
                
            if(rows.length === 0 || rows.length == FLBuilder._newRowPosition) {
                content.append(row);
            }
            else {
                rows.eq(FLBuilder._newRowPosition).before(row);
            }
            
            FLBuilder._setupEmptyLayout();
            FLBuilder._highlightEmptyCols();
            FLBuilder._initSortables();
            
            // Add a module to the newly created row.
            if(FLBuilder._addModuleAfterRowRender !== null) {
            
                // Add an existing module. 
                if(FLBuilder._addModuleAfterRowRender.hasClass('fl-module')) {
                    module = FLBuilder._addModuleAfterRowRender;
                    row.find('.fl-col-content').eq(0).append(module);
                    FLBuilder._reorderModule(module);
                }
                
                FLBuilder._highlightEmptyCols();
                FLBuilder._addModuleAfterRowRender = null;
            }
        },
        
        /**
         * @method _deleteRowClicked
         * @private
         */
        _deleteRowClicked: function()
        {
            var nodeId = $(this).closest('.fl-row-overlay').attr('data-node'),
                row    = $('.fl-row[data-node='+ nodeId +']'),
                result = null;

            if(!row.find('.fl-module').length) {
                FLBuilder._deleteRow(row);
            } 
            else {
                result = confirm(FLBuilderStrings.deleteRowMessage);
                
                if(result) {
                    FLBuilder._deleteRow(row);
                }
            }
            
            FLBuilder._removeAllOverlays();
        },
        
        /**
         * @method _deleteRow
         * @private
         */
        _deleteRow: function(row)
        {
            FLBuilder.ajax({
                action: 'fl_builder_save',
                method: 'delete_node',
                node_id: row.attr('data-node'),
                render_assets: 0,
                silent: true
            });
            
            row.empty();
            row.remove();
            FLBuilder._setupEmptyLayout();
            FLBuilder._removeRowOverlays();
        },
        
        /**
         * @method _rowCopyClicked
         * @private
         */ 
        _rowCopyClicked: function(e)
        {
            var nodeId = $(this).closest('.fl-row-overlay').attr('data-node');
            
            FLBuilder.showAjaxLoader();
            
            FLBuilder._removeAllOverlays();
            
            FLBuilder.ajax({
                action: 'fl_builder_save',
                method: 'copy_row',
                node_id: nodeId
            }, FLBuilder._updateLayout);
            
            e.stopPropagation();
        },
        
        /**
         * @method _rowSettingsClicked
         * @private
         */
        _rowSettingsClicked: function()
        {
            var nodeId = $(this).closest('.fl-row-overlay').attr('data-node');
            
            FLBuilder._closePanel();
            FLBuilder._showLightbox();
            
            FLBuilder.ajax({
                action: 'fl_builder_render_row_settings',
                node_id: nodeId
            }, FLBuilder._rowSettingsLoaded);
        },
        
        /**
         * @method _rowSettingsLoaded
         * @private
         */
        _rowSettingsLoaded: function(response)
        {
            FLBuilder._setSettingsFormContent(response);
            
            FLBuilder.preview = new FLBuilderPreview({ type : 'row' });
        },
        
        /* Columns
        ----------------------------------------------------------*/
        
        /**
         * @method _colMouseenter
         * @private
         */
        _colMouseenter: function()
        {
            var col = $(this);
            
            if(col.find('.fl-module').length > 0) {
                return;
            }
            if(!col.hasClass('fl-block-overlay-active')) {        
                col.addClass('fl-block-overlay-active');
                col.append('<div class="fl-col-overlay fl-block-overlay"><div class="fl-block-overlay-header"><div class="fl-block-overlay-actions"><div class="fl-block-overlay-title">'+ FLBuilderStrings.column +'</div><i class="fl-block-settings fa fa-wrench fl-tip" title="' + FLBuilderStrings.columnSettings + '"></i><i class="fl-block-remove fa fa-times fl-tip" title="' + FLBuilderStrings.remove + '"></i></div><div class="fl-clear"></div></div></div>');
                FLBuilder._initTipTips();
            }
            
            $('body').addClass('fl-block-overlay-muted');
        },
        
        /**
         * @method _colMouseleave
         * @private
         */
        _colMouseleave: function(e)
        {
            var col             = $(this),
                toElement       = $(e.toElement) || $(e.relatedTarget),
                hasModules      = col.find('.fl-module').length > 0,
                isTipTip        = toElement.is('#tiptip_holder'),
                isTipTipChild   = toElement.closest('#tiptip_holder').length > 0;
            
            if(hasModules || isTipTip || isTipTipChild) {
                return;
            }
            
            col.removeClass('fl-block-overlay-active');
            col.find('.fl-col-overlay').remove();
            $('body').removeClass('fl-block-overlay-muted');
        },
        
        /**
         * @method _colSettingsClicked
         * @private
         */
        _colSettingsClicked: function(e)
        {
            var nodeId = $(this).closest('.fl-col').attr('data-node');
            
            FLBuilder._closePanel();
            FLBuilder._showLightbox();
            
            FLBuilder.ajax({
                action: 'fl_builder_render_column_settings',
                node_id: nodeId
            }, FLBuilder._colSettingsLoaded);
            
            e.stopPropagation();
        },
        
        /**
         * @method _colSettingsLoaded
         * @private
         */
        _colSettingsLoaded: function(response)
        {
            FLBuilder._setSettingsFormContent(response);
            
            var settings = $('.fl-builder-col-settings'),
                nodeId   = settings.data('node'),
                col      = $('.fl-col[data-node="' + nodeId + '"]');
                
            if(col.siblings('.fl-col').length === 0) {
                $(settings).find('#fl-builder-settings-section-general').css('display', 'none');
            }
            
            FLBuilder.preview = new FLBuilderPreview({ type : 'col' });
        },
        
        /**
         * @method _deleteColClicked
         * @private
         */
        _deleteColClicked: function(e)
        {
            FLBuilder._deleteCol($(this).closest('.fl-col'));
            FLBuilder._removeAllOverlays();
            
            e.stopPropagation();
        },
        
        /**
         * @method _deleteCol
         * @private
         */
        _deleteCol: function(col)
        {
            var row   = col.closest('.fl-row'),
                group = col.closest('.fl-col-group'),
                cols  = null,
                width = 0;
                
            col.remove();
            rowCols   = row.find('.fl-col');
            groupCols = group.find('.fl-col');
            
            if(rowCols.length == 0) {
                FLBuilder._deleteRow(row);
            }
            else {
                
                if(groupCols.length == 0) {
                    group.remove();
                }
                        
                width = 100/groupCols.length;
                groupCols.css('width', width + '%');
            
                FLBuilder.ajax({
                    action          : 'fl_builder_save',
                    method          : 'delete_col',
                    node_id         : col.attr('data-node'),
                    new_width       : width,
                    render_assets   : 0,
                    silent          : true
                });
            }
        },
        
        /**
         * @method _addColGroup
         * @private
         */
        _addColGroup: function(nodeId, cols, position)
        {
            FLBuilder.showAjaxLoader();
            
            FLBuilder._newColGroupParent = $('.fl-node-' + nodeId + ' .fl-row-content');
            FLBuilder._newColGroupPosition = position;
            
            FLBuilder.ajax({
                action      : 'fl_builder_render_new_column_group',
                cols        : cols,
                node_id     : nodeId,
                position    : position
            }, FLBuilder._addColGroupComplete);
        },
        
        /**
         * @method _addColGroupComplete
         * @private
         */     
        _addColGroupComplete: function(response)
        {
            var rowContent  = FLBuilder._newColGroupParent,
                groups      = rowContent.find('.fl-col-group'),
                group       = $(response),
                col         = group.find('.fl-col-content').eq(0),
                module      = null,
                form        = null;
              
            if(groups.length === 0 || groups.length == FLBuilder._newColGroupPosition) {
                rowContent.append(group);
            }
            else {
                groups.eq(FLBuilder._newColGroupPosition).before(group);
            }

            // Add a module to the newly created column group.
            if(FLBuilder._addModuleAfterRowRender !== null) {
            
                // Add an existing module. 
                if(FLBuilder._addModuleAfterRowRender.hasClass('fl-module')) {
                    module = FLBuilder._addModuleAfterRowRender;
                    col.append(module);
                    FLBuilder._reorderModule(module);
                }
                
                FLBuilder._addModuleAfterRowRender = null;
            }
            
            FLBuilder._highlightEmptyCols();
            FLBuilder._initSortables();
        },
        
        /* Modules
        ----------------------------------------------------------*/
        
        /**
         * @method _moduleMouseenter
         * @private
         */
        _moduleMouseenter: function()
        {
            var module        = $(this),
                moduleName    = module.attr('data-name');
            
            if(!module.hasClass('fl-block-overlay-active')) {

                if(module.outerHeight(true) < 20) {
                    module.addClass('fl-module-adjust-height');
                }
            
                module.addClass('fl-block-overlay-active');
                module.append('<div class="fl-module-overlay fl-block-overlay"><div class="fl-block-overlay-header"><div class="fl-block-overlay-actions"><div class="fl-block-overlay-title">'+ moduleName +'</div><i class="fl-block-move fa fa-arrows fl-tip" title="' + FLBuilderStrings.move + '"></i><i class="fl-block-settings fa fa-wrench fl-tip" title="' + FLBuilderStrings.settings.replace( '%s', moduleName ) + '"></i><i class="fl-block-copy fa fa-copy fl-tip" title="' + FLBuilderStrings.duplicate + '"></i><i class="fl-block-columns fa fa-columns fl-tip" title="' + FLBuilderStrings.columnSettings + '"></i><i class="fl-block-remove fa fa-times fl-tip" title="' + FLBuilderStrings.remove + '"></i></div><div class="fl-clear"></div></div></div>');
                FLBuilder._initTipTips();
            }
            
            $('body').addClass('fl-block-overlay-muted');
        },
        
        /**
         * @method _moduleMouseleave
         * @private
         */
        _moduleMouseleave: function(e)
        {
            var module          = $(this),
                toElement       = $(e.toElement) || $(e.relatedTarget),
                isTipTip        = toElement.is('#tiptip_holder'),
                isTipTipChild   = toElement.closest('#tiptip_holder').length > 0;
            
            if(isTipTip || isTipTipChild) {
                return;
            }
            
            module.removeClass('fl-module-adjust-height');
            module.removeClass('fl-block-overlay-active');
            module.find('.fl-module-overlay').remove();
            $('body').removeClass('fl-block-overlay-muted');
        },
        
        /**
         * @method _moduleDragHelper
         * @private
         */
        _moduleDragHelper: function(e, item)
        {   
            return $('<div class="fl-builder-block-drag-helper">' + item.attr('data-name') + '</div>');
        },
        
        /**
         * @method _moduleDragStop
         * @private
         */
        _moduleDragStop: function(e, ui)
        {
            var item     = ui.item,
                parent   = item.parent(),
                position = 0,
                parentId = 0;
            
            FLBuilder._blockDragStop(e, ui);
            
            // A module was dropped back into the module list.
            if(parent.hasClass('fl-builder-modules') || parent.hasClass('fl-builder-widgets')) {
                item.remove();
                return;
            }
            // A new module was dropped.
            else if(item.hasClass('fl-builder-block')) {
            
                // A new module was dropped into a row position.
                if(parent.hasClass('fl-builder-content')) {
                    position = parent.children('.fl-row, .fl-builder-block').index(item);
                    parentId = 0;
                }
                // A new module was dropped into a column position.
                else if(parent.hasClass('fl-row-content')) {
                    position = parent.children('.fl-col-group, .fl-builder-block').index(item);
                    parentId = item.closest('.fl-row').attr('data-node');
                }
                // A new module was dropped into a column.
                else {
                    position = parent.children('.fl-module, .fl-builder-block').index(item);
                    parentId = item.closest('.fl-col').attr('data-node');
                }
                
                // Add the new module.
                FLBuilder._addModule(parentId, item.attr('data-type'), position, item.attr('data-widget'))
                
                // Remove the drag helper.
                ui.item.remove();
            }
            // A module was dropped into the main layout.
            else if(parent.hasClass('fl-builder-content')) {
                position = parent.children('.fl-row, .fl-module').index(item);
                FLBuilder._addModuleAfterRowRender = item;
                FLBuilder._addRow('1-col', position);
                item.remove();
            }
            // A module was dropped into a column position.
            else if(parent.hasClass('fl-row-content')) {
                position = parent.children('.fl-col-group, .fl-module').index(item);
                FLBuilder._addModuleAfterRowRender = item;
                FLBuilder._addColGroup(item.closest('.fl-row').attr('data-node'), '1-col', position);
                item.remove();
            }
            // A module was dropped into another column.
            else {
                FLBuilder._reorderModule(item);
            }
            
            FLBuilder._resizeLayout();
        },
        
        /**
         * @method _reorderModule
         * @private
         */
        _reorderModule: function(module)
        {
            var newParent = module.closest('.fl-col').attr('data-node'),
                oldParent = module.attr('data-parent'),
                node_id   = module.attr('data-node'),
                position  = module.index();
                 
            if(newParent == oldParent) {
                FLBuilder.ajax({
                    action: 'fl_builder_save',
                    method: 'reorder_node',
                    node_id: node_id,
                    position: position,
                    silent: true
                });
            }
            else {
                module.attr('data-parent', newParent);
            
                FLBuilder.ajax({
                    action: 'fl_builder_save',
                    method: 'move_node',
                    new_parent: newParent,
                    node_id: node_id,
                    position: position,
                    silent: true
                });
            }
        },
        
        /**
         * @method _deleteModuleClicked
         * @private
         */
        _deleteModuleClicked: function(e)
        {
            var module = $(this).closest('.fl-module'),
                result = confirm(FLBuilderStrings.deleteModuleMessage);
            
            if(result) {
                FLBuilder._deleteModule(module);
                FLBuilder._removeAllOverlays();
            }
            
            e.stopPropagation();
        },
        
        /**
         * @method _deleteModule
         * @private
         */
        _deleteModule: function(module)
        {
            var row = module.closest('.fl-row');

            FLBuilder.ajax({
                action: 'fl_builder_save',
                method: 'delete_node',
                node_id: module.attr('data-node'),
                render_assets: 0,
                silent: true
            });
            
            module.empty();
            module.remove();
            row.removeClass('fl-block-overlay-muted');
            FLBuilder._highlightEmptyCols();
            FLBuilder._removeAllOverlays();
        },
        
        /**
         * @method _moduleCopyClicked
         * @private
         */ 
        _moduleCopyClicked: function(e)
        {
            var module = $(this).closest('.fl-module');
            
            FLBuilder.showAjaxLoader();
            FLBuilder._removeAllOverlays();
            
            FLBuilder.ajax({
                action: 'fl_builder_save',
                method: 'copy_module',
                node_id: module.attr('data-node')
            }, FLBuilder._updateLayout);
            
            e.stopPropagation();
        },
        
        /**
         * @method _moduleSettingsClicked
         * @private
         */ 
        _moduleSettingsClicked: function(e)
        {
            var nodeId   = $(this).closest('.fl-module').attr('data-node'),
                parentId = $(this).closest('.fl-col').attr('data-node'),
                type     = $(this).closest('.fl-module').attr('data-type');
            
            FLBuilder._showModuleSettings(nodeId, parentId, type);
            
            e.stopPropagation();
        },
        
        /**
         * @method _showModuleSettings
         * @private
         */
        _showModuleSettings: function(nodeId, parentId, type, widget)
        {
            FLBuilder._closePanel();
            FLBuilder._showLightbox();
            
            FLBuilder.ajax({
                action: 'fl_builder_render_module_settings',
                node_id: nodeId,
                type: type,
                parent_id: parentId
            }, FLBuilder._moduleSettingsLoaded);
        },
        
        /**
         * @method _moduleSettingsLoaded
         * @private
         */ 
        _moduleSettingsLoaded: function(data)
        {
            var preview   = typeof data == 'string' ? null : data.layout,
                content   = typeof data == 'string' ? data : data.settings,
                html      = $('<div>'+ content +'</div>'),
                link      = html.find('link.fl-builder-settings-css'),
                script    = html.find('script.fl-builder-settings-js'),
                form      = html.find('.fl-builder-settings'),
                type      = form.attr('data-type'),
                helper    = null;
            
            // Append the settings css and js?
            if($.inArray(type, FLBuilder._loadedModuleAssets) > -1) {
                link.remove();
                script.remove();
            }
            else {
                $('head').append(link);
                $('head').append(script);
                FLBuilder._loadedModuleAssets.push(type);
            }
            
            // Set the content.
            FLBuilder._setSettingsFormContent(html);
            
            // Create a new preview.
            FLBuilder.preview = new FLBuilderPreview({ 
                type    : 'module',
                layout  : preview
            });
            
            // Init the settings form helper.
            helper = FLBuilder._moduleHelpers[type];
            
            if(typeof helper !== 'undefined') {
                FLBuilder._initSettingsValidation(helper.rules);
                helper.init();
            }
        },
        
        /**
         * @method _saveModuleClicked
         * @private
         */ 
        _saveModuleClicked: function()
        {
            var form      = $(this).closest('.fl-builder-settings'),
                type      = form.attr('data-type'),
                id        = form.attr('data-node'),
                helper    = FLBuilder._moduleHelpers[type],
                valid     = true;
            
            if(typeof helper !== 'undefined') {
                
                form.find('label.error').remove();
                form.validate().hideErrors();
                valid = form.validate().form();
                
                if(valid) {
                    valid = helper.submit();
                }
            }
            if(valid) {
                FLBuilder._saveSettings();
                FLBuilder._lightbox.close();
            }
            else {
                FLBuilder._toggleSettingsTabErrors();
            }
        },
        
        /**
         * @method _addModule
         * @private
         */ 
        _addModule: function(parentId, type, position, widget)
        {
            FLBuilder.showAjaxLoader();
            
            FLBuilder.ajax({
                action          : 'fl_builder_render_new_module_settings',
                parent_id       : parentId,
                type            : type,
                position        : position,
                node_preview    : 1,
                widget          : typeof widget === 'undefined' ? '' : widget
            }, FLBuilder._addModuleComplete);
        },
        
        /**
         * @method _addModuleComplete
         * @private
         */ 
        _addModuleComplete: function(response)
        {
            var data = JSON.parse(response);
            
            FLBuilder._showLightbox();
            FLBuilder._moduleSettingsLoaded(data);
            
            $('.fl-builder-module-settings').data('new-module', '1');
        },
        
        /**
         * @method registerModuleHelper
         */ 
        registerModuleHelper: function(type, obj)
        {
            var defaults = {
                rules: {},
                init: function(){},
                submit: function(){ return true; },
                preview: function(){}
            };
            
            FLBuilder._moduleHelpers[type] = $.extend({}, defaults, obj);
        },
        
        /**
         * Deprecated. Use the public method registerModuleHelper instead.
         *
         * @method _registerModuleHelper
         * @private
         */ 
        _registerModuleHelper: function(type, obj)
        {
            FLBuilder.registerModuleHelper(type, obj);
        },

        /* Settings
        ----------------------------------------------------------*/
        
        /**
         * @method _initSettingsForms
         * @private
         */ 
        _initSettingsForms: function()
        {
            FLBuilder._initColorPickers();
            FLBuilder._initSelectFields();
            FLBuilder._initMultipleFields();
            FLBuilder._initAutoSuggestFields();
            FLBuilder._initLinkFields();
        },
        
        /**
         * @method _setSettingsFormContent
         * @private
         */ 
        _setSettingsFormContent: function(html)
        {
            FLBuilder._setLightboxContent(html);
            FLBuilder._initSettingsForms();
        },
        
        /**
         * @method _settingsTabClicked
         * @private
         */ 
        _settingsTabClicked: function(e)
        {
            var tab  = $(this),
                form = tab.closest('.fl-builder-settings'),
                id   = tab.attr('href').split('#').pop();
            
            form.find('.fl-builder-settings-tab').removeClass('fl-active');
            form.find('#' + id).addClass('fl-active');
            form.find('.fl-builder-settings-tabs .fl-active').removeClass('fl-active');
            $(this).addClass('fl-active');
            e.preventDefault();
        },
        
        /**
         * @method _settingsCancelClicked
         * @private
         */ 
        _settingsCancelClicked: function(e)
        {
            var moduleSettings = $('.fl-builder-module-settings'),
                existingNodes  = null,
                previewModule  = null,
                previewCol     = null,
                existingCol    = null;
            
            if(moduleSettings.length > 0 && typeof moduleSettings.data('new-module') != 'undefined') {
            
                existingNodes = $(FLBuilder.preview.state.html);
                previewModule = $('.fl-node-' + moduleSettings.data('node'));
                previewCol    = previewModule.closest('.fl-col');
                existingCol   = existingNodes.find('.fl-node-' + previewCol.data('node'));
                
                if(existingCol.length > 0) {
                    FLBuilder._deleteModule(previewModule);
                }
                else {
                    FLBuilder._deleteCol(previewCol);
                }
            }
            
            FLBuilder._updateEditorFields();
            FLLightbox.closeParent(this);
            
            if(FLBuilder.preview) {
                FLBuilder.preview.revert();
                FLBuilder.preview = null;
            }
        },
        
        /**
         * @method _initSettingsValidation
         * @private
         */ 
        _initSettingsValidation: function(rules, messages)
        {
            var form = $('.fl-builder-settings').last();
            
            form.validate({
                ignore: [],
                rules: rules,
                messages: messages,
                errorPlacement: FLBuilder._settingsErrorPlacement
            });
        },
        
        /**
         * @method _settingsErrorPlacement
         * @private
         */ 
        _settingsErrorPlacement: function(error, element)
        {
            error.appendTo(element.parent());
        },
        
        /**
         * @method _showSettingsTabErrors
         * @private
         */ 
        _toggleSettingsTabErrors: function()
        {
            var form      = $('.fl-builder-settings:visible'),
                tabs      = form.find('.fl-builder-settings-tab'),
                tab       = null,
                tabErrors = null,
                i         = 0;
            
            for( ; i < tabs.length; i++) {
                
                tab = tabs.eq(i);
                tabErrors = tab.find('label.error');
                tabLink = form.find('.fl-builder-settings-tabs a[href*='+ tab.attr('id') +']');
                tabLink.find('.fl-error-icon').remove();
                tabLink.removeClass('error');
                
                if(tabErrors.length > 0) {
                    tabLink.append('<span class="fl-error-icon"></span>');
                    tabLink.addClass('error');
                }
            }
        },
        
        /**
         * @method _getSettings
         * @private
         */ 
        _getSettings: function(form)
        {
            FLBuilder._updateEditorFields();
            
            var data     = form.serializeArray(),
                i        = 0,
                name     = '',
                key      = '',
                settings = {};
                 
            for( ; i < data.length; i++) {
                
                if(data[i].name.indexOf('[]') > -1) {
                    
                    name = data[i].name.replace('[]', '');
                    
                    if(name.indexOf('[') > -1) {
                    
                        key = name.split('[').pop().replace(']', '');
                        name = name.replace('['+ key +']', '');
                        
                        if(typeof settings[name] === 'undefined') {
                            settings[name] = {};
                        }
                        
                        settings[name][key] = data[i].value.replace(/\r/gm, '');
                    }
                    else {

                        if(typeof settings[name] === 'undefined') {
                            settings[name] = [];
                        }
                        
                        settings[name].push(data[i].value.replace(/\r/gm, ''));
                    }
                }
                else {
                    settings[data[i].name] = data[i].value.replace(/\r/gm, '');
                }
            }
            
            // Replace auto suggest values.
            for(key in settings) {
                if(typeof settings['as_values_' + key] !== 'undefined') {
                    settings[key] = $.grep(settings['as_values_' + key].split(','), function(n){ return n != ''; }).join(',');
                }
            }
            
            return settings;
        },
        
        /**
         * @method _saveSettings
         * @private
         */ 
        _saveSettings: function()
        {
            var form     = $('.fl-builder-settings-lightbox .fl-builder-settings'),
                nodeId   = form.attr('data-node'),
                settings = FLBuilder._getSettings(form);
        
            // Show the loader.
            FLBuilder.showAjaxLoader();
            
            // Make the AJAX call.
            FLBuilder.ajax({
                action          : 'fl_builder_save',
                method          : 'save_settings',
                node_id         : nodeId,
                settings        : settings,
                'wp-minify-off' : '1'
            }, FLBuilder._saveSettingsComplete);
            
            // Close the lightbox.
            FLBuilder._lightbox.close();
        },
        
        /**
         * @method _saveSettingsComplete
         * @private
         */ 
        _saveSettingsComplete: function(response)
        {
            FLBuilder._renderLayout(response, function() {
                if(FLBuilder.preview) {
                    FLBuilder.preview.clear();
                    FLBuilder.preview = null;
                }
            });
        },
        
        /* Tooltips
        ----------------------------------------------------------*/
        
        /**
         * @method _showHelpTooltip
         * @private
         */ 
        _showHelpTooltip: function()
        {
            $(this).siblings('.fl-help-tooltip-text').fadeIn();
        },
        
        /**
         * @method _hideHelpTooltip
         * @private
         */ 
        _hideHelpTooltip: function()
        {
            $(this).siblings('.fl-help-tooltip-text').fadeOut();
        },
        
        /* Auto Suggest Fields
        ----------------------------------------------------------*/
        
        /**
         * @method _initAutoSuggestFields
         * @private
         */ 
        _initAutoSuggestFields: function()
        {
            $('.fl-suggest-field').each(FLBuilder._initAutoSuggestField);
        },
        
        /**
         * @method _initAutoSuggestField
         * @private
         */ 
        _initAutoSuggestField: function()
        {
            var field = $(this);
                
            field.autoSuggest(FLBuilder._ajaxUrl({ 
                'fl_action'         : 'fl_builder_autosuggest',
                'fl_as_action'      : field.data('action'),
                'fl_as_action_data' : field.data('action-data')
            }), {
                asHtmlID                    : field.attr('name'),
                selectedItemProp            : 'name',
                searchObjProps              : 'name',
                minChars                    : 3,
                keyDelay                    : 1000,
                fadeOut                     : false,
                usePlaceholder              : true,
                emptyText                   : FLBuilderStrings.noResultsFound,
                showResultListWhenNoMatch   : true,
                preFill                     : field.data('value'),
                queryParam                  : 'fl_as_query',
                afterSelectionAdd           : FLBuilder._updateAutoSuggestField,
                afterSelectionRemove        : FLBuilder._updateAutoSuggestField
            });
        },
        
        /**
         * @method _updateAutoSuggestField
         * @private
         */ 
        _updateAutoSuggestField: function(element, item, selections)
        {
            $(this).siblings('.as-values').val(selections.join(',')).trigger('change');
        },
        
        /* Multiple Fields
        ----------------------------------------------------------*/
        
        _initMultipleFields: function()
        {
            var multiples = $('.fl-builder-field-multiples'),
                multiple  = null,
                fields    = null,
                i         = 0,
                cursorAt  = FLBuilderConfig.isRtl ? { left: 10 } : { right: 10 };
                
            for( ; i < multiples.length; i++) {
            
                multiple = multiples.eq(i);
                fields = multiple.find('.fl-builder-field-multiple');
                
                if(fields.length === 1) {
                    fields.eq(0).find('.fl-builder-field-actions').addClass('fl-builder-field-actions-single');
                }
                else {
                    fields.find('.fl-builder-field-actions').removeClass('fl-builder-field-actions-single');
                }
            }
            
            $('.fl-builder-field-multiples').sortable({
                items: '.fl-builder-field-multiple',
                cursor: 'move',
                cursorAt: cursorAt,
                distance: 5,
                opacity: 0.5,
                helper: FLBuilder._fieldDragHelper,
                placeholder: 'fl-builder-field-dd-zone',
                stop: FLBuilder._fieldDragStop,
                tolerance: 'pointer'
            });
        },
        
        /**
         * @method _addFieldClicked
         * @private
         */ 
        _addFieldClicked: function()
        {
            var button      = $(this),
                fieldName   = button.attr('data-field'),
                fieldRow    = button.closest('tr').siblings('tr[data-field='+ fieldName +']').last(),
                clone       = fieldRow.clone(),
                index       = parseInt(fieldRow.find('label span.fl-builder-field-index').html(), 10) + 1;
                
            clone.find('th label span.fl-builder-field-index').html(index);
            clone.find('.fl-form-field-preview-text').html('');
            clone.find('input, textarea, select').val('');
            fieldRow.after(clone);
            FLBuilder._initMultipleFields();
        },
        
        /**
         * @method _copyFieldClicked
         * @private
         */ 
        _copyFieldClicked: function()
        {
            var button      = $(this),
                row         = button.closest('tr'),
                clone       = row.clone(),
                index       = parseInt(row.find('label span.fl-builder-field-index').html(), 10) + 1;
                
            clone.find('th label span.fl-builder-field-index').html(index);
            row.after(clone);
            FLBuilder._renumberFields(row.parent());
            FLBuilder._initMultipleFields();
			FLBuilder.preview.delayPreview();
        },
        
        /**
         * @method _deleteFieldClicked
         * @private
         */ 
        _deleteFieldClicked: function()
        {
            var row     = $(this).closest('tr'),
                parent  = row.parent(),
                result  = confirm(FLBuilderStrings.deleteFieldMessage);
            
            if(result) {
                row.remove();
                FLBuilder._renumberFields(parent);
                FLBuilder._initMultipleFields();
                FLBuilder.preview.delayPreview();
            }
        },
        
        /**
         * @method _renumberFields
         * @private
         */ 
        _renumberFields: function(table)
        {
            var rows = table.find('.fl-builder-field-multiple'),
                i    = 0;
                
            for( ; i < rows.length; i++) {
                rows.eq(i).find('th label span.fl-builder-field-index').html(i + 1);
            }
        },
        
        /**
         * @method _fieldDragHelper
         * @private
         */ 
        _fieldDragHelper: function()
        {
            return $('<div class="fl-builder-field-dd-helper"></div>');
        },
        
        /**
         * @method _fieldDragStop
         * @private
         */ 
        _fieldDragStop: function(e, ui)
        {
            FLBuilder._renumberFields(ui.item.parent());
            
            FLBuilder.preview.delayPreview();
        },
        
        /* Select Fields
        ----------------------------------------------------------*/
        
        /**
         * @method _initSelectFields
         * @private
         */ 
        _initSelectFields: function()
        {
            $('.fl-builder-settings:visible').find('.fl-builder-settings-fields select').trigger('change');
        },
        
        /**
         * @method _settingsSelectChanged
         * @private
         */ 
        _settingsSelectChanged: function()
        {
            var select  = $(this),
                toggle  = select.attr('data-toggle'),
                hide    = select.attr('data-hide'),
                trigger = select.attr('data-trigger'),
                val     = select.val(),
                i       = 0,
                k       = 0;
            
            // TOGGLE sections, fields or tabs.
            if(typeof toggle !== 'undefined') {
            
                toggle = JSON.parse(toggle);
                
                for(i in toggle) {
                	FLBuilder._settingsSelectToggle(toggle[i].fields, 'hide', '#fl-field-');
                	FLBuilder._settingsSelectToggle(toggle[i].sections, 'hide', '#fl-builder-settings-section-');
                	FLBuilder._settingsSelectToggle(toggle[i].tabs, 'hide', 'a[href*=fl-builder-settings-tab-');
                }
                
                if(typeof toggle[val] !== 'undefined') {
                	FLBuilder._settingsSelectToggle(toggle[val].fields, 'show', '#fl-field-');
                	FLBuilder._settingsSelectToggle(toggle[val].sections, 'show', '#fl-builder-settings-section-');
                	FLBuilder._settingsSelectToggle(toggle[val].tabs, 'show', 'a[href*=fl-builder-settings-tab-');
                }
            }
            
            // HIDE sections, fields or tabs.
            if(typeof hide !== 'undefined') {
            
                hide = JSON.parse(hide);
                
                if(typeof hide[val] !== 'undefined') {
                	FLBuilder._settingsSelectToggle(hide[val].fields, 'hide', '#fl-field-');
                	FLBuilder._settingsSelectToggle(hide[val].sections, 'hide', '#fl-builder-settings-section-');
                	FLBuilder._settingsSelectToggle(hide[val].tabs, 'hide', 'a[href*=fl-builder-settings-tab-');
                }
            }
            
            // TRIGGER select inputs.
            if(typeof trigger !== 'undefined') {
            
                trigger = JSON.parse(trigger);
                
                if(typeof trigger[val] !== 'undefined') {
                    if(typeof trigger[val].fields !== 'undefined') {
                        for(i = 0; i < trigger[val].fields.length; i++) {
                            $('#fl-field-' + trigger[val].fields[i]).find('select').trigger('change');
                        }
                    }
                }
            }
        },
        
        /**
         * @method _settingsSelectToggle
         * @private
         */ 
        _settingsSelectToggle: function(inputArray, func, prefix)
        {
        	var i = 0;
        	
            if(typeof inputArray !== 'undefined') {
                for( ; i < inputArray.length; i++) {
                    $(prefix + inputArray[i])[func]();
                }
            }
        },
        
        /* Color Pickers
        ----------------------------------------------------------*/
        
        /**
         * @method _initColorPickers
         * @private
         */ 
        _initColorPickers: function()
        {
            $('.fl-color-picker').each(function(){
            
                var wrapper  = $(this),
                    picker   = wrapper.find('.fl-color-picker-color'),
                    startHex = '#' + wrapper.find('.fl-color-picker-value').val();
                    
                picker.ColorPicker({
        			color: startHex,
        			onShow: function (dialog) {
        				$(dialog).fadeIn(500);
        				return false;
        			},
        			onHide: function (dialog) {
        				$(dialog).fadeOut(500);
        				return false;
        			},
        			onChange: function (hsb, hex, rgb) {
        				picker.css('background-color', '#' + hex);	
                        wrapper.removeClass('fl-color-picker-empty');
        				wrapper.find('.fl-color-picker-value').val(hex).trigger('change');
        			}
        		}).css('background-color', startHex);
        		
        		wrapper.find('.fl-color-picker-clear').on('click', FLBuilder._clearColorPicker);
            });
        },
        
        /**
         * @method _clearColorPicker
         * @private
         */ 
        _clearColorPicker: function()
        {
            var button = $(this);
                
            button.siblings('.fl-color-picker-color').css('background-color', 'transparent');
            button.siblings('.fl-color-picker-value').val('').trigger('change');
            button.parent().addClass('fl-color-picker-empty');
        },
        
        /* Single Photo Fields
        ----------------------------------------------------------*/
        
        /**
         * @method _selectSinglePhoto
         * @private
         */ 
        _selectSinglePhoto: function()
        {
            if(FLBuilder._singlePhotoSelector === null) {
                FLBuilder._singlePhotoSelector = wp.media({
                    title: FLBuilderStrings.selectPhoto,
                    button: { text: FLBuilderStrings.selectPhoto },
                    library : { type : 'image' },
                    multiple: false
                });
            }
            
            FLBuilder._singlePhotoSelector.once('open', $.proxy(FLBuilder._singlePhotoOpened, this));
            FLBuilder._singlePhotoSelector.once('select', $.proxy(FLBuilder._singlePhotoSelected, this));
            FLBuilder._singlePhotoSelector.open();
        },
        
        /**
         * @method _singlePhotoOpened
         * @private
         */ 
        _singlePhotoOpened: function()
        {
            var selection   = FLBuilder._singlePhotoSelector.state().get('selection'),
                wrap        = $(this).closest('.fl-photo-field'),
                photoField  = wrap.find('input[type=hidden]'),
                photo       = photoField.val(),
                attachment  = null;
                
            if($(this).hasClass('fl-photo-replace')) {
                selection.reset();
                wrap.addClass('fl-photo-empty');
                photoField.val('');
            }
            else if(photo != '') {           
                attachment = wp.media.attachment(photo);
                attachment.fetch();
                selection.add(attachment ? [attachment] : []);
            }
            else {
                selection.reset();
            }
        },
        
        /**
         * @method _singlePhotoSelected
         * @private
         */ 
        _singlePhotoSelected: function()
        {
            var photo      = FLBuilder._singlePhotoSelector.state().get('selection').first().toJSON(),
                wrap       = $(this).closest('.fl-photo-field'),
                photoField = wrap.find('input[type=hidden]'),
                preview    = wrap.find('.fl-photo-preview img'),
                srcSelect  = wrap.find('select');
                
            photoField.val(photo.id);
            preview.attr('src', FLBuilder._getPhotoSrc(photo));
            wrap.removeClass('fl-photo-empty');
            wrap.find('label.error').remove();
            
            if(typeof photo.sizes !== 'undefined') {
                srcSelect.show();
                srcSelect.html(FLBuilder._getPhotoSizeOptions(photo));
                srcSelect.trigger('change');
            }
            else {
                srcSelect.hide();
            }
        },
        
        /**
         * @method _getPhotoSrc
         * @private
         */ 
        _getPhotoSrc: function(photo)
        {
            if(typeof photo.sizes === 'undefined') {
                return photo.url;
            }
            else if(typeof photo.sizes.thumbnail !== 'undefined') {
                return photo.sizes.thumbnail.url;
            }
            else {
                return photo.sizes.full.url;
            }
        },
        
        /**
         * @method _getPhotoSizeOptions
         * @private
         */ 
        _getPhotoSizeOptions: function(photo)
        {
            var html     = '',
                size     = null,
                selected = null,
                titles = {
                    full      : FLBuilderStrings.fullSize,
                    large     : FLBuilderStrings.large,
                    medium    : FLBuilderStrings.medium,
                    thumbnail : FLBuilderStrings.thumbnail
                };
                
            for(size in photo.sizes) {
                selected = size == 'full' ? ' selected="selected"' : '';
                html += '<option value="' + photo.sizes[size].url + '"' + selected + '>' + titles[size]  + ' - ' + photo.sizes[size].width + ' x ' + photo.sizes[size].height + '</option>';
            }
            
            return html;
        },
        
        /* Multiple Photo Fields
        ----------------------------------------------------------*/
        
        /**
         * @method _selectMultiplePhotos
         * @private
         */ 
        _selectMultiplePhotos: function()
        {
            var wrap           = $(this).closest('.fl-multiple-photos-field'),
                photosField    = wrap.find('input[type=hidden]'),
                photosFieldVal = photosField.val(),
                content        = photosFieldVal == '' ? '[gallery ids="-1"]' : '[gallery ids="'+ JSON.parse(photosFieldVal).join() +'"]',
                shortcode      = wp.shortcode.next('gallery', content).shortcode,
                defaultPostId  = wp.media.gallery.defaults.id,
                attachments    = null, 
                selection      = null;

            if(_.isUndefined(shortcode.get('id')) && !_.isUndefined(defaultPostId)) {
                shortcode.set('id', defaultPostId);
            }

			attachments = wp.media.gallery.attachments(shortcode);

			selection = new wp.media.model.Selection(attachments.models, {
				props: attachments.props.toJSON(),
				multiple: true
			});

			selection.gallery = attachments.gallery;

			// Fetch the query's attachments, and then break ties from the
			// query to allow for sorting.
			selection.more().done(function() {
				// Break ties with the query.
				selection.props.set({ query: false });
				selection.unmirror();
				selection.props.unset('orderby');
			});

            // Destroy the previous gallery frame.
            if(FLBuilder._multiplePhotoSelector) {
                FLBuilder._multiplePhotoSelector.dispose();
            }
            
			// Store the current gallery frame.
			FLBuilder._multiplePhotoSelector = wp.media({
				frame:     'post',
				state:     $(this).hasClass('fl-multiple-photos-edit') ? 'gallery-edit' : 'gallery-library',
				title:     wp.media.view.l10n.editGalleryTitle,
				editing:   true,
				multiple:  true,
				selection: selection
			}).open();
			
			$(FLBuilder._multiplePhotoSelector.views.view.el).addClass('fl-multiple-photos-lightbox');
			FLBuilder._multiplePhotoSelector.once('update', $.proxy(FLBuilder._multiplePhotosSelected, this));
        },
        
        /**
         * @method _multiplePhotosSelected
         * @private
         */ 
        _multiplePhotosSelected: function(data)
        {
            var wrap        = $(this).closest('.fl-multiple-photos-field'),
                photosField = wrap.find('input[type=hidden]'),
                count       = wrap.find('.fl-multiple-photos-count'),
                photos      = [],
                i           = 0;
            
            for( ; i < data.models.length; i++) {
                photos.push(data.models[i].id);
            }
                
            if(photos.length == 1) {
                count.html('1 ' + FLBuilderStrings.photoSelected);
            }
            else {
                count.html(photos.length + ' ' + FLBuilderStrings.photosSelected);
            }
         
            wrap.removeClass('fl-multiple-photos-empty');
            wrap.find('label.error').remove();
            photosField.val(JSON.stringify(photos)).trigger('change');
        },
        
        /* Single Video Fields
        ----------------------------------------------------------*/
        
        /**
         * @method _selectSingleVideo
         * @private
         */ 
        _selectSingleVideo: function()
        {
            if(FLBuilder._singleVideoSelector === null) {
            
                FLBuilder._singleVideoSelector = wp.media({
                    title: FLBuilderStrings.selectVideo,
                    button: { text: FLBuilderStrings.selectVideo },
                    library : { type : 'video' },
                    multiple: false
                }); 
            }
            
            FLBuilder._singleVideoSelector.once('select', $.proxy(FLBuilder._singleVideoSelected, this));
            FLBuilder._singleVideoSelector.open();
        },
        
        /**
         * @method _singleVideoSelected
         * @private
         */ 
        _singleVideoSelected: function()
        {
            var video      = FLBuilder._singleVideoSelector.state().get('selection').first().toJSON(),
                wrap       = $(this).closest('.fl-video-field'),
                image      = wrap.find('.fl-video-preview-img img'),
                filename   = wrap.find('.fl-video-preview-filename'),
                videoField = wrap.find('input[type=hidden]');
            
            image.attr('src', video.icon);
            filename.html(video.filename);
            wrap.removeClass('fl-video-empty');
            wrap.find('label.error').remove();
            videoField.val(video.id).trigger('change');
        },
        
        /* Icon Fields
        ----------------------------------------------------------*/
        
        /**
         * @method _selectIcon
         * @private
         */ 
        _selectIcon: function()
        {
            var self = this;
            
            FLIconSelector.open(function(icon){
                FLBuilder._iconSelected.apply(self, [icon]);
            });
        },
        
        /**
         * @method _iconSelected
         * @private
         */ 
        _iconSelected: function(icon)
        {
            var wrap       = $(this).closest('.fl-icon-field'),
                iconField  = wrap.find('input[type=hidden]'),
                iconTag    = wrap.find('i'),
                oldIcon    = iconTag.attr('data-icon');
                
            iconField.val(icon).trigger('change');
            iconTag.removeClass(oldIcon);
            iconTag.addClass(icon);
            iconTag.attr('data-icon', icon);
            wrap.removeClass('fl-icon-empty');
            wrap.find('label.error').remove();
        },
        
        /**
         * @method _removeIcon
         * @private
         */ 
        _removeIcon: function()
        {
            var wrap       = $(this).closest('.fl-icon-field'),
                iconField  = wrap.find('input[type=hidden]'),
                iconTag    = wrap.find('i');
                
            iconField.val('').trigger('change');
            iconTag.removeClass();
            iconTag.attr('data-icon', '');
            wrap.addClass('fl-icon-empty');
        },
        
        /* Settings Form Fields
        ----------------------------------------------------------*/

        /**
         * TODO: Clean these methods up! They are a disaster.
         *
         * @method _formFieldClicked
         * @private
         */  
        _formFieldClicked: function()
        {
            var link                = $(this),
                linkLightboxId      = link.closest('.fl-lightbox-wrap').attr('data-instance-id'),
                linkLightbox        = FLLightbox._instances[linkLightboxId],
                linkLightboxLeft    = linkLightbox._node.find('.fl-lightbox').css('left'),
                linkLightboxTop     = linkLightbox._node.find('.fl-lightbox').css('top'),
                form                = link.closest('.fl-builder-settings'),
                type                = link.attr('data-type'),
                settings            = link.siblings('input').val(),
                helper              = FLBuilder._moduleHelpers[type],
                lightbox            = new FLLightbox({
                                          className: 'fl-builder-lightbox fl-form-field-settings',
                                          destroyOnClose: true
                                      });

            link.closest('.fl-builder-lightbox').hide();
            link.attr('id', 'fl-' + lightbox._id);
            lightbox.open('<div class="fl-builder-lightbox-loading"></div>');
            lightbox.draggable({ handle: '.fl-lightbox-header' });
            $('body').undelegate('.fl-builder-settings-cancel', 'click', FLBuilder._settingsCancelClicked);
            
            lightbox._node.find('.fl-lightbox').css({
                'left': linkLightboxLeft,
                'top': Number(parseInt(linkLightboxTop) + 233) + 'px'
            });
            
            FLBuilder.ajax({
                action: 'fl_builder_render_settings_form',
                type: type,
                settings: settings.replace(/&#39;/g, "'")
            }, 
            function(response) 
            {
                lightbox.setContent(response); 
                lightbox._node.find('form.fl-builder-settings').attr('data-type', type); 
                lightbox._node.find('.fl-builder-settings-cancel').on('click', FLBuilder._closeFormFieldLightbox);
                FLBuilder._initSettingsForms();
                
                if(typeof helper !== 'undefined') {
                    FLBuilder._initSettingsValidation(helper.rules);
                    helper.init();
                }
                
                lightbox._node.find('.fl-lightbox').css({
                    'left': linkLightboxLeft,
                    'top': linkLightboxTop
                });
            });
        },
        
        /**
         * @method _closeFormFieldLightbox
         * @private
         */ 
        _closeFormFieldLightbox: function()
        {
            var instanceId          = $(this).closest('.fl-lightbox-wrap').attr('data-instance-id'),
                lightbox            = FLLightbox._instances[instanceId],
                linkLightbox        = $('.fl-builder-settings-lightbox'),
                linkLightboxForm    = linkLightbox.find('form'),
                linkLightboxLeft    = lightbox._node.find('.fl-lightbox').css('left');
                linkLightboxTop     = lightbox._node.find('.fl-lightbox').css('top');
                boxHeight           = 0,
                win                 = $(window),
                winHeight           = win.height();
            
            lightbox._node.find('.fl-lightbox-content').html('<div class="fl-builder-lightbox-loading"></div>');
            boxHeight = lightbox._node.find('.fl-lightbox').height();
            
            if(winHeight - 80 > boxHeight) {
                lightbox._node.find('.fl-lightbox').css('top', ((winHeight - boxHeight)/2 - 40) + 'px');
            }
            else {
                lightbox._node.find('.fl-lightbox').css('top', '0px');
            }
            
            lightbox.on('close', function() 
            {
                linkLightbox.show();
                linkLightbox.find('label.error').remove();
                linkLightboxForm.validate().hideErrors();
                FLBuilder._toggleSettingsTabErrors();
                
                linkLightbox.find('.fl-lightbox').css({
                    'left': linkLightboxLeft,
                    'top': linkLightboxTop
                });
            });
            
            setTimeout(function()
            {
                lightbox.close();
                $('body').delegate('.fl-builder-settings-cancel', 'click', FLBuilder._settingsCancelClicked);
            }, 500);
        },
        
        /**
         * @method _saveFormFieldClicked
         * @private
         */  
        _saveFormFieldClicked: function()
        {
            var form          = $(this).closest('.fl-builder-settings'),
                lightboxId    = $(this).closest('.fl-lightbox-wrap').attr('data-instance-id'),
                type          = form.attr('data-type'),
                settings      = FLBuilder._getSettings(form),
                helper        = FLBuilder._moduleHelpers[type],
                link          = $('.fl-builder-settings #fl-' + lightboxId),
                preview       = link.parent().attr('data-preview-text'),
                previewText   = settings[preview],
                selectPreview = $( 'select[name="' + preview + '"]' ),
                tmp           = document.createElement('div'),
                valid         = true;
                
            if ( selectPreview.length > 0 ) {
	            previewText = selectPreview.find( 'option[value="' + settings[ preview ] + '"]' ).text();
            }  
            if(typeof helper !== 'undefined') {
                
                form.find('label.error').remove();
                form.validate().hideErrors();
                valid = form.validate().form();
                
                if(valid) {
                    valid = helper.submit();
                }
            }
            if(valid) {
            
                if(typeof preview !== 'undefined') {
                
                    if(previewText.indexOf('fa fa-') > -1) {
                        previewText = '<i class="' + previewText + '"></i>';
                    }
                    else if(previewText.length > 35) {
                        tmp.innerHTML = previewText;
                        previewText = (tmp.textContent || tmp.innerText || '').replace(/^(.{35}[^\s]*).*/, "$1")  + '...';
                    }
                
                    link.siblings('.fl-form-field-preview-text').html(previewText);
                }
                
                link.siblings('input').val(JSON.stringify(settings)).trigger('change');
                
                FLBuilder._closeFormFieldLightbox.apply(this);
                
                return true;
            }
            else {
                FLBuilder._toggleSettingsTabErrors();
                return false;
            }
        },
        
        /* Layout Fields
        ----------------------------------------------------------*/

        /**
         * @method _layoutFieldClicked
         * @private
         */ 
        _layoutFieldClicked: function()
        {
            var option = $(this);
            
            option.siblings().removeClass('fl-layout-field-option-selected');
            option.addClass('fl-layout-field-option-selected');
            option.siblings('input').val(option.attr('data-value'));
        },
        
        /* Link Fields
        ----------------------------------------------------------*/
        
        /**
         * @method _initLinkFields
         * @private
         */ 
        _initLinkFields: function()
        {
            $('.fl-link-field').each(FLBuilder._initLinkField);
        },
        
        /**
         * @method _initLinkField
         * @private
         */ 
        _initLinkField: function()
        {
            var wrap        = $(this),
                searchInput = wrap.find('.fl-link-field-search-input');
                
            searchInput.autoSuggest(FLBuilder._ajaxUrl({ 
                'fl_action'         : 'fl_builder_autosuggest',
                'fl_as_action'      : 'fl_as_links'
            }), {
                asHtmlID                    : searchInput.attr('name'),
                selectedItemProp            : 'name',
                searchObjProps              : 'name',
                minChars                    : 3,
                keyDelay                    : 1000,
                fadeOut                     : false,
                usePlaceholder              : true,
                emptyText                   : FLBuilderStrings.noResultsFound,
                showResultListWhenNoMatch   : true,
                queryParam                  : 'fl_as_query',
                selectionLimit              : 1,
                afterSelectionAdd           : FLBuilder._updateLinkField
            });
        },
        
        /**
         * @method _updateLinkField
         * @private
         */ 
        _updateLinkField: function(element, item, selections)
        {
            var wrap        = element.closest('.fl-link-field'),
                search      = wrap.find('.fl-link-field-search'),
                searchInput = wrap.find('.fl-link-field-search-input'),
                field       = wrap.find('.fl-link-field-input');
            
            field.val(item.value).trigger('keyup');
            searchInput.autoSuggest('remove', item.value);
            search.hide();
        },

        /**
         * @method _linkFieldSelectClicked
         * @private
         */ 
        _linkFieldSelectClicked: function()
        {
            $(this).parent().find('.fl-link-field-search').show();
        },

        /**
         * @method _linkFieldSelectCancelClicked
         * @private
         */ 
        _linkFieldSelectCancelClicked: function()
        {
            $(this).parent().hide();
        },
        
        /* Loop Builder
        ----------------------------------------------------------*/

        /**
         * @method _loopBuilderPostTypeChange
         * @private
         */ 
        _loopBuilderPostTypeChange: function()
        {
            var val = $(this).val();
            
            $('.fl-loop-builder-filter').hide();
            $('.fl-loop-builder-' + val + '-filter').show();
        },
        
        /* Editor Fields
        ----------------------------------------------------------*/
        
        /**
         * Used to init pre WP 3.9 editors from field.php.
         *
         * @method initEditorField
         */  
        initEditorField: function(id)
        {
            var newEditor = tinyMCEPreInit.mceInit['flhiddeneditor'];
            
            newEditor['elements'] = id;
            tinyMCEPreInit.mceInit[id] = newEditor;
        },

        /**
         * @method _updateEditorFields
         * @private
         */  
        _updateEditorFields: function()
        {
            var wpEditors = $('.fl-builder-settings textarea.wp-editor-area');
            
            $('.wp-switch-editor.switch-tmce').trigger('click');
            wpEditors.each(FLBuilder._updateEditorField);
        },

        /**
         * @method _updateEditorField
         * @private
         */  
        _updateEditorField: function()
        {
            var textarea  = $(this),
                content   = '',
                id        = textarea.attr('id'),
                name      = textarea.closest('.fl-editor-field').attr('id'),
                editor    = typeof tinyMCE == 'undefined' ? false : tinyMCE.get(id);
            
            if(editor) {
                content = editor.getContent();
            } 
            else {
                content = $('#' + id).val();
            }
            
            textarea.val(content);
            textarea.attr('name', name);
        },
        
        /* AJAX
        ----------------------------------------------------------*/

        /**
         * @method ajax
         */   
        ajax: function(data, callback)
        {
            var key;
            
            // Show the loader and save the data for
            // later if a silent update is running.
            if(FLBuilder._silentUpdate) {
                FLBuilder.showAjaxLoader();
                FLBuilder._silentUpdateCallbackData = [data, callback];
                return;
            }
            
            // This request is silent, set the flag to true
            // so we know incase another ajax request is made
            // before this one finishes.
            else if(data.silent === true) {
                FLBuilder._silentUpdate = true;
            }
            
            // Send the post id to the server. 
            data.post_id = $('#fl-post-id').val();
            
            // Tell the server that the builder is active.
            data.fl_builder = 1;
            
            // Append the builder namespace to the action.
            data.fl_action = data.action;
            
            // Store the data in a single variable to avoid conflicts.
            data = { fl_builder_data: data };
            
            // Do the ajax call.
            return $.post(FLBuilder._ajaxUrl(), data, function(response) {

                FLBuilder._ajaxComplete();
            
                if(typeof callback !== 'undefined') {
                    callback.call(this, response);
                }
            });
        },

        /**
         * @method _ajaxComplete
         * @private
         */   
        _ajaxComplete: function()
        {
            var data, callback;
            
            // Set the silent update flag to false
            // so other ajax requests can run.
            FLBuilder._silentUpdate = false;
            
            // Do an ajax request that was stopped 
            // by a silent ajax request.
            if(FLBuilder._silentUpdateCallbackData !== null) {
                FLBuilder.showAjaxLoader();
                data = FLBuilder._silentUpdateCallbackData[0];
                callback = FLBuilder._silentUpdateCallbackData[1];
                FLBuilder._silentUpdateCallbackData = null;
                FLBuilder.ajax(data, callback);
            }
            
            // We're done, hide the loader incase it's showing.
            else {
                FLBuilder.hideAjaxLoader();
            }
        },

        /**
         * @method _ajaxUrl
         * @private
         */   
        _ajaxUrl: function(params)
        {
            var url     = FLBuilderConfig.ajaxUrl,
                param   = null;
            
            if(typeof params !== 'undefined') {
            
                for(param in params) {
                    url += url.indexOf('?') > -1 ? '&' : '?';
                    url += param + '=' + params[param];
                }
            }
        
            return url;
        },

        /**
         * @method showAjaxLoader
         */   
        showAjaxLoader: function()
        {
            if( 0 === $( '.fl-builder-lightbox-loading' ).length ) {
                $( '.fl-builder-loading' ).show();
            }
        },

        /**
         * @method hideAjaxLoader
         */   
        hideAjaxLoader: function()
        {
            $( '.fl-builder-loading' ).hide();
        },
        
        /* Lightboxes
        ----------------------------------------------------------*/
        
        /**
         * @method _showLightbox
         * @private
         */  
        _showLightbox: function(draggable)
        {
            draggable = typeof draggable === 'undefined' ? true : draggable;
            
            FLBuilder._lightbox.open('<div class="fl-builder-lightbox-loading"></div>');
            
            if(draggable) {
                FLBuilder._lightbox.draggable({
                    handle: '.fl-lightbox-header'
                });
            }
            else {
                FLBuilder._lightbox.draggable(false);
            }
            
            FLBuilder._removeAllOverlays();
            FLBuilder._initLightboxScrollbars();
        },
        
        /**
         * @method _setLightboxContent
         * @private
         */  
        _setLightboxContent: function(content)
        {
            FLBuilder._lightbox.setContent(content);
        },
        
        /**
         * @method _initLightboxScrollbars
         * @private
         */  
        _initLightboxScrollbars: function()
        {
            FLBuilder._initScrollbars();
            FLBuilder._lightboxScrollbarTimeout = setTimeout(FLBuilder._initLightboxScrollbars, 500);
        },
        
        /**
         * @method _lightboxClosed
         * @private
         */  
        _lightboxClosed: function()
        {
            FLBuilder._lightbox.empty();
            $('div.colorpicker').empty().remove();
            clearTimeout(FLBuilder._lightboxScrollbarTimeout);
        },
        
        /**
         * @method _showActionsLightbox
         * @private
         */
        _showActionsLightbox: function(settings)
        {
            var buttons = '',
                i       = null;
                
            for(i in settings.buttons) {
                buttons += '<span class="fl-builder-'+ i +'-button fl-builder-button fl-builder-button-large">'+ settings.buttons[i] +'</span>';
            }
            
            FLBuilder._actionsLightbox.open('<div class="fl-builder-actions '+ settings.className +'"><span class="fl-builder-actions-title">'+ settings.title +'</span>'+ buttons +'<span class="fl-builder-cancel-button fl-builder-button fl-builder-button-primary fl-builder-button-large">'+ FLBuilderStrings.cancel +'</span></div>');
        },
        
        /* Alert Lightboxes
        ----------------------------------------------------------*/
        
        /**
         * @method _alert
         * @private
         */
        _alert: function(message)
        {
            var alert = new FLLightbox({
                    className: 'fl-builder-lightbox fl-builder-alert-lightbox',
                    destroyOnClose: true
                }),
                html = '<div class="fl-lightbox-message">' + message + '</div><div class="fl-lightbox-footer"><span class="fl-builder-settings-cancel fl-builder-button fl-builder-button-large fl-builder-button-primary" href="javascript:void(0);">' + FLBuilderStrings.ok + '</span></div>';
            
            alert.open(html);
        },
        
        /* Console Logging
        ----------------------------------------------------------*/
        
        /**
         * @method log
         */
        log: function( message )
        {
	        if ( 'undefined' == typeof window.console || 'undefined' == typeof window.console.log ) {
				return;
			}
			
			console.log( message );
        },
        
        /**
         * @method logError
         */
        logError: function( error )
        {
	        var message = null;
	        
	        if ( 'undefined' == typeof error ) {
		        return;
	        }
	        else if ( 'undefined' != typeof error.stack ) {
		        message = error.stack;
	        }
	        else if ( 'undefined' != typeof error.message ) {
		        message = error.message;
	        }
	        
	        if ( message ) {
		        FLBuilder.log( '************************************************************************' );
		        FLBuilder.log( FLBuilderStrings.errorMessage );
		        FLBuilder.log( message );
		        FLBuilder.log( '************************************************************************' );
			}
        },
        
        /**
         * @method logGlobalError
         * @private
         */
        logGlobalError: function( message, file, line, col, error )
        {
        	FLBuilder.log( '************************************************************************' );
		    FLBuilder.log( FLBuilderStrings.errorMessage );
			FLBuilder.log( FLBuilderStrings.globalErrorMessage.replace( '{message}', message ).replace( '{line}', line ).replace( '{file}', file ) );
			
			if ( 'undefined' != typeof error && 'undefined' != typeof error.stack ) {
				FLBuilder.log( error.stack );
				FLBuilder.log( '************************************************************************' );
			}
        }
    };

    $(function(){
        FLBuilder._init();
    });

})(jQuery);