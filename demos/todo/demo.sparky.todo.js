var ToDo = ToDo || (function($,w,d) {

	var Utils   = {}, // Your toolbox  
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
            }
        },
        cache: {
            list: $('ul')
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
			    		if(res.inits.length!=0){
			        		_log('Init functions exist', true);
			        		for(var i in res.inits){
			        			_log('Called init function', true);
			        			res.inits[i].call();
			        		}
			        	}
			        	res.obj.call();
			        }
			    }
            });
            
        } 
    };
    var _log = Utils.log;
	
    Events = {
        endpoints: {
        	lists: {
        		add: function(){
	    			var todo = $('#todo-text')[0];
	    			if(todo.value){
	    				App.logic.lists.item.add(todo.value);
	    				todo.value='';
	    			}
	    		},
	    		toggle: function(){
        			var _item = $(this),
        				index = _item.data('index'),
        				completed = _item.hasClass('complete');
        			if(completed){
        				App.logic.lists.item.incomplete(_item, index);
        			} else {
        				App.logic.lists.item.complete(_item, index);
        			}
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
    	todo: {
    		init: function(){
    			App.logic.lists.sample();
    		},
    		list: function(){
    			
    			App.logic.lists.render();
    			
    		}
    	}
    };
    
    App = {
        logic: {
        	lists: {
        		item: {
        			add: function(text){
        				var data = App.logic.lists.get();
        				data.push({todo:text,completed:false});
        				App.logic.lists.set(data);
        				App.logic.lists.render();
        			},
        			complete: function(item, index){
        				item.addClass('complete');
        				item.find('input').prop("checked", true);
        				
        				var data = App.logic.lists.get();
        				if(data[index]){
        					data[index].completed = true;
        				}
        				App.logic.lists.set(data);
        				
        			},
        			incomplete: function(item, index){
        				item.removeClass('complete');
        				item.find('input').prop("checked", false);
        				
        				var data = App.logic.lists.get();
        				if(data[index]){
        					data[index].completed = false;
        				}
        				App.logic.lists.set(data);
        			}
        		},
        		sample: function(){
        			
        			if(!App.logic.lists.get()){
        				App.logic.lists.set([
        					{todo: 'Take out trash', completed: false},
        					{todo: 'Wash Dishes', completed: false},
        					{todo: 'Slap a hoe', completed: false},
        					{todo: 'Rotate Tires', completed: false},
        					{todo: 'Code for hours', completed: false},
        					{todo: 'Practice Piano', completed: false},
        					{todo: 'Slap another hoe', completed: false},
        					{todo: 'Make dinner', completed: false},
        					{todo: 'Throw back a few brews', completed: false},
        				]);
        			}
        			
        		},
        		set: function(data){
        			localStorage.setItem('toDoList', JSON.stringify(data));
        		
        		},
        		get: function(){
        			
        			var data = localStorage.getItem('toDoList');
        			if(data){
        				return JSON.parse(data);
        			}
        			return false;
        		},
        		render: function(){
        			
        			var data = App.logic.lists.get(),
        				i;
        			Utils.cache.list.html('');
        			for(i = 0; i< data.length; i++){
        				var isComplete = data[i].completed===true ? ' class="complete"' : '',
        					shouldCheck = isComplete != '' ? ' checked="checked"' : '';
        				Utils.cache.list.append('<li'+isComplete+' data-event="lists.toggle" data-index="'+i+'"><div class="cb"><input type="checkbox"'+shouldCheck+'></div> <span>'+data[i].todo+'</span></li>');
        			}
        			Events.bindEvents();
        		}
        	}
        },
        
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

})(jQuery, window, document);

$(document).ready(ToDo.init);