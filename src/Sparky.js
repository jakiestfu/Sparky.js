var Sparky = Sparky || (function (w, d) {

    var Utils = {}, // Your toolbox
    Ajax = {}, // Your Ajax wrapper
    Events = {}, // Event-based actions
    Routes = {}, // Your page specific logic
    App = {}, // Your global logic and initializer
    Public = {}; // Your public functions

    Utils = {
        settings: {
            debug: true,
            meta: {},
            init: function () {
                $('meta[name^="app-"]').forEach(function (element) {
                    Utils.settings.meta[element.name.replace('app-', '')] = element.content;
                });
            }
        },
        cache: {
            body: d.body
        },
        home_url: function (path) {
            if (typeof path == "undefined") {
                path = '';
            }
            return Utils.settings.meta.homeURL + path + '/';
        },
        query: function (selector) {
            var els = d.querySelectorAll(selector),
                temp = [],
            for (i in els) {
                if (typeof els[i] == 'object') {
                    temp.push(els[i]);
                }
            }
            return temp;
        },
        log: function (what) {
            if (Utils.settings.debug) {
                console.log(what);
            }
        },
        parseRoute: function (input) {

            var delimiter = input.delimiter || '/',
                paths = input.path.split(delimiter),
                check = input.target[paths.shift()],
                exists = typeof check != 'undefined',
                isLast = paths.length == 0;
            input.inits = input.inits || [];

            if (exists) {
                if (typeof check.init == 'function') {
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

        route: function () {

            Utils.parseRoute({
                path: Utils.settings.meta.route,
                target: Routes,
                delimiter: '/',
                parsed: function (res) {
                    if (res.exists && res.type == 'function') {
                        if (res.inits.length != 0) {
                            for (var i in res.inits) {
                                res.inits[i].call();
                            }
                        }
                        res.obj.call();
                    }
                }
            });

        }
    };
    _log = Utils.log;
    $ = Utils.query;

    Ajax = {};

    Events = {
        endpoints: {},
        bindEvents: function () {

            $('[data-event]').forEach(function (element) {
                var method = (element.dataset) ? element.dataset.method || 'click' : 'click',
                    name = element.dataset.event,
                    bound = element.dataset.bound == 'true';

                Utils.parseRoute({
                    path: name,
                    target: Events.endpoints,
                    delimiter: '.',
                    parsed: function (res) {
                        if (res.exists) {
                            if (!bound) {
                                element.dataset.bound = true;
                                element.addEventListener(method, res.obj);
                            }
                        }
                    }
                });
            });

        },
        init: function () {
            Events.bindEvents();
        }
    };

    Routes = {};

    App = {
        logic: {},

        init: function () {
            Utils.settings.init();
            Events.init();
            Utils.route();
        }
    };

    Public = {
        init: App.init
    };

    return Public;

})(window, document);

document.addEventListener('DOMContentLoaded', Sparky.init);
