# Sparky.js

<a href="http://sparkyjs.com/" target="_blank">Visit the Website, sparkyjs.com</a>

## The Idea
Sparky.js is a client-side application scaffold which helps those who want to have organized structure in their app, but don't want to subscribe to a particular client-side MVC framework.

It provides such capabilities as a code Router, an Event system, an Ajax wrapper, and more.

Sparky.js ***is not*** a solution for javascript-powered web-apps, rather, it's a base for websites that are javascript heavy.

Say goodbye to spaghetti JS, and hello to SparkyJS!

## Basics
To fully utilize Sparky's routing, a few things must be done outside of the script.

In your application, output the meta tags you see to the right with their respective content dynamically filled in with their appropriate values.

Prepend the name of your `meta` attributes with `"app-"`. Sparky will retrieve those values during initialization and save them as settings. To fully utilize Sparkys Ajax, Utils, and Routing, it is recommended you use <code>app-url</code> and `app-route` with their respective values.

Include jQuery, and the path to your Sparky application, and you're off.

````html
<!doctype html>
<html>
    <head>
        <meta name="app-url" content="http://myapp.com/">
        <meta name="app-route" content="dashboard/following">
		
        <meta name="app-foo" content="bar">
    </head>
    <body>
	
        <!-- Your Content -->
	
        <!-- jQuery optional -->
        <script type="text/javascript" src="path/to/jquery.js"></script>
        <script type="text/javascript" src="path/to/myapp.sparky.js"></script>
    </body>
</html>
````

## Utils

Now that your meta tags are set, lets explore what Sparky does. The `Utils` object is used for caching objects, outputting dynamic data, defining app settings, and routing your application.

Upon calling `Utils.settings.init()`, the object `Utils.settings` will be filled with the data that was output from the meta tags (excluding the `app-` text that was prepended to the names.`).

`Utils.cache` is good for storing references to whatever it is you may be accessing frequently

After initializing your apps settings, calling `Utils.home_url('auth/login?foo=bar')` would return `http://myapp.com/auth/login?foo=bar`.

The function `Utils.log` is a wrapper for `console.log`, so that way you may turn logging on/off via the debug variable in the settings object. The log function is made more accessible by assigning the variable `_log` to it. Making a `_log('is easy');`.

A new addition to Sparky.js is <a href="https://github.com/jakiestfu/ParseObject.js" target="_blank">ParseObject.js</a>, a simple but powerful way to test against an objects existence from a string with any type of unique delimiters. The `parseRoute` function is used for Events and Routing.

Lastly, we have the `Utils.route` function. Note: This is not to be confused with the `Routes` object. This function will extract our route as defined in our settings, and see if a relative object exists within the `Routes` object.

````javascript
Utils = {
    settings: {
        debug: true,
        meta: {},
        init: function() {
            $('meta[name^="app-"]').each(function(){
            	Utils.settings.meta[ this.name.replace('app-','') ] = this.content;
            });
        }
    },
    cache: {},
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
		        		for(var i in res.inits){
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
````

## Routing

Routing is a big part of Sparky's charm. It is very easy to execute your page-specific logic in an organized fashion, making management of your app a breeze. With a JS loader like <a href="http://requirejs.org/" target="_blank">RequireJS</a>, you can develop dynamic, structured, and modular apps in conjunction with Sparky's architecture.

Lastly, we have the `Utils.route` function. Note: This is not to be confused with the `Routes` object. This function will extract our route as defined in our settings, and see if a relative object exists within the `Ruotes` object.

The following routes would produce the following values if they were called in conjunction with a `Route` object to the right:
						
* `foo/bar`: `"bar function"`
* `sample/any`: `""` (`any` is not a function)
* `sample/any/depth/allowed`: `"depth init function", "allowed function"`
						
If your route exists, and if there were any functions named `init` within your object literals, they will be qued and then called in the order they were read, allowing you to apply global logic to higher routes while trickling down to fine tune your code.

````javascript
var Routes = {
	foo: {
		bar: function(){
			_log('bar function');
		}
	},
	sample: {
		any: {
			depth: {
				init: function(){
					_log('depth init function');
				},
				allowed: function(){
					_log('allowed function');
				}
			}
		}
	}
};
````

## Ajax

Though the process of Ajax is simplified quite well with libraries like jQuery, it is beneficial to use a wrapper to avoid writing all the requests and simplify your life.

The base Ajax Object provided in Sparky allows a simple way to make your request. `Ajax.call` for POST requests, and `Ajax.get` for get requests.

A request for a "Like Button" might look like this:

````javascript
Ajax.call('doLike', {pictureID: 7}, function(result){
	// Success
});
````				

First parameter would be the method we want to call for our Ajax script, second parameter is the data, and the third is the success function. Using a wrapper is beneficial, for example: You could output `app-userid` in your meta, and determine whether or not a user is logged in before they even make an ajax request.

````javascript
Ajax = {
    ajaxUrl: Utils.home_url('ajax'),
    send: function(type, method, data, returnFunc){
    	$.ajax({
            type:'POST',
            url: Ajax.ajaxUrl+method,
            dataType:'json',
            data: data,
            success: returnFunc
        });
    },
    call: function(method, data, returnFunc){
        Ajax.send('POST', method, data, returnFunc);
    },
    get: function(method, data, returnFunc){
		Ajax.send('GET', method, data, returnFunc);
    }
};
````

## Events

Events play an important role in Javascript and the DOM. Javasript should be used to handle the logic, but having the ability to bind events by writing HTML is a breeze, and better represents what your specific elements can do. Say goodbye to the days of messy and disorganized event binding!

Firstly, create a few HTML elements in which you want to bind events to. Using HTML5 data attributes, assigning `data-event` to an element will bind it to the function name of its value. For instance: `data-event="foo.bar"` will bind it to `Events.endpoints.foo.bar` function if it exists.

Events, unlike routes, are delimited by a dot `.` but can be changed to whatever you'd like.

The default event type bound to the element is the `click` event. If you wish to listen for a different type of event, add the data-attribute `data-method` to your element and it's value should be it's respective event type.

If you add to the DOM and want to bind elements, you may call `Events.init()` or `Events.bindEvents()`. Elements that have already been bound will not be bound again, thus binding only new elements.

Provided are a few examples of the implementation of events. The `this` keyword is available, and if you need to inspect the `event` object, you may pass it as a parameter to your endpoint function.

````html
<button data-event="auth.login">Login</button>

<input type="text" data-event="inputs.filters.numOnly" data-method="keyup" />
````

````javascript
Events = {
    endpoints: {[...]},
    bindEvents: function(){
		$('[data-event]').each(function(){
			var $this = $(this),
                method = $this.attr('data-method') || 'click',
                name = $this.attr('data-event'),
                binded = $this.attr('data-binded')=='true';
			
			if(typeof Events.endpoints[name] != 'undefined'){
				if(!binded){
					$this.attr('data-binded', 'true');
					$this.on(method, Events.endpoints[name]);
				}
			}
		});
	},
	init: function(){
        Events.bindEvents();
	}
}
````

````html
<button data-binded="true" data-event="doLogin">Login</button>

<input data-binded="true" type="text" data-event="numsOnly" data-method="keyup" />
````

````javascript
Events = {
    endpoints: {
        auth: {
        	login: function(e){
        		// Your Code
        	}
        },
        inputs: {
        	filters: {
        		numOnly: function(e){
        			// Your Code
        		}
        	}
        }
    
    },
    bindEvents: function(){[...]},
	init: function(){[...]}
}
````

## App &amp; Public

The `App` object is used to start Sparky, bind events, and route your code. It can also house the core of your logic if you wish. Usually, it is best to put any global logic in the `App` object.

The `Public` object is returned to allow you to publicize any functions you wish, elsewise, the scope of your functionality will be within your application itself. The `App.init` function is returned by default.

````javascript
App = {
    /*
     * Add any additional functions/objects you want here, 
     * usually functions that will execute on every page or
     * beefy worker functions
     */
    logic: {},
    init: function() {

        // Collect our settings and info
        Utils.settings.init();
        
        // Bind events to the DOM
        Events.init();
        
        // Execute page-specific code
        Utils.route();

    }
};

/*
 * Return function you want to have accessible globally
 * Sparky.init() => App.init()
 */
Public = {
    init: App.init  
};
````
