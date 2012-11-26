# Sparky.js

<a href="http://sparkyjs.com/" target="_blank">Visit the Website, sparkyjs.com</a>

## The Idea
Sparky.js is a client-side application scaffold which helps those who want to have organized structure in their app, but don't want to subscribe to a particular client-side MVC framework.

It provides such capabilities as a code Router, an Event system, an Ajax wrapper, and more.

Say goodbye to spaghetti JS and hello to SparkyJS

## Basics
To fully utilize Sparky's routing, a few things must be done outside of the script.

In your application, output the meta tags you see to the right with their respective content dynamically filled in with their appropriate values.

It is recommended you output the url, userid, controller, and action tags. The url will be used to simplify redirects and ajax requests, the userid will help determine whether or not a user is logged in, and the controller and action will route page-specific logic.

With the meta tags provided to the right, it'd be safe to assume that the current page the user is on is a "Following" page which is a sub-page of "Dashboard", and if the user is not logged in, -1 should be userid's default value.

Lastly, include jQuery, and the path to your Sparky application.

````
<!-- Source of http://myapp.com/dashboard/following -->

<!doctype html>
<html>
	<head>
		<meta name="url" content="http://myapp.com/">
		<meta name="controller" content="dashboard">
		<meta name="action" content="following">
		<meta name="userid" content="-1">
	</head>
	<body>
	
		<!-- Your Content -->
	
		<script type="text/javascript" src="path/to/jquery.js"></script>
		<script type="text/javascript" src="path/to/sparky.js"></script>
	</body>
</html>
````

## Utils

Now that your meta tags are set, lets explore what Sparky does. The <code>Utils</code> object is used for caching objects, outputting dynamic data, defining app settings, and routing your application.

Upon calling <code>Utils.settings.init()</code>, the object <code>Utils.settings</code> will be filled with the data that was output from the meta tags.

<code>Utils.cache</code> is good for storing references to whatever it is you may be accessing frequently

After initializing your apps settings, calling <code>Utils.home_url('auth/login?foo=bar')</code> would return <code>http://myapp.com/auth/login?foo=bar</code>.

The function <code>Utils.log</code> is a wrapper for <code>console.log</code>, so that way you may turn logging on/off via the debug variable in the settings object. The log function is made more accessible by assigning the variable <code>_log</code> to it. Making a <code>_log('is easy');</code>.

Lastly, we have the <code>Utils.route</code> function. Note: This is not to be confused with the <code>Routes</code> object. This function will loop through our <code>Routes</code> object and execute any page specific code based on the <b>controller</b> and <b>action</b>.

````
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
            Utils.settings.meta.controller = $("meta[name=controller]").attr("content");
            Utils.settings.meta.action = $("meta[name=action]").attr("content");

            Utils.settings.meta.currentUser = $("meta[name=userid]").attr("content");
            Utils.settings.meta.homeURL = $("meta[name=url]").attr("content");
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
        if (utils.settings.debug) {
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
_log = Utils.log;
````

## Routing

Routing is a big part of Sparky's charm. It is very easy to execute your page-specific logic in an organized fashion, making management of your app a breeze. With a JS loader like <a href="http://requirejs.org/" target="_blank">RequireJS</a>, you can develop dynamic, structured, and modular apps in conjunction with Sparky's architecture.

What the <code>Utils.route</code> function does is loop through the <code>Routes</code> object seen to the right. Using the variables we output in the meta tags above, we can determine what code needs to also be executed client side.

The first level of objects within the <code>Routes</code> object represent <b>controllers</b>. If your <b>controller</b> object has an <code>init</code> function, it will be called before any <b>action</b> functions. If there is a function within your <b>controller</b> object who's name matches the set <b>action</b>, that function will then be called.

<i><small>Example: There are two <b>controller</b> objects to the right, "auth" and "dashboard". If we output in our meta tags "auth" as the <b>controller</b>, <code>Routes.auth.init()</code> will be called if it exists. If the <b>action</b> is set to "register", <code>Routes.auth.register()</code> will then be called.</small></i>

````
Routes = {
	auth: function(){
		init: function(){
			if(Utils.settings.currentUser){
				window.location.href = Utils.home_url('dashboard');
			}
		},
		register: function(){
			$('#register_form').formValidate(); // Pseudo Code
		}
	},
	dashboard: {
        init: function(){
            _log('Auto Loading Dashboard Code');
            $('#stats').barChart(); // Pseudo Code
        },
        following: function() {
            _log('Doing code for the Following Page');
            $('.follow-buttons').followButton(); // Pseudo Code
        }
    }
};
````

## Ajax

Though the process of Ajax is simplified quite well with libraries like jQuery, it is beneficial to use a wrapper to avoid writing all the requests and simplify your life.

The base Ajax Object provided in Sparky allows a simple way to make your request. <code>Ajax.call</code> for POST requests, and <code>Ajax.get</code> for get requests.

A request for a "Like Button" might look like this:
						
````
Ajax.call('doLike', {pictureID: 7}, function(result){
	// Success
}, function(){
	alert('Sorry, you must be logged in for that action');
});
````
					
First parameter would be the method we want to call for our Ajax script, second parameter is the data, third is the success function, and <i>if</i> the fourth parameter is set to a function, it will fire <b>only if the user is not logged in</b>.

````
Ajax = {
	ajaxUrl: Utils.home_url('ajax'), // return http://myapp.com/ajax/
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
````

## Events

Events play an important role in Javascript and the DOM. Javasript should be used to handle the logic, but having the ability to bind events by writing HTML is a breeze, and better represents what your specific elements can do. Say goodbye to the days of messy and disorganized event binding!

Firstly, create a few HTML elements in which you want to bind events to. Using HTML5 data attributes, assigning <code>data-event</code> to an element will bind it to the function name of its value. For instance: <code>data-event="doLogin"</code> will bind it to <code>Events.endpoints.doLogin</code> if it exists.

The default event type bound to the element is the <code>click</code> event. If you wish to listen for a different type of event, add the data-attribute <code>data-method</code> to your element and it's value should be <b>the jQuery event name</b>.

If you add to the DOM and want to bind elements, you may call <code>Events.init</code> or <code>Events.bindEvents</code>. Elements that have already been bound will not be bound again, thus binding only new elements.

Provided are a few examples of the implementation of events. The <code>this</code> keyword is available, and if you need to inspect the <code>event</code> object, you may pass it as a parameter to your endpoint function.

````
<button data-event="doLogin">Login</button>

<input type="text" data-event="numsOnly" data-method="keyup">
````

````
Events = {
    endpoints: {},
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

````
<button data-binded="true" data-event="doLogin">Login</button>

<input data-binded="true" type="text" data-event="numsOnly" data-method="keyup">
````

````
Events = {
    endpoints: {
    
        doLogin: function(){
            Ajax.call('doLogin', {username:someVal, password: somePass}, function(res){
                if(res.success){
                    window.location.href = Utils.home_url('dashboard'); // Redirects to http://myapp.com/dashboard/
                } else {
                    alert('Invalid username or password');
                }
            });
        }
        
        numOnly: function(){
            this.value=this.value.replace(/[^\d]/,'');
        }
    
    },
    bindEvents: function(){},
	init: function(){}
}
````

## App &amp; Public

The <code>App</code> object is used to start Sparky, bind events, and route your code. It can also house the core of your logic if you wish. Usually, it is best to put any global logic in the <code>App</code> object.

The <code>Public</code> object is returned to allow you to publicize any functions you wish, elsewise, the scope of your functionality will be within your application itself. The <code>App.init</code> function is returned by default.

````
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