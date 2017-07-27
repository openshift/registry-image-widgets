/* globals moment */

(function() {

angular.module('registryUI.date', [])

.provider("MomentLib", [
    function() {
        var self = this;

        /* Until we come up with a good default implementation, must be provided */
        self.MomentLibFactory = "globalMoment";

        function load(injector, name) {
            if (angular.isString(name))
                return injector.get(name, "MomentLib");
            else
                return injector.invoke(name);
        }

        self.$get = [
            "$injector",
            function($injector) {
                return load($injector, self.MomentLibFactory);
            }
        ];
    }
])

.factory("globalMoment", [
    function() {
        return moment;
    }
])

.factory('dateRefreshMinute', [
    "$rootScope",
    function($rootScope) {
        var interval = null;
        return {
            enable: function() {
                if (interval === null) {
                    interval = window.setInterval(function() {
                        $rootScope.$applyAsync();
                    }, 60000);
                }
            },
            disable: function() {
                if (interval !== null) {
                    window.clearInterval(interval);
                    interval = null;
                }
            },
        };
    }
])

.filter('dateRelative', [
    "MomentLib",
    "dateRefreshMinute",
    function(momentLib) {
        function dateRelative(timestamp) {
            if (!timestamp)
                return timestamp;
            return momentLib(timestamp).fromNow();
        }

        /* When moment is not loaded fall back to simple behavior */
        function dateAbsolute(timestamp) {
            return timestamp;
        }

        dateRelative.$stateful = true;
        if (typeof(momentLib) === 'function')
            return dateRelative;
        else
            return dateAbsolute;
    }
]);

}());
