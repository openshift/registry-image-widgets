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
	__webpack_require__(14);
	__webpack_require__(15);
	__webpack_require__(16);
	__webpack_require__(17);
	module.exports = __webpack_require__(18);


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


/***/ },
/* 6 */
/***/ function(module, exports) {

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
	var v1="<dl class=\"dl-horizontal left\"> <dt ng-if=\"labels.name\" translate>Name</dt> <dd ng-if=\"labels.name\">{{ labels.name }}</dd> <dt ng-if=\"labels.summary\" translate>Summary</dt> <dd ng-if=\"labels.summary\">{{ labels.summary }}</dd> <dt ng-if=\"labels.description\" translate>Description</dt> <dd ng-if=\"labels.description\">{{ labels.description }}</dd> <dt ng-if=\"labels.url\" translate>Source URL</dt> <dd ng-if=\"labels.url\"> <a href=\"labels.url\"><i class=\"fa fa-external-link\"></i> {{ labels.url }}</a> </dd> <dt translate>Author</dt> <dd ng-if=\"config.author\">{{config.author}}</dd> <dd ng-if=\"!config.author && image.dockerImageMetadata.Author\">{{image.dockerImageMetadata.Author}}</dd> <dd ng-if=\"!config.author && !image.dockerImageMetadata.Author\"><em translate>Unknown</em></dd> <dt ng-if=\"labels['build-date'] || layers[0].v1Compatibility.created || image.dockerImageMetadata.Created\" translate>Built</dt> <dd ng-if=\"labels['build-date']\" title=\"{{labels['build-date']}}\">{{ labels['build-date'] | dateRelative}}</dd> <dd ng-if=\"!labels['build-date'] && layers[0].v1Compatibility.created\" title=\"{{layers[0].v1Compatibility.created}}\">{{ layers[0].v1Compatibility.created | dateRelative}}</dd> <dd ng-if=\"!labels['build-date'] && !layers[0].v1Compatibility.created && image.dockerImageMetadata.Created\" title=\"{{image.dockerImageMetadata.Created}}\">{{image.dockerImageMetadata.Created | dateRelative}}</dd> <dt translate>Digest</dt> <dd><tt>{{ image.metadata.name }}</tt></dd> <dt translate>Identifier</dt> <dd><tt>{{ config.Image }}</tt></dd> </dl> <dl class=\"registry-image-tags\" ng-if=\"names\"> <dt translate>Tags</dt> <dd><span class=\"registry-image-tag\" ng-repeat=\"name in names\">{{name}}</span></dd> </dl>";
	ngModule.run(["$templateCache",function(c){c.put("registry-image-widgets/views/image-body.html",v1)}]);
	module.exports=v1;

/***/ },
/* 12 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<dl class=\"dl-horizontal\"> <dt translate>Command:</dt> <dd><code>{{ configCommand(config) }}</code></dd> </dl> <div class=\"row\"> <dl class=\"col-xs-12 col-sm-12 col-md-4 dl-horizontal\"> <dt translate>Run as</dt> <dd ng-if=\"config.User\">{{config.User}}</dd> <dd ng-if=\"!config.User\"><em translate>Default</em></dd> <dt translate>Directory</dt> <dd ng-if=\"config.WorkingDir\">{{config.WorkingDir}}</dd> <dd ng-if=\"!config.WorkingDir\">/</dd> <dt ng-if=\"config.StopSignal\" translate>Stop with</dt> <dd ng-if=\"config.StopSignal\">{{config.StopSignal}}</dd> <dt translate>Architecture</dt> <dd ng-if=\"config.architecture\">{{config.architecture}}</dd> <dd ng-if=\"!config.architecture\">{{image.dockerImageMetadata.Architecture}}</dd> </dl> <dl class=\"col-xs-12 col-sm-12 col-md-8 dl-horizontal full-width\"> <dt ng-if=\"config.Env.length\" translate>Environment</dt> <dd ng-repeat=\"env in config.Env\"><tt>{{env}}</tt></dd> </dl> </div> <div class=\"row\"> <dl class=\"col-xs-12 col-sm-12 col-md-4 dl-horizontal\"> <dt translate>Ports</dt> <dd ng-repeat=\"(port, data) in config.ExposedPorts\">{{port}}</dd> <dd ng-if=\"!config.ExposedPorts\"><em translate>None</em></dd> </dl> <dl class=\"col-xs-12 col-sm-12 col-md-8 dl-horizontal full-width\"> <dt ng-if=\"config.Volumes\" translate>Volumes</dt> <dd ng-repeat=\"(volume, data) in config.Volumes\">{{volume}}</dd> </dl> </div>";
	ngModule.run(["$templateCache",function(c){c.put("registry-image-widgets/views/image-config.html",v1)}]);
	module.exports=v1;

/***/ },
/* 13 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div> <dl class=\"dl-horizontal left\"> <dt ng-if=\"labels\" translate>Labels</dt> <dd ng-repeat=\"(name, value) in labels\" ng-show=\"name != 'description' && name != 'name'\"> <tt>{{name}}={{value}}</tt> </dd> <dt ng-if=\"config.OnBuild.length\" translate>On Build</dt> <dd ng-repeat=\"line in config.OnBuild\"><tt>{{line}}</tt></dd> <dt ng-if=\"image.metadata.annotations\" translate>Annotations</dt> <dd ng-repeat=\"(name, value) in image.metadata.annotations\">{{name}}: {{value}}</dd> <dt translate>Docker Version</dt> <dd>{{image.dockerImageMetadata.DockerVersion}}</dd> </dl> </div>";
	ngModule.run(["$templateCache",function(c){c.put("registry-image-widgets/views/image-meta.html",v1)}]);
	module.exports=v1;

/***/ },
/* 14 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<ul class=\"registry-image-layers\"> <li ng-repeat=\"layer in layers\" class=\"hint-{{ layer.hint }}\"> <span title=\"{{ layer.size }}\">{{ formatSize(layer.size) }}</span> <p>{{ layer.label}}</p> </li> </ul>";
	ngModule.run(["$templateCache",function(c){c.put("registry-image-widgets/views/image-layers.html",v1)}]);
	module.exports=v1;

/***/ },
/* 15 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div ng-if=\"names\" class=\"registry-image-pull\"> <p> <i class=\"fa fa-info-circle\"></i>\n<span translate>To pull this image:</span> </p> <code ng-if=\"!settings.registry.host\">$ sudo docker pull <span class=\"placeholder\">registry</span>/{{names[0]}}</code>\n<code ng-if=\"settings.registry.host\">$ sudo docker pull <span>{{settings.registry.host}}</span>/{{names[0]}}</code> </div>";
	ngModule.run(["$templateCache",function(c){c.put("registry-image-widgets/views/image-pull.html",v1)}]);
	module.exports=v1;

/***/ },
/* 16 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div ng-repeat=\"statustags in imagestream.status.tags\"> <div ng-repeat=\"condition in statustags.conditions\" ng-if=\"condition.type == 'ImportSuccess' && condition.status == 'False'\" class=\"alert alert-danger\"> <span class=\"pficon pficon-error-circle-o\"></span>\n<span translate>{{ condition.message }}. Timestamp: {{ condition.lastTransitionTime }} Error count: {{ condition.generation }}</span>\n<a translate ng-if=\"imagestreamModify\" ng-click=\"imagestreamModify(imagestream)\" class=\"alert-link\">Edit image stream</a> </div> </div> <dl class=\"dl-horizontal left\"> <dt translate>Access Policy</dt> <dd ng-switch=\"projectSharing(imagestream.metadata.namespace)\"> <div ng-switch-when=\"anonymous\"> <a translate ng-click=\"projectModify(imagestream.metadata.namespace)\">Images may be pulled by anonymous users</a>\n<i title=\"Images accessible to anonymous users\" class=\"fa fa-unlock registry-imagestream-lock\"></i> </div> <div ng-switch-when=\"shared\"> <a translate ng-click=\"projectModify(imagestream.metadata.namespace)\">Images may be pulled by any authenticated user or group</a>\n<i title=\"Images accessible to authenticated users\" class=\"fa fa-lock registry-imagestream-lock\"></i> </div> <div ng-switch-when=\"private\"> <a translate ng-click=\"projectModify(imagestream.metadata.namespace)\">Images may only be pulled by specific users or groups</a>\n<i title=\"Images only accessible to members\" class=\"fa fa-lock registry-imagestream-lock\"></i> </div> <div ng-switch-default> <a translate ng-click=\"projectModify(imagestream.metadata.namespace)\">Unknown</a>\n<i title=\"Unknown or invalid image access policy\" class=\"fa fa-lock registry-imagestream-lock\"></i> </div> </dd> <dt translate>Pull repository</dt> <dd ng-if=\"imagestream.spec.dockerImageRepository\"><tt>{{imagestream.spec.dockerImageRepository}}</tt></dd> <dd ng-if=\"!imagestream.spec.dockerImageRepository\"><em translate>None</em></dd> <dt translate>Image count</dt> <dd>{{imagestream.status.tags.length}}</dd> </dl>";
	ngModule.run(["$templateCache",function(c){c.put("registry-image-widgets/views/imagestream-body.html",v1)}]);
	module.exports=v1;

/***/ },
/* 17 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<dl class=\"dl-horizontal left\"> <dt ng-if=\"imagestream.metadata.annotations\" translate>Annotations</dt> <dd ng-repeat=\"(name, value) in imagestream.metadata.annotations\">{{name}}: {{value}}</dd> </dl>";
	ngModule.run(["$templateCache",function(c){c.put("registry-image-widgets/views/imagestream-meta.html",v1)}]);
	module.exports=v1;

/***/ },
/* 18 */
/***/ function(module, exports) {

	var angular=window.angular,ngModule;
	try {ngModule=angular.module(["ng"])}
	catch(e){ngModule=angular.module("ng",[])}
	var v1="<div class=\"registry-imagestream-push\"> <p> <i class=\"fa fa-info-circle\"></i>\n<span translate>To push to an image to this image stream:</span> </p> <code ng-if=\"settings.registry.host\">$ sudo docker tag <em>myimage</em> <span>{{settings.registry.host}}</span>/{{ imagestream.metadata.namespace }}/{{ imagestream.metadata.name}}:<em>tag</em>\n$ sudo docker push <span>{{settings.registry.host}}</span>/{{ imagestream.metadata.namespace }}/{{ imagestream.metadata.name}}</code>\n<code ng-if=\"!settings.registry.host\">$ sudo docker tag <em>myimage</em> <span class=\"placeholder\">registry</span>/{{ imagestream.metadata.namespace }}/{{ imagestream.metadata.name}}:<em>tag</em>\n$ sudo docker push <span class=\"placeholder\">registry</span>/{{ imagestream.metadata.namespace }}/{{ imagestream.metadata.name}}</code> </div>";
	ngModule.run(["$templateCache",function(c){c.put("registry-image-widgets/views/imagestream-push.html",v1)}]);
	module.exports=v1;

/***/ }
/******/ ]);
//# sourceMappingURL=image-widgets.js.map