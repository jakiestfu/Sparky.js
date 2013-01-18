var Sparky = Sparky || (function($,w,d) {

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
                route: -1,
                url: -1
            },
            init: function() {
                $('meta[name^="app-"]').each(function(){
                	Utils.settings.meta[ this.name.replace('app-','') ] = this.content;
                });
                _log('Meta saved: '+JSON.stringify(Utils.settings.meta), true);
            }
        },
        cache: {
            body: d.body
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
        newLog: function(data, pad){
	        var inner = $('.log .inner')[0],
	        	html = inner.innerHTML,
	        	c = pad ? '<div class="pad">'+data+'</div>' : data;
	        	
	        html += '<div class="entry">'+'LOG: '+c+'</div>';
	        
	        inner.innerHTML = html;
	        $('.inner')[0].scrollTop = $('.inner')[0].scrollHeight;
        },
        parseRoute: function(input) {
	        
		    var delimiter = input.delimiter || '/',
		        paths = input.path.split(delimiter),
		        check = input.target[paths.shift()],
		        exists = typeof check != 'undefined',
		        isLast = paths.length == 0;
		    input.inits = input.inits || [];
		    
		    if (exists) {
		    	if(typeof check.init == 'function'){
	    			input.inits.push(check.init);
	    		}
		    	if (isLast) {
		            input.parsed.call(undefined, {
		                exists: true,
		                type: typeof check,
		                obj: check,
		                inits: input.inits
		            });
		        } else {
		            Utils.parseRoute({
		                path: paths.join(delimiter), 
		                target: check,
		                delimiter: delimiter,
		                parsed: input.parsed,
		                inits: input.inits
		            });
		        }
		    } else {
		        input.parsed.call(undefined, {
		            exists: false
		        });
		    }
		},
		
        route: function(){
            
            Utils.parseRoute({
                path: Utils.settings.meta.route,
			    target: Routes,
			    delimiter: '/',
			    parsed: function(res) {
			    	if(res.exists && res.type=='function'){
			    		_log('Routes.'+(Utils.settings.meta.route.replace(/\//g,'.'))+' exists', true);
			        	if(res.inits.length!=0){
			        		_log('Init functions exist', true);
			        		for(var i in res.inits){
			        			res.inits[i].call();
			        		}
			        	}
			        	_log('Called Routes.'+(Utils.settings.meta.route.replace(/\//g,'.'))+' function', true);
			        	res.obj.call();
			        }
			    }
            });
            
        } 
    };
    var _log = Utils.newLog;
	
    Ajax = {
        
    };

    Events = {
        endpoints: {
        	square: {
        		clicked: function(e){
        			e.preventDefault();
        			_log('Element Clicked');
        		},
        		moused: function(){
        			_log('Element Hovered');
        		}
        	}
        },
        bindEvents: function(){
        	
        	$('[data-event]').each(function(){
        		var _this = this,
        			method = _this.dataset.method || 'click',
        			name = _this.dataset.event,
        			bound = _this.dataset.bound;
        		if(!bound){
	        		Utils.parseRoute({
			            path: name,
					    target: Events.endpoints,
					    delimiter: '.',
					    parsed: function(res) {
					    	if(res.exists){
					    		_log('Events.endpoints.'+name+' exists, binding on'+method+' to it', true);
					    		_this.dataset.bound = true;
					    		$(_this).on(method, function(e){ 
					        		res.obj.call(_this, e);
					        	});
					       }
					    }
			        });
		        }
        	});
        	
        },
        init: function(){
            Events.bindEvents();
        }
    };
    
    Routes = {
    	dashboard: {
    		init: function(){ _log('Dashboard Init', true); },
    		user: {
    			init: function(){ _log('User Init', true); },
    			stats: {
    				init: function(){ _log('Stats Init', true); },
    				all: function(){
    					_log('Viewing All Stats for User', true);
    				}
    			}
    		}
    	}
    };
    
    App = {
        logic: {},
        
        init: function() {
        	_log('Initializing Settings');
            Utils.settings.init();
        	_log('Settings Initialized', true);
        	
        	_log('Binding Events');
            Events.init();
            _log('Event Bound', true);
            
            _log('Routing Code');
            Utils.route();
            _log('Code Routed', true);
        }
    };
    
    Public = {
        init: App.init  
    };

    return Public;

})(jQuery, window, document);

$(document).ready(Sparky.init);