/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 19);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports) {

/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

angular.module('registryUI.client', [ ])

.factory('WeakMap', function() {
    if (typeof window.WeakMap === 'function')
        return window.WeakMap;

    /*
     * A WeakMap implementation
     *
     * This works on ES5 browsers, with the caveat that the mapped
     * items are discoverable with enough work.
     *
     * To be clear, the principal use of a WeakMap is to associate
     * an value with an object, the object is the key. And then have
     * that value go away when the object does. This is very, very
     * similar to properties.
     *
     * The main difference is that any assigned values are not
     * garbage collected if the *weakmap* itself is collected,
     * and of course one can actually access the non-enumerable
     * property that makes this work.
     */

    var weak_property, local_seed = 1;
    function SimpleWeakMap() {
        var local_property = "weakmap" + local_seed;
        local_seed += 1;

        if (!weak_property)
            weak_property = Math.random().toString(36).slice(2);

        var self = this;

        self.delete = function delete_(obj) {
            var x, map = obj[weak_property];
            if (map)
                delete map[local_property];
        };

        self.has = function has(obj) {
            var map = obj[weak_property];
            return (map && local_property in map);
        };

        self.get = function get(obj) {
            var map = obj[weak_property];
            if (!map)
                return undefined;
            return map[local_property];
        };

        self.set = function set(obj, value) {
            var map = obj[weak_property];
            if (!map) {
                map = function WeakMapData() { };
                Object.defineProperty(obj, weak_property, {
                    enumerable: false, configurable: false,
                    writable: false, value: map,
                });
            }

            map[local_property] = value;
        };
    }

    return SimpleWeakMap;
});


/***/ }),
/* 3 */
/***/ (function(module, exports) {

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


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
"use strict";

/*
 * Executes callback for each stream.status.tag[x].item[y]
 * in a stream. Similar behavior to angular.forEach()
 */
function imagestreamEachTagItem(imagestream, callback, context) {
    var i, il, items;
    var t, tl, tags = (imagestream.status || {}).tags || [];
    for (t = 0, tl = tags.length; t < tl; t++) {
        items = (tags[t].items) || [];
        for (i = 0, il = items.length; i < il; i++)
            callback.call(context || null, tags[t], items[i]);
    }
}

angular.module('registryUI.images', [
    'registryUI.client',
    'registryUI.date',
    'gettext',
])

.factory('imageDockerManifest', [
    'WeakMap',
    function(WeakMap) {
        var weak = new WeakMap();

        return function imageDockerManifest(image) {
            if (!image)
                return { };
            var manifest = weak.get(image);
            if (!manifest) {
                manifest = JSON.parse(image.dockerImageManifest || "{ }");
                angular.forEach(manifest.history || [], function(item) {
                    if (typeof item.v1Compatibility == "string")
                        item.v1Compatibility = JSON.parse(item.v1Compatibility);
                });
                weak.set(image, manifest);
            }
            return manifest;
        };
    }
])

.factory('imageDockerConfig', [
    'WeakMap',
    'imageLayers',
    function(WeakMap, imageLayers) {
        var weak = new WeakMap();
        return function imageDockerConfig(image) {
            if (!image)
                return { };
            var meta, layers, compat, config = weak.get(image);
            if (!config) {
                layers = imageLayers(image);
                if (layers.length)
                    compat = layers[0].v1Compatibility;
                if (compat && compat.config) {
                    config = compat.config;
                } else {
                    meta = image.dockerImageMetadata || { };
                    if (meta.Config)
                        config = meta.Config;
                }
                weak.set(image, config);
            }
            return config || { };
        };
    }
])

.factory('imageLayers', [
    'WeakMap',
    'imageDockerManifest',
    function(WeakMap, imageDockerManifest) {
        var weak = new WeakMap();
        return function imageLayers(image) {
            if (!image)
                return [];
            var manifest, layers = weak.get(image);
            if (!layers) {
                manifest = imageDockerManifest(image);
                if (manifest.history)
                    layers = manifest.history;
                else if (image.dockerImageLayers)
                    layers = image.dockerImageLayers;
                else
                    layers = [];
                weak.set(image, layers);
            }
            return layers;
        };
    }
])

.factory('imagestreamTags', [
    'WeakMap',
    function(WeakMap) {
        var weak = new WeakMap();
        return function imagestreamTags(imagestream) {
            if (!imagestream)
                return [ ];
            var name, build, tags = weak.get(imagestream);
            if (!tags) {
                build = { };
                angular.forEach(imagestream.spec.tags, function(tag) {
                    build[tag.name] = build[tag.name] || { name: tag.name, imagestream: imagestream };
                    build[tag.name].spec = angular.copy(tag);
                });
                angular.forEach(imagestream.status.tags, function(tag) {
                    build[tag.tag] = build[tag.tag] || { name: tag.tag, imagestream: imagestream };
                    build[tag.tag].status = angular.copy(tag);
                });
                tags = [ ];
                for (name in build)
                    tags.push(build[name]);
                weak.set(imagestream, tags);
            }
            return tags;
        };
    }
])

.factory('imagestreamTagFromName', [
    function() {
        return function imagestreamFromName(imagestream, from) {
            var parts, result = [ ];
            if (from && from.kind === "ImageStreamImage")
                result.delimiter = "@";
            else if (from && from.kind === "ImageStreamTag")
                result.delimiter = ":";
            if (result.delimiter) {
                parts = from.name.split(result.delimiter);
                if (parts.length === 1) {
                    result.push(imagestream.spec.name, parts[0]);
                } else {
                    result.push(parts.shift());
                    result.push(parts.join(result.delimiter));
                }
                result.qualified = result.join(result.delimiter);
            }
            return result;
        };
    }
])

.directive('registryImageBody', [
    'imageLayers',
    'imageDockerConfig',
    function(imageLayers, imageDockerConfig) {
        return {
            restrict: 'E',
            scope: {
                image: '=',
                names: '=',
            },
            templateUrl: 'registry-image-widgets/views/image-body.html',
            link: function(scope, element, attrs) {
                scope.$watch("image", function(image) {
                    scope.layers = imageLayers(image);
                    scope.config = imageDockerConfig(image);
                    scope.labels = scope.config.Labels;
                    if (angular.equals({ }, scope.labels))
                        scope.labels = null;
                });
            }
        };
    }
])

.directive('registryImagePull', [
    function() {
        return {
            restrict: 'E',
            scope: {
                settings: '=',
                names: '=',
            },
            templateUrl: 'registry-image-widgets/views/image-pull.html'
        };
    }
])

.directive('registryImageConfig', [
    'imageDockerConfig',
    function(imageDockerConfig) {
        return {
            restrict: 'E',
            scope: {
                image: '=',
            },
            templateUrl: 'registry-image-widgets/views/image-config.html',
            link: function(scope, element, attrs) {
                scope.configCommand = function configCommand(config) {
                    var result = [ ];
                    if (!config)
                        return "";
                    if (config.Entrypoint)
                        result.push.apply(result, config.Entrypoint);
                    if (config.Cmd)
                        result.push.apply(result, config.Cmd);
                    var string = result.join(" ");
                    if (config.User && config.User.split(":")[0] != "root")
                        return "$ " + string;
                    else
                        return "# " + string;
                };

                scope.$watch("image", function(image) {
                    scope.config = imageDockerConfig(image);
                });
            }
        };
    }
])

.directive('registryImageMeta', [
    'imageDockerConfig',
    function(imageDockerConfig) {
        return {
            restrict: 'E',
            scope: {
                image: '=',
            },
            templateUrl: 'registry-image-widgets/views/image-meta.html',
            link: function(scope, element, attrs) {
                scope.$watch("image", function(image) {
                    scope.config = imageDockerConfig(image);
                    scope.labels = scope.config.Labels;
                    if (angular.equals({ }, scope.labels))
                        scope.labels = null;
                });
            }
        };
    }
])

.directive('registryImagestreamBody', [
    function() {
        return {
            restrict: 'E',
            scope: {
                imagestream: '=',
                imagestreamFunc: '&imagestreamModify',
                projectFunc: '&projectModify',
                sharingFunc: '&projectSharing',
            },
            templateUrl: 'registry-image-widgets/views/imagestream-body.html',
            link: function(scope, element, attrs) {
                scope.projectModify = scope.projectFunc();
                scope.projectSharing = scope.sharingFunc();
                scope.imagestreamModify = scope.imagestreamFunc();
            }
        };
    }
])

.directive('registryImagestreamPush', [
    function(imageDockerConfig) {
        return {
            restrict: 'E',
            scope: {
                imagestream: '=',
                settings: '=',
            },
            templateUrl: 'registry-image-widgets/views/imagestream-push.html',
        };
    }
])

.directive('registryAnnotations', [
    function() {
        return {
            restrict: 'E',
            scope: {
                annotations: '=',
            },
            templateUrl: 'registry-image-widgets/views/annotations.html',
        };
    }
])

.directive('registryImagestreamMeta', [
    function(imageDockerConfig) {
        return {
            restrict: 'E',
            scope: {
                imagestream: '=',
            },
            templateUrl: 'registry-image-widgets/views/imagestream-meta.html',
        };
    }
])

.factory('registryImageListingFunc', [
    'imagestreamTags',
    'imagestreamTagFromName',
    '$location',
    function(imagestreamTags, imagestreamTagFromName, $location) {
        return function(scope, element, attrs) {
            scope.imagestreamTags = imagestreamTags;
            scope.imagestreamPath = scope.imagestreamFunc();
            scope.imageByTag = scope.imageByTagFunc();
            scope.imageTagNames = scope.imageTagNamesFunc();
            scope.sharedImages = scope.sharedImagesFunc();
            scope.imagestreamTagFromName = imagestreamTagFromName;

            /* Called when someone clicks on a row */
            scope.imagestreamActivate = function imagestreamActivate(imagestream, tag, ev) {
                var event;
                if (scope.imagestreamExpanded(imagestream, tag)) {
                    scope.imagestreamToggle(imagestream, tag, ev);
                } else {
                    event = scope.$emit("activate", imagestream, tag, ev);
                    if (!event.defaultPrevented && scope.imagestreamPath)
                        $location.path(scope.imagestreamPath(imagestream, tag));
                }
                ev.preventDefault();
                ev.stopPropagation();
            };

            /* A list of all the expanded rows */
            var expanded = { };

            function identifier(imagestream, tag) {
                var id = imagestream.metadata.namespace + "/" + imagestream.metadata.name;
                if (tag)
                    id += "/" + tag.name;
                return id;
            }

            /* Called to check the state of an expanded row */
            scope.imagestreamExpanded = function imagestreamExpanded(imagestream, tag) {
                return identifier(imagestream, tag) in expanded;
            };

            /* Called when someone toggles a row */
            scope.imagestreamToggle = function imagestreamToggle(imagestream, tag, ev) {
                var id = identifier(imagestream, tag);
                if (id in expanded)
                    delete expanded[id];
                else
                    expanded[id] = true;
                ev.stopPropagation();
            };
        };
    }
])

.directive('registryImagestreamListing', [
    'registryImageListingFunc',
    function(imageListingFunc) {
        return {
            restrict: 'E',
            scope: {
                imagestreams: '=',
                imagestreamFunc: '&imagestreamPath',
                settings: '=',
                actions: '=',
                imageByTagFunc: '&imageByTag',
                imageTagNamesFunc: '&imageTagNames',
                sharedImagesFunc: '&sharedImages'
            },
            templateUrl: 'registry-image-widgets/views/imagestream-listing.html',
            link: imageListingFunc
        };
    }
])

.directive('registryImageListing', [
    'registryImageListingFunc',
    function(imageListingFunc) {
        return {
            restrict: 'E',
            scope: {
                imagestream: '=',
                imagestreamFunc: '&imagestreamPath',
                settings: '=',
                actions: '=',
                imageByTagFunc: '&imageByTag',
                imageTagNamesFunc: '&imageTagNames',
                sharedImagesFunc: '&sharedImages'
            },
            templateUrl: 'registry-image-widgets/views/image-listing.html',
            link: imageListingFunc
        };
    }
])

.directive('registryImagePanel', [
    'imageDockerConfig',
    'imageLayers',
    function(imageDockerConfig, imageLayers) {
        return {
            restrict: 'E',
            transclude: true,
            scope: true,
            templateUrl: 'registry-image-widgets/views/image-panel.html',
            link: function(scope, element, attrs) {
                var tab = 'main';
                scope.tab = function(name, ev) {
                    if (ev) {
                        tab = name;
                        ev.stopPropagation();
                    }
                    return tab === name;
                };

                scope.$watch(function() {
                    scope.image = scope.imageByTag(scope.tag);
                });

                scope.$watch("image", function(image) {
                    if (scope.image) {
                        scope.layers = imageLayers(scope.image);
                        scope.config = imageDockerConfig(scope.image);
                        scope.labels = scope.config.Labels;
                        if (scope.imageTagNames)
                            scope.names = scope.imageTagNames(scope.image);
                    }
                });
            }
        };
    }
])

.directive('registryImagestreamPanel', [
    function() {
        return {
            restrict: 'E',
            transclude: true,
            scope: true,
            templateUrl: 'registry-image-widgets/views/imagestream-panel.html',
            link: function(scope, element, attrs) {
                var tab = 'main';
                scope.tab = function(name, ev) {
                    if (ev) {
                        tab = name;
                        ev.stopPropagation();
                    }
                    return tab === name;
                };
            }
        };
    }
]);


}());


/***/ }),
/* 5 */
/***/ (function(module, exports) {

/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2016 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

/* globals cockpit */

(function() {
    "use strict";

    function v1CompatibilityLabel(layer, lower) {
        var cmd, last;
        if (layer.v1Compatibility.container_config) {
            cmd = layer.v1Compatibility.container_config.Cmd;
            if (cmd) {
                last = cmd[cmd.length - 1];
                if (last.indexOf("#(nop)") === 0)
                    return last.substring(6).trim();
                else if (cmd.length == 1 && cmd[0].indexOf("/bin/sh -c #(nop)") === 0)
                    return cmd[0].substring(17).trim();
                else
                    return cmd.join(" ");
            }
        }

        return layer.v1Compatibility.id;
    }

    angular.module('registryUI.images')

    .factory('prepareLayer', [
        'gettextCatalog',
        function(gettextCatalog) {
            return function prepareLayer(layer, index, layers) {
                var result;
                /* DockerImageManifest */
                if (layer.v1Compatibility) {
                    result = {
                        id: layer.v1Compatibility.id,
                        size: layer.v1Compatibility.Size || 0,
                        label: v1CompatibilityLabel(layer, layers[index + 1])
                    };

                /* DockerImageLayers */
                } else if (layer.name && layer.size) {
                    result = {
                        id: layer.name,
                        size: layer.size || 0,
                        label: layer.name,
                    };

                /* Unsupported layer type */
                } else {
                    result = {
                        size: 0,
                        id: index,
                        label: gettextCatalog.getString("Unknown layer"),
                    };
                }

                /* Some hints for coloring the display */
                if (result.label.indexOf("RUN ") === 0)
                    result.hint = "run";
                else if (result.label.indexOf("ADD ") === 0 || result.size > 8192)
                    result.hint = "add";
                else
                    result.hint = "other";

                return result;
            };
        }
    ])

    .directive('registryImageLayers', [
        'imageLayers',
        'prepareLayer',
        'gettextCatalog',
        function(imageLayers, prepareLayer, gettextCatalog) {
            return {
                restrict: 'E',
                scope: {
                    image: '=',
                    data: '=?layers',
                },
                templateUrl: 'registry-image-widgets/views/image-layers.html',
                link: function($scope, element, attributes) {
                    $scope.formatSize = function(bytes) {
                        var n;
                        if (!bytes) {
                            return "";
                        } else if (bytes > 1024 && typeof cockpit != "undefined") {
                            return cockpit.format_bytes(bytes);
                        } else if (bytes > 1024 * 1024) {
                            n = (bytes / (1024 * 1024)).toFixed(1);
                            return gettextCatalog.getPlural(n, $scope, "{0} MB", "{0} MB").replace("{0}", n);
                        } else {
                            return gettextCatalog.getPlural(n, $scope, "{0} byte", "{0} bytes").replace("{0}", bytes);
                        }
                    };

                    $scope.$watch('data', function(layers) {
                        if (layers && layers.length)
                            layers = layers.map(prepareLayer).reverse();
                        $scope.layers = layers;
                    });

                    $scope.$watch('image', function(image) {
                        /* Only digest layers if image is set, or null */
                        if (!angular.isUndefined(image))
                            $scope.data = imageLayers(image);
                    });
                }
            };
        }
    ]);

}());


/***/ }),
/* 6 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<dt ng-if=\"annotations\" translate>Annotations</dt>\n<dd ng-repeat=\"(name, value) in annotations\">{{name}}: {{value}}</dd>\n";
var id1="registry-image-widgets/views/annotations.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<dl class=\"dl-horizontal left\">\n<dt ng-if=\"labels.name\" translate>Name</dt>\n<dd ng-if=\"labels.name\">{{ labels.name }}</dd>\n<dt ng-if=\"labels.summary\" translate>Summary</dt>\n<dd ng-if=\"labels.summary\">{{ labels.summary }}</dd>\n<dt ng-if=\"labels.description\" translate>Description</dt>\n<dd ng-if=\"labels.description\">{{ labels.description }}</dd>\n<dt ng-if=\"labels.url\" translate>Source URL</dt>\n<dd ng-if=\"labels.url\">\n<a href=\"labels.url\"><i class=\"fa fa-external-link\"></i> {{ labels.url }}</a>\n</dd>\n<dt translate>Author</dt>\n<dd ng-if=\"config.author\">{{config.author}}</dd>\n<dd ng-if=\"!config.author && image.dockerImageMetadata.Author\">{{image.dockerImageMetadata.Author}}</dd>\n<dd ng-if=\"!config.author && !image.dockerImageMetadata.Author\"><em translate>Unknown</em></dd>\n<dt ng-if=\"labels['build-date'] || layers[0].v1Compatibility.created || image.dockerImageMetadata.Created\" translate>Built</dt>\n<dd ng-if=\"labels['build-date']\" title=\"{{labels['build-date']}}\">{{ labels['build-date'] | dateRelative}}</dd>\n<dd ng-if=\"!labels['build-date'] && layers[0].v1Compatibility.created\" title=\"{{layers[0].v1Compatibility.created}}\">{{ layers[0].v1Compatibility.created | dateRelative}}</dd>\n<dd ng-if=\"!labels['build-date'] && !layers[0].v1Compatibility.created && image.dockerImageMetadata.Created\" title=\"{{image.dockerImageMetadata.Created}}\">{{image.dockerImageMetadata.Created | dateRelative}}</dd>\n<dt translate>Digest</dt>\n<dd class=\"indentifier\"><tt>{{ image.metadata.name }}</tt></dd>\n<dt ng-if-start=\"config.Image\" translate>Identifier</dt>\n<dd class=\"indentifier\" ng-if-end><tt>{{ config.Image }}</tt></dd>\n</dl>\n<dl class=\"registry-image-tags\" ng-if=\"names\">\n<dt translate>Tags</dt>\n<dd><span class=\"registry-image-tag\" ng-repeat=\"name in names\">{{name}}</span>&nbsp;</dd>\n</dl>\n";
var id1="registry-image-widgets/views/image-body.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<dl class=\"dl-horizontal\">\n<dt translate>Command</dt>\n<dd><code>{{ configCommand(config) }}</code></dd>\n</dl>\n<div class=\"row\">\n<dl class=\"col-xs-12 col-sm-12 col-md-4 dl-horizontal\">\n<dt translate>Run as</dt>\n<dd ng-if=\"config.User\">{{config.User}}</dd>\n<dd ng-if=\"!config.User\"><em translate>Default</em></dd>\n<dt translate>Directory</dt>\n<dd ng-if=\"config.WorkingDir\">{{config.WorkingDir}}</dd>\n<dd ng-if=\"!config.WorkingDir\">/</dd>\n<dt ng-if=\"config.StopSignal\" translate>Stop with</dt>\n<dd ng-if=\"config.StopSignal\">{{config.StopSignal}}</dd>\n<dt translate>Architecture</dt>\n<dd ng-if=\"config.architecture\">{{config.architecture}}</dd>\n<dd ng-if=\"!config.architecture\">{{image.dockerImageMetadata.Architecture}}</dd>\n</dl>\n<dl class=\"col-xs-12 col-sm-12 col-md-8 dl-horizontal full-width\">\n<dt ng-if=\"config.Env.length\" translate>Environment</dt>\n<dd ng-repeat=\"env in config.Env\"><tt>{{env}}</tt></dd>\n</dl>\n</div>\n<div class=\"row\">\n<dl class=\"col-xs-12 col-sm-12 col-md-4 dl-horizontal\">\n<dt translate>Ports</dt>\n<dd ng-repeat=\"(port, data) in config.ExposedPorts\">{{port}}</dd>\n<dd ng-if=\"!config.ExposedPorts\"><em translate>None</em></dd>\n</dl>\n<dl class=\"col-xs-12 col-sm-12 col-md-8 dl-horizontal full-width\">\n<dt ng-if=\"config.Volumes\" translate>Volumes</dt>\n<dd ng-repeat=\"(volume, data) in config.Volumes\">{{volume}}</dd>\n</dl>\n</div>\n";
var id1="registry-image-widgets/views/image-config.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<ul class=\"registry-image-layers\">\n<li ng-repeat=\"layer in layers\" class=\"hint-{{ layer.hint }}\">\n<span title=\"{{ layer.size }}\">{{ formatSize(layer.size) }}</span>\n<p>{{ layer.label}}</p>\n</li>\n</ul>\n";
var id1="registry-image-widgets/views/image-layers.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<table class=\"listing-ct\">\n<thead>\n<tr>\n<th class=\"listing-ct-toggle\"></th>\n<th translate=\"yes\" width=\"20%\">Tag</th>\n<th translate=\"yes\">From</th>\n<th translate=\"yes\">Identifier</th>\n<th translate=\"yes\">Last Updated</th>\n</tr>\n</thead>\n<tbody ng-repeat=\"tag in imagestreamTags(imagestream) | orderBy : 'tag.name'\" ng-if=\"imagestream\" data-id=\"{{ imagestream.metadata.namespace + '/' + imagestream.metadata.name + ':' + tag.name }}\" ng-class=\"{open: imagestreamExpanded(imagestream, tag), last: $last, first: $first}\">\n<tr ng-click=\"imagestreamActivate(imagestream, tag, $event)\" class=\"listing-ct-item registry-listing\">\n<td ng-click=\"imagestreamToggle(imagestream, tag, $event)\" class=\"listing-ct-toggle\">\n<i class=\"fa fa-fw\"></i>\n</td>\n<th>\n<a class=\"registry-image-tag\" ng-href=\"{{ imagestreamPath(imagestream, tag) }}\" title=\"{{tag.name }}\">{{ tag.name }}</a>\n</th>\n<td ng-init=\"name = imagestreamTagFromName(imagestream, tag.spec.from)\">\n<div ng-if=\"!name || !tag.spec.from\"><em>pushed image</em></div>\n<div ng-if=\"name\" title=\"{{tag.spec.from.name}}\">\n<span ng-if=\"!name[0]\">{{tag.spec.from.name}}</span>\n<span ng-if=\"name[0]\">\n<span ng-if=\"name[0] === imagestream.metadata.name\">{{name.qualified}}</span>\n<span ng-if=\"name[0] !== imagestream.metadata.name\">\n<a ng-click=\"imagestreamActivate({ metadata: { namespace: tag.spec.from.namespace, name: name[0] }}, name[1], $event)\">{{tag.spec.from.name}}</a>\n</span>\n</span>\n</div>\n</td>\n<td class=\"image-identifier\">\n<div class=\"row\" ng-init=\"annotations = imagestream.metadata.annotations\">\n<div class=\"col col-xs-12\" ng-if=\"!tag.status\">\n<div ng-if=\"annotations['openshift.io/image.dockerRepositoryCheck']\">\n<span class=\"pficon pficon-warning-triangle-o\" style=\"margin-right: 5px\" ng-attr-title=\"{{annotations['openshift.io/image.dockerRepositoryCheck']}}\"></span>\n<span translate=\"yes\">Unable to resolve</span>\n</div>\n<div ng-if=\"!annotations['openshift.io/image.dockerRepositoryCheck']\">\n<span ng-if=\"!tag.spec.from\" translate=\"yes\">Not yet synced</span>\n<span ng-if=\"tag.spec.from\" translate=\"yes\">Unresolved</span>\n</div>\n</div>\n<div class=\"col col-xs-12\" ng-if=\"tag.status\">\n<span ng-if=\"tag.status.items.length &amp;&amp; tag.status.items[0].image\">\n<tt title=\"{{tag.status.items[0].image}}\">{{tag.status.items[0].image}}</tt>\n</span>\n<span ng-if=\"!tag.status.items.length\"><em translate=\"yes\">none</em></span>\n</div>\n</div>\n</td>\n<td>\n<div title=\"{{ tag.items[0].created }}\">\n<span ng-if=\"tag.status.items.length &amp;&amp; tag.status.items[0].image\" title=\"{{ tag.items[0].created }}\">\n{{ tag.status.items[0].created | dateRelative }}\n</span>\n</div>\n</td>\n</tr>\n<tr class=\"listing-ct-panel\" ng-if=\"imagestreamExpanded(imagestream, tag)\" ng-repeat-end=\"\">\n<td colspan=\"5\">\n<registry-image-panel ng-init=\"tag = tag.status\"></registry-image-panel>\n</td>\n</tr>\n</tbody>\n<thead class=\"listing-ct-empty\" ng-if=\"!quiet\">\n<tr>\n<td colspan=\"5\" ng-if=\"!failure && !imagestreamTags(imagestream)\" translate=\"yes\">No tags are present.</td>\n<td colspan=\"5\" ng-if=\"failure\">{{failure}}</td>\n</tr>\n</thead>\n</table>\n";
var id1="registry-image-widgets/views/image-listing.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<div>\n<dl class=\"dl-horizontal left\">\n<dt ng-if=\"labels\" translate>Labels</dt>\n<dd ng-repeat=\"(name, value) in labels\" ng-show=\"name != 'description' && name != 'name'\">\n<tt>{{name}}={{value}}</tt>\n</dd>\n<dt ng-if=\"config.OnBuild.length\" translate>On Build</dt>\n<dd ng-repeat=\"line in config.OnBuild\"><tt>{{line}}</tt></dd>\n<registry-annotations annotations=\"image.metadata.annotations\"></registry-annotations>\n<dt translate>Docker Version</dt>\n<dd>{{image.dockerImageMetadata.DockerVersion}}</dd>\n</dl>\n</div>\n";
var id1="registry-image-widgets/views/image-meta.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 12 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<div>\n<div class=\"listing-ct-head\">\n<div ng-if=\"actions.deleteTag\" class=\"listing-ct-actions\">\n<button class=\"btn btn-danger btn-delete pficon pficon-delete\" ng-click=\"actions.deleteTag(imagestream, tag)\"></button>\n</div>\n<ul class=\"nav nav-tabs nav-tabs-pf\">\n<li ng-class=\"{active: tab('main')}\">\n<a ng-click=\"tab('main', $event)\" translate>Image</a>\n</li>\n<li ng-class=\"{active: tab('config')}\">\n<a ng-click=\"tab('config', $event)\" translate>Container</a>\n</li>\n<li ng-class=\"{active: tab('meta')}\">\n<a ng-click=\"tab('meta', $event)\" translate>Metadata</a>\n</li>\n</ul>\n</div>\n<div class=\"listing-ct-body\" ng-show=\"tab('main')\">\n<registry-image-body image=\"image\" names=\"names\">\n</registry-image-body>\n<registry-image-pull settings=\"settings\" names=\"names\">\n</registry-image-pull>\n</div>\n<div class=\"listing-ct-body\" ng-show=\"tab('config')\">\n<registry-image-config image=\"image\">\n</registry-image-config>\n</div>\n<div class=\"listing-ct-body\" ng-if=\"tab('meta')\">\n<registry-image-meta image=\"image\">\n</registry-image-meta>\n<registry-image-layers image=\"image\" layers=\"layers\">\n</registry-image-layers>\n</div>\n</div>\n";
var id1="registry-image-widgets/views/image-panel.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 13 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<div ng-if=\"names\" class=\"registry-image-pull\">\n<p>\n<i class=\"fa fa-info-circle\"></i>\n<span translate>To pull this image:</span>\n</p>\n<code ng-if=\"!settings.registry.host\">$ sudo docker pull <span class=\"placeholder\">registry</span>/{{names[0]}}</code>\n<code ng-if=\"settings.registry.host\">$ sudo docker pull <span>{{settings.registry.host}}</span>/{{names[0]}}</code>\n</div>\n";
var id1="registry-image-widgets/views/image-pull.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 14 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<div ng-repeat=\"statustags in imagestream.status.tags\">\n<div ng-repeat=\"condition in statustags.conditions\" ng-if=\"condition.type == 'ImportSuccess' && condition.status == 'False'\" class=\"alert alert-danger\">\n<span class=\"pficon pficon-error-circle-o\"></span>\n<span translate>{{ condition.message }}. Timestamp: {{ condition.lastTransitionTime }} Error count: {{ condition.generation }}</span>\n<a translate ng-if=\"imagestreamModify\" ng-click=\"imagestreamModify(imagestream)\" class=\"alert-link\">Edit image stream</a>\n</div>\n</div>\n<dl class=\"dl-horizontal left\">\n<dt translate ng-if=\"projectSharing\">Access Policy</dt>\n<dd ng-if=\"projectSharing\" ng-switch=\"projectSharing(imagestream.metadata.namespace)\">\n<div ng-switch-when=\"anonymous\">\n<a translate ng-if=\"projectModify\" ng-click=\"projectModify(imagestream.metadata.namespace)\">Images may be pulled by anonymous users</a>\n<span translate ng-if=\"!projectModify\">Images may be pulled by anonymous users</span>\n<i title=\"Images accessible to anonymous users\" class=\"fa fa-unlock registry-imagestream-lock\"></i>\n</div>\n<div ng-switch-when=\"shared\">\n<a translate ng-if=\"projectModify\" ng-click=\"projectModify(imagestream.metadata.namespace)\">Images may be pulled by any authenticated user or group</a>\n<span translate ng-if=\"!projectModify\">Images may be pulled by any authenticated user or group</span>\n<i title=\"Images accessible to authenticated users\" class=\"fa fa-lock registry-imagestream-lock\"></i>\n</div>\n<div ng-switch-when=\"private\">\n<a translate ng-if=\"projectModify\" ng-click=\"projectModify(imagestream.metadata.namespace)\">Images may only be pulled by specific users or groups</a>\n<span translate ng-if=\"!projectModify\">Images may only be pulled by specific users or groups</span>\n<i title=\"Images only accessible to members\" class=\"fa fa-lock registry-imagestream-lock\"></i>\n</div>\n<div ng-switch-default>\n<a translate ng-if=\"projectModify\" ng-click=\"projectModify(imagestream.metadata.namespace)\">Unknown</a>\n<span translate ng-if=\"!projectModify\">Unknown</span>\n<i title=\"Unknown or invalid image access policy\" class=\"fa fa-lock registry-imagestream-lock\"></i>\n</div>\n</dd>\n<dt translate ng-if-start=\"imagestream.spec.dockerImageRepository\">Follows docker repo</dt>\n<dd ng-if-end><tt>{{imagestream.spec.dockerImageRepository}}</tt></dd>\n<dt>Pulling repository</dt>\n<dd><tt>{{imagestream.status.dockerImageRepository}}</tt></dd>\n<dt translate>Image count</dt>\n<dd ng-if=\"imagestream.status.tags.length\">{{imagestream.status.tags.length}}</dd>\n<dd ng-if=\"!imagestream.status.tags.length\">0</dd>\n</dl>\n";
var id1="registry-image-widgets/views/imagestream-body.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 15 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<table class=\"listing-ct\">\n<thead>\n<tr>\n<th class=\"listing-ct-toggle\"></th>\n<th translate=\"yes\" width=\"20%\">Name</th>\n<th translate=\"yes\">Tags</th>\n<th translate=\"yes\">Repository</th>\n</tr>\n</thead>\n<tbody ng-repeat=\"(link, imagestream) in imagestreams track by link | orderBy : 'link'\" ng-if=\"imagestreams\" data-id=\"{{ imagestream.metadata.namespace + '/' + imagestream.metadata.name }}\" class=\"active\" ng-class=\"{open: imagestreamExpanded(imagestream)}\">\n<tr ng-click=\"imagestreamActivate(imagestream, null, $event)\" class=\"listing-ct-item imagestream-item\">\n<td ng-click=\"imagestreamToggle(imagestream, null, $event)\" class=\"listing-ct-toggle\">\n<i class=\"fa fa-fw\"></i>\n</td>\n<th>\n{{ imagestream.metadata.namespace + '/' + imagestream.metadata.name }}\n<div ng-repeat=\"statustags in imagestream.status.tags\">\n<span ng-repeat=\"condition in statustags.conditions\" ng-if=\"condition.type == 'ImportSuccess' &amp;&amp; condition.status == 'False'\" class=\"pficon pficon-warning-triangle-o\"></span>\n</div>\n</th>\n<td ng-init=\"tag_count = imagestreamTags(imagestream).length\">\n<a ng-repeat=\"tag in imagestreamTags(imagestream) | orderBy : 'tag.name' | limitTo: 4\" class=\"registry-image-tag\" ng-click=\"imagestreamActivate(imagestream, tag, $event)\" title=\"{{tag.name }}\">{{ tag.name }}</a>\n<span ng-if=\"tag_count > 4\" translate-n=\"tag_count - 4\" translate translate-plural=\"and {{ $count }} others\">and {{ $count }} other</span>\n</td>\n<td>\n<span ng-if=\"!imageStream.status.dockerImageRepository && !imageStream.spec.dockerImageRepository\"><em translate>unknown</em></span>\n<span ng-if=\"imageStream.status.dockerImageRepository || imageStream.spec.dockerImageRepository\">{{imageStream.status.dockerImageRepository || imageStream.spec.dockerImageRepository}}</span>\n</td>\n</tr>\n<tr class=\"listing-ct-panel\" ng-if=\"imagestreamExpanded(imagestream)\">\n<td colspan=\"4\">\n<registry-imagestream-panel></registry-imagestream-panel>\n</td>\n</tr>\n</tbody>\n<thead class=\"listing-ct-empty\" ng-if=\"!quiet\">\n<tr>\n<td colspan=\"4\" ng-if=\"!failure && !imagestreams\" translate=\"yes\">No image streams are present.</td>\n<td colspan=\"4\" ng-if=\"failure\">{{failure}}</td>\n</tr>\n</thead>\n</table>\n";
var id1="registry-image-widgets/views/imagestream-listing.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<dl class=\"dl-horizontal left\">\n<registry-annotations annotations=\"imagestream.metadata.annotations\"></registry-annotations>\n</dl>\n";
var id1="registry-image-widgets/views/imagestream-meta.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 17 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<div>\n<div class=\"listing-ct-head\">\n<div ng-if=\"actions\" class=\"listing-ct-actions\">\n<button class=\"btn btn-danger btn-delete pficon pficon-delete\" ng-if=\"actions.deleteImageStream\" ng-click=\"actions.deleteImageStream(imagestream)\"></button>\n<button class=\"btn btn-default pficon pficon-edit\" ng-if=\"actions.modifyImageStream\" ng-click=\"actions.modifyImageStream(imagestream)\"></button>\n</div>\n<ul class=\"nav nav-tabs nav-tabs-pf\">\n<li ng-class=\"{active: tab('main')}\"><a ng-click=\"tab('main', $event)\" translate>Image stream</a></li>\n<li ng-class=\"{active: tab('meta')}\" ng-if=\"imagestream.metadata.annotations\">\n<a ng-click=\"tab('meta', $event)\" translate>Metadata</a></li>\n<li ng-class=\"{active: tab('tags')}\">\n<a ng-click=\"tab('tags', $event)\" translate>Tags</a></li>\n</ul>\n</div>\n<div class=\"listing-ct-body\" ng-show=\"tab('main')\">\n<registry-imagestream-body imagestream=\"imagestream\" imagestream-modify=\"actions.modifyImageStream\" project-modify=\"actions.modifyProject\" project-sharing=\"sharedImages\">\n</registry-imagestream-body>\n<registry-imagestream-push imagestream=\"imagestream\" settings=\"settings\">\n</registry-imagestream-push>\n</div>\n<div class=\"listing-ct-body\" ng-if=\"tab('meta')\" ng-if=\"imagestream.metadata.annotations\">\n<registry-imagestream-meta imagestream=\"imagestream\">\n</registry-imagestream-meta>\n</div>\n<div class=\"listing-ct-body\" ng-if=\"tab('tags')\">\n<div class=\"inline-tabs\">\n<registry-image-listing imagestream=\"imagestream\" image-by-tag=\"imageByTag\" settings=\"settings\" shared-images=\"sharedImages\" actions=\"actions\" image-tag-names=\"imageTagNames\">\n</registry-image-listing>\n</div>\n</div>\n</div>\n";
var id1="registry-image-widgets/views/imagestream-panel.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 18 */
/***/ (function(module, exports) {

var angular=window.angular,ngModule;
try {ngModule=angular.module(["ng"])}
catch(e){ngModule=angular.module("ng",[])}
var v1="<div class=\"registry-imagestream-push\">\n<p>\n<i class=\"fa fa-info-circle\"></i>\n<span translate>To push an image to this image stream:</span>\n</p>\n<code ng-if=\"settings.registry.host\">$ sudo docker tag <em>myimage</em> <span>{{settings.registry.host}}</span>/{{ imagestream.metadata.namespace }}/{{ imagestream.metadata.name}}:<em>tag</em>\n$ sudo docker push <span>{{settings.registry.host}}</span>/{{ imagestream.metadata.namespace }}/{{ imagestream.metadata.name}}</code>\n<code ng-if=\"!settings.registry.host\">$ sudo docker tag <em>myimage</em> <span class=\"placeholder\">registry</span>/{{ imagestream.metadata.namespace }}/{{ imagestream.metadata.name}}:<em>tag</em>\n$ sudo docker push <span class=\"placeholder\">registry</span>/{{ imagestream.metadata.namespace }}/{{ imagestream.metadata.name}}</code>\n</div>\n";
var id1="registry-image-widgets/views/imagestream-push.html";
var inj=angular.element(window.document).injector();
if(inj){inj.get("$templateCache").put(id1,v1);}
else{ngModule.run(["$templateCache",function(c){c.put(id1,v1)}]);}
module.exports=v1;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(4);
__webpack_require__(2);
__webpack_require__(3);
__webpack_require__(5);
__webpack_require__(0);
__webpack_require__(1);
__webpack_require__(6);
__webpack_require__(7);
__webpack_require__(8);
__webpack_require__(11);
__webpack_require__(9);
__webpack_require__(12);
__webpack_require__(13);
__webpack_require__(10);
__webpack_require__(14);
__webpack_require__(15);
__webpack_require__(16);
__webpack_require__(17);
module.exports = __webpack_require__(18);


/***/ })
/******/ ]);
//# sourceMappingURL=image-widgets.js.map