/* globals moment */

(function() {

angular.module('registryUI.date', [])

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
    "dateRefreshMinute",
    function() {
        function dateRelative(timestamp) {
            if (!timestamp)
                return timestamp;
            return moment(timestamp).fromNow();
        }

        /* When moment is not loaded fall back to simple behavior */
        function dateAbsolute(timestamp) {
            return timestamp;
        }

        dateRelative.$stateful = true;
        if (typeof(moment) === 'function')
            return dateRelative;
        else
            return dateAbsolute;
    }
]);

}());

