var Sparky = Sparky || (function($) {

    var Utils   = {}, // Your toolbox  
        Ajax    = {}, // Your Ajax wrapper
        Events  = {}, // Event-based actions      
        Routes  = {}, // Your page specific logic   
        App     = {}, // Your global logic and initializer
        Public  = {}; // Your public functions

    Utils = {
        settings: {
            debug: true,
            meta: {
                controller: -1,
                action: -1,
                currentUser: -1,
                homeURL: -1
            },
            init: function() {
                
                Utils.settings.meta.controller = $('meta[name="controller"]').attr("content");
                Utils.settings.meta.action = $('meta[name="action"]').attr("content");
		
				Utils.settings.meta.currentUser = $('meta[name="userid"]').attr("content");
				Utils.settings.meta.homeURL = $('meta[name="url"]').attr("content");
                
            }
        },
        cache: {
            window: window,
            document: document
        },
        home_url: function(path){
            if(typeof path=="undefined"){
                path = '';
            }
            return Utils.settings.meta.homeURL+path+'/';            
        },
        log: function(what) {
            if (Utils.settings.debug) {
                console.log(what);
            }
        },
        route: function(){
            
            var controller = Utils.settings.meta.controller;
            var action = Utils.settings.meta.action;
    
            if(typeof Routes[controller] != 'undefined'){
                if(typeof Routes[controller].init != 'undefined'){
                    
                    Routes[controller].init.call();         
                }
    
                if(typeof Routes[controller][action] != 'undefined'){
                    
                    Routes[controller][action].call();              
                }
            }
            
        } 
    };
    var _log = Utils.log;
	
    Ajax = {
        ajaxUrl: Utils.home_url('ajax'),
        checkAuth: function(returnFunc){
            if(typeof returnFunc == 'function' && Utils.settings.meta.currentUser==-1){
                returnFunc.call();
                return false;
            }
        },
        call: function(method, data, returnFunc, authRequiredFunc){
            
            Ajax.checkAuth(authRequiredFunc);

            $.ajax({
                type:'POST',
                url: Ajax.ajaxUrl+method,
                dataType:'json',
                data: data,
                success: returnFunc
            });
        },
        get: function(method, data, returnFunc, authRequiredFunc){

            Ajax.checkAuth(authRequiredFunc);

            $.ajax({
                type:'GET',
                url: Ajax.ajaxUrl+method,
                dataType:'json',
                data: data,
                success: returnFunc
            });
        }
    };

    Events = {
        endpoints: {},
        bindEvents: function(){
            
            $('[data-event]').each(function(){
                var $this = $(this),
                    method = $this.attr('data-method') || 'click',
                    name = $this.attr('data-event'),
                    bound = $this.attr('data-bound')=='true';

                if(typeof Events.endpoints[name] != 'undefined'){
                    if(!bound){
                        $this.attr('data-bound', 'true');
                        $this.on(method, Events.endpoints[name]);
                    }
                }
            });
            
        },
        init: function(){
            Events.bindEvents();
        }
    };
    Routes = {};
    App = {
        logic: {},
        init: function() {
            
            Utils.settings.init();
            Events.init();   
            Utils.route();    
            
        }
    };
    
    Public = {
        init: App.init  
    };

    return Public;

})(window.jQuery);

jQuery(document).ready(Sparky.init);