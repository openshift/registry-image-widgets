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
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(8);
	__webpack_require__(10);
	__webpack_require__(11);
	__webpack_require__(12);
	__webpack_require__(13);
	module.exports = __webpack_require__(14);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ function(module, exports) {

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
	function imagestreamEachTagItem(stream, callback, context) {
	    var i, il, items;
	    var t, tl, tags = (stream.status || {}).tags || [];
	    for (t = 0, tl = tags.length; t < tl; t++) {
	        items = (tags[t].items) || [];
	        for (i = 0, il = items.length; i < il; i++)
	            callback.call(context || null, tags[t], items[i]);
	    }
	}
	
	angular.module('kubernetesUI.images', [
	    'kubernetesUI.client',
	    'kubernetesUI.date',
	])
	
	.factory('imageDockerManifest', [
	    'WeakMap',
	    function(WeakMap) {
	        var weak = new WeakMap();
	
	        return function imageDockerManifest(image) {
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
	
	/*
	* image
	* labels
	* config
	* layers
	* names
	* settings
	*/
	
	.directive('imageBody', [
	    'imageLayers',
	    'imageDockerConfig',
	    function(imageLayers, imageDockerConfig) {
	        return {
	            restrict: 'E',
	            scope: {
	                image: '=',
	                settings: '=',
	                names: '=',
	            },
	            templateUrl: 'kubernetes-image-widgets/views/image-body.html',
	            link: function(scope, element, attrs) {
	                scope.$watch("image", function(image) {
	                    scope.layers = imageLayers(image);
	                    scope.config = imageDockerConfig(image);
	                    scope.labels = scope.config.Labels || { };
	                });
	            }
	        };
	    }
	])
	
	.directive('imageConfig', [
	    'imageDockerConfig',
	    function(imageDockerConfig) {
	        return {
	            restrict: 'E',
	            scope: {
	                image: '=',
	            },
	            templateUrl: 'kubernetes-image-widgets/views/image-config.html',
	            link: function(scope, element, attrs) {
	                scope.$watch("image", function(image) {
	                    scope.config = imageDockerConfig(image);
	                });
	            }
	        };
	    }
	])
	
	.directive('imageMeta', [
	    'imageDockerConfig',
	    function(imageDockerConfig) {
	        return {
	            restrict: 'E',
	            scope: {
	                image: '=',
	            },
	            templateUrl: 'kubernetes-image-widgets/views/image-meta.html',
	            link: function(scope, element, attrs) {
	                scope.$watch("image", function(image) {
	                    scope.config = imageDockerConfig(image);
	                    scope.labels = scope.config.Labels || { };
	                });
	            }
	        };
	    }
	]);
	
	}());


/***/ },
/* 5 */
/***/ function(module, exports) {

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
	
	angular.module('kubernetesUI.client', [ ])
	
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


/***/ },
/* 6 */
/***/ function(module, exports) {

	/* globals moment */
	
	(function() {
	
	angular.module('kubernetesUI.date', [])
	
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
	


/***/ },
/* 7 */
/***/ function(module, exports) {

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
	
	    function prepareLayer(layer, index, layers) {
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
	                label: "Unknown layer",
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
	    }
	
	    angular.module('kubernetesUI.images')
	
	    .directive('imageLayers', [
	        'imageLayers',
	        function(imageLayers) {
	            return {
	                restrict: 'E',
	                scope: {
	                    image: '=',
	                    data: '=?layers',
	                },
	                templateUrl: 'kubernetes-image-widgets/views/image-layers.html',
	                link: function($scope, element, attributes) {
	                    $scope.formatSize = function(bytes) {
	                        if (!bytes)
	                            return "";
	                        else if (bytes > 1024 && typeof cockpit != "undefined")
	                            return cockpit.format_bytes(bytes);
	                        else
	                            return bytes + " B";
	                    };
	
	                    $scope.$watch('data', function(layers) {
	                        if (layers && layers.length)
	                            layers = layers.map(prepareLayer).reverse();
	                        $scope.layers = layers;
	                    });
	
	                    $scope.$watch('image', function(image) {
	                        $scope.data = imageLayers(image);
	                    });
	                }
	            };
	        }
	    ]);
	
	}());


/***/ },
/* 8 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 9 */,
/* 10 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 11 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<dl> <dt ng-if=\"labels.name\" translatable=\"yes\">Name</dt> <dd ng-if=\"labels.name\">{{ labels.name }}</dd> <dt ng-if=\"labels.summary\" translatable=\"yes\">Summary</dt> <dd ng-if=\"labels.summary\">{{ labels.summary }}</dd> <dt ng-if=\"labels.description\" translatable=\"yes\">Description</dt> <dd ng-if=\"labels.description\">{{ labels.description }}</dd> <dt ng-if=\"labels.url\" translatable=\"yes\">Source URL</dt> <dd ng-if=\"labels.url\" translatable=\"yes\"> <a href=\"labels.url\"><i class=\"fa fa-external-link\"></i> {{ labels.url }}</a> </dd> <dt translatable=\"yes\">Author</dt> <dd ng-if=\"config.author\">{{config.author}}</dd> <dd ng-if=\"!config.author && image.dockerImageMetadata.Author\">{{image.dockerImageMetadata.Author}}</dd> <dd ng-if=\"!config.author && !image.dockerImageMetadata.Author\"><em translatable=\"yes\">Unknown</em></dd> <dt ng-if=\"labels['build-date'] && layers[0].v1Compatibility.created\" translatable=\"yes\">Built</dt> <dd ng-if=\"labels['build-date']\" title=\"{{labels['build-date']}}\">{{ labels['build-date'] | dateRelative}}</dd> <dd ng-if=\"!labels['build-date'] && layers[0].v1Compatibility.created\" title=\"{{layers[0].v1Compatibility.created}}\">{{ layer.v1Compatibility.created | dateRelative}}</dd> <dd ng-if=\"!labels['build-date'] && !layers[0].v1Compatibility.created\" title=\"{{image.dockerImageMetadata.Created}}\">{{image.dockerImageMetadata.Created | dateRelative}}</dd> <dt translatable=\"yes\">Digest</dt> <dd><tt>{{ image.metadata.name }}</tt></dd> <dt translatable=\"yes\">Identifier</dt> <dd><tt>{{ config.Image }}</tt></dd> </dl> <dl class=\"image-tags\" ng-if=\"names\"> <dt translatable=\"yes\">Tags</dt> <dd><span class=\"image-tag\" ng-repeat=\"name in names\">{{name}}</span></dd> </dl> <div ng-if=\"names\"> <p> <i class=\"fa fa-info-circle\"></i>\n<span translatable=\"yes\">To pull this image:</span> </p> <pre ng-if=\"!settings.registry.host\">$ sudo docker pull <span ng-class=\"placeholder\">registry</span>/{{names[0]}}</pre> <pre ng-if=\"settings.registry.host\">$ sudo docker pull <span>{{settings.registry.host}}</span>/{{names[0]}}</pre> </div>";
	ngModule.run(["$templateCache",function(c){c.put("kubernetes-image-widgets/views/image-body.html",v1)}]);
	module.exports=v1;

/***/ },
/* 12 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<pre>{{ configCommand(config) }}</pre> <div class=\"row\"> <dl class=\"col-xs-12 col-sm-12 col-md-4\"> <dt translatable=\"yes\">Run as</dt> <dd ng-if=\"config.User\">{{config.User}}</dd> <dd ng-if=\"!config.User\"><em translatable=\"yes\">Default</em></dd> <dt translatable=\"yes\">Directory</dt> <dd ng-if=\"config.WorkingDir\">{{config.WorkingDir}}</dd> <dd ng-if=\"!config.WorkingDir\">/</dd> <dt ng-if=\"config.StopSignal\" translatable=\"yes\">Stop with</dt> <dd ng-if=\"config.StopSignal\">{{config.StopSignal}}</dd> <dt translatable=\"yes\">Architecture</dt> <dd ng-if=\"config.architecture\">{{config.architecture}}</dd> <dd ng-if=\"!config.architecture\">{{image.dockerImageMetadata.Architecture}}</dd> </dl> <dl class=\"col-xs-12 col-sm-12 col-md-8 full-width\"> <dt ng-if=\"config.Env.length\" translatable=\"yes\">Environment</dt> <dd ng-repeat=\"env in config.Env\"><tt>{{env}}</tt></dd> </dl> </div> <div class=\"row\"> <dl class=\"col-xs-12 col-sm-12 col-md-4\"> <dt translatable=\"yes\">Ports</dt> <dd ng-repeat=\"(port, data) in config.ExposedPorts\">{{port}}</dd> <dd ng-if=\"!config.ExposedPorts\"><em translatable=\"yes\">None</em></dd> </dl> <dl class=\"col-xs-12 col-sm-12 col-md-8 full-width\"> <dt ng-if=\"config.Volumes\" translatable=\"yes\">Volumes</dt> <dd ng-repeat=\"(volume, data) in config.Volumes\">{{volume}}</dd> </dl> </div>";
	ngModule.run(["$templateCache",function(c){c.put("kubernetes-image-widgets/views/image-config.html",v1)}]);
	module.exports=v1;

/***/ },
/* 13 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div> <dl> <dt ng-if=\"labels\" translatable=\"yes\">Labels</dt> <dd ng-repeat=\"(name, value) in labels\" ng-show=\"name != 'description' && name != 'name'\"> <tt>{{name}}={{value}}</tt> </dd> <dt ng-if=\"config.OnBuild.length\" translatable=\"yes\">On Build</dt> <dd ng-repeat=\"line in config.OnBuild\"><tt>{{line}}</tt></dd> <dt ng-if=\"image.metadata.annotations\" translatable=\"yes\">Annotations</dt> <dd ng-repeat=\"(name, value) in image.metadata.annotations\">{{name}}: {{value}}</dd> <dt translatable=\"yes\">Docker Version</dt> <dd>{{image.dockerImageMetadata.DockerVersion}}</dd> </dl> <div ng-if=\"layers.length\" class=\"image-metadata-layers\"> <p>{{ layers.length }} <span translatable=\"yes\">Image Layers</span></p> <image-layers layers=\"layers\"> </image-layers> </div> </div>";
	ngModule.run(["$templateCache",function(c){c.put("kubernetes-image-widgets/views/image-meta.html",v1)}]);
	module.exports=v1;

/***/ },
/* 14 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<ul class=\"image-layers\"> <li ng-repeat=\"layer in layers\" class=\"hint-{{ layer.hint }}\"> <span title=\"{{ layer.size }}\">{{ formatSize(layer.size) }}</span> <p>{{ layer.label}}</p> </li> </ul>";
	ngModule.run(["$templateCache",function(c){c.put("kubernetes-image-widgets/views/image-layers.html",v1)}]);
	module.exports=v1;

/***/ }
/******/ ]);
//# sourceMappingURL=images.js.map