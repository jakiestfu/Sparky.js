# Sparky.js

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
&lt;!-- Source of http://myapp.com/dashboard/following --&gt;

&lt;!doctype html&gt;
&lt;html&gt;
	&lt;head&gt;
		&lt;meta name=&quot;url&quot; content=&quot;http://myapp.com/&quot;&gt;
		&lt;meta name=&quot;controller&quot; content=&quot;dashboard&quot;&gt;
		&lt;meta name=&quot;action&quot; content=&quot;following&quot;&gt;
		&lt;meta name=&quot;userid&quot; content=&quot;-1&quot;&gt;
	&lt;/head&gt;
	&lt;body&gt;
	
		&lt;!-- Your Content --&gt;
	
		&lt;script type=&quot;text/javascript&quot; src=&quot;path/to/jquery.js&quot;&gt;&lt;/script&gt;
		&lt;script type=&quot;text/javascript&quot; src=&quot;path/to/sparky.js&quot;&gt;&lt;/script&gt;
	&lt;/body&gt;
&lt;/html&gt;
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