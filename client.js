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
