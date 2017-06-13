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

.directive('registryImagestreamListing', [
    'imagestreamTags',
    '$location',
    function(imagestreamTags, $location) {
        return {
            restrict: 'E',
            scope: {
                imagestream: '=',
                imagestreamFunc: '&imagestreamPath',
            },
            templateUrl: 'registry-image-widgets/views/imagestream-listing.html',
            link: function(scope, element, attrs) {

                scope.imagestreamTags = imagestreamTags;
                scope.imagestreamPath = scope.imagestreamFunc();

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

            }
        };
    }
]);

}());
