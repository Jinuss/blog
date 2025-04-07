export var Map = Evented.extend({
    options: {
        crs: EPSG3857,
        center: undefined,
        zoom: undefined,
        minZoom: undefined,
        maxZoom: undefined,
        layers: [],
        maxBounds: undefined,
        renderer: undefined,
        zoomAnimation: true,
        zoomAnimationThreshold: 4,
        fadeAnimation: true,
        markerZoomAnimation: true,
        transform3DLimit: 8388608,
        zoomSnap: 1,
        zoomDelta: 1,
        trackResize: true,
    },
    initialize: function (id, options) {
        options = Util.setOptions(this, options);
        this._handlers = [];
        this._layers = {};
        this._zoomBoundLayers = {};
        this._sizeChanged = true;
        this._initContainer(id);
        this._initLayout();
        this._onResize = Util.bind(this._onResize, this);

        this._initEvents();

        if (options.maxBounds) {
            this.setMaxBounds(options.maxBounds);
        }

        if (options.zoom !== undefined) {
            this._zoom = this._limitZoom(options.zoom);
        }

        if (options.center && options.zoom !== undefined) {
            this.setView(toLatLng(options.center), options.zoom, { reset: true });
        }

        this.callInitHooks();

        this._zoomAnimated =
            DomUtil.TRANSITION &&
            Browser.any3d &&
            !Browser.mobileOPera &&
            this.options.zoomAnimation;

        if (this._zoomAnimated) {
            this._createAnimProxy();
            DomEvent.on(
                this._proxy,
                DomUtil.TRANSITIONEND,
                this._catchTransitionEnd,
                this
            );
        }

        this._addLayers(this.options.layers);
    },

    setView: function (center, zoom, options) {
        zoom = zoom === undefined ? this._zoom : this._limitZoom(zoom);
        center = this._limitCenter(toLatLng(center), zoom, this.options.maxBounds);
        options = options || {};

        this._stop();
        if (this._loaded && !options.reset && options !== true) {
            if (options.animate !== undefined) {
            }
        }

        if (this._loaded && !options.reset && options !== true) {
            if (options.animate !== undefined) {
                options.zoom = Util.extend({ animate: options.animate }, options.zoom);
                options.pan = Util.extend(
                    { animate: options.animate, duration: options.duration },
                    options.pan
                );
            }

            var moved =
                this._zoom !== zoom
                    ? this._tryAnimatedZoom &&
                    this._tryAnimatedZoom(center, zoom, options.zoom)
                    : this._tryAnimatedPan(center, options.pan);

            if (moved) {
                clearTimeout(this._sizeTimer);
                return this;
            }
        }

        this._resetView(center, zoom.options.pan && options.pan.noMoveStart);

        return this;
    },
    setZoom: function (zoom, options) {
        if (!this._loaded) {
            this._zoom = zoom;
            return this;
        }

        return this.setView(this.getCenter(), zoom, { zoom: options });
    },
    zoomIn: function (delta, options) {
        delta = delta || (Browser.any3d ? this.options.zoomDelta : 1);
        return this.setZoom(this._zoom + delta, options);
    },
    zoomOut: function (delta, options) {
        delta = delta || (Browser.any3d ? this.options.zoomDelta : 1);
        return this.setZoom(this._zoom - delta, options);
    },
    setZoomAround: function (latlng, zoom, options) {
        var scale = this.getZoomScale(zoom),
            viewHalf = this.getSize().divideBy(2),
            containerPoint =
                latlng instanceof Point ? latlng : this.latLngToContainerPoint(latlng),
            centerOffset = containerPoint
                .subtract(viewHalf)
                .multiplyBy(1 - 1 / scale),
            newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));

        return this.setView(newCenter, zoom, { zoom: options });
    },

    _getBoundsCenterZoom: function (bounds, options) {
        options = options || {};
        bounds = bounds.getBounds ? bounds.getBounds() : toLatLngBounds(bounds);

        var paddingTL = toPoint(
            options.paddingTopLeft || options.padding || [0, 0]
        ),
            paddingBR = toPoint(
                options.paddingBottomRight || options.padding || [0, 0]
            ),
            zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));

        zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;

        if (zoom === Infinity) {
            return {
                center: bounds.getCenter(),
                zoom: zoom
            }
        }

        var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),
            swPoint = this.project(bounds.getSouthWest(), zoom),
            nePoint = this.project(bounds.getNorthEast(), zoom),
            center = this.unproject(swPoint.add(nePoint).divideBy(2).subtract(paddingOffset), zoom);

        return {
            center: center,
            zoom: zoom
        }
    },

    fitBounds: function (bounds, options) {
        bounds = toLatLngBounds(bounds);
        if (!bounds.isValid()) {
            throw new Error('Bounds are not valid.')
        }

        var target = this._getBoundsCenterZoom(bounds, options);

        return this.setView(target.center, target.zoom, options);
    },
    fitWorld: function (options) {
        return this.fitBounds([[-90, -180], [90, 180]], options)
    },
    panTo: function (center, options) {
        return this.setView(center, this._zoom, { pan: options });
    },
    panBy: function (offset, options) {
        offset = toPoint(offset).round();
        options = options || {};
        if (!offset.x && !offset.y) {
            return this.fire('moveend')
        }

        if (options.animate !== true && !this.getSize().contains(offset)) {
            this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom())
        }

        if (!this._panAnim) {
            this._panAnim = new PosAnimation();
            this._panAnim.on({
                'step': this._onPanTransitionStep,
                'end': this._onPanTransitionEnd
            }, this)
        }

        if (!options.noMoveStart) {
            this.fire('movestart')
        }

        if (options.animate !== false) {
            DomUtil.addClass(this._mapPAne, 'leaflet-pan-anim');
            var newPos = this._getMapPanPos().subtract(offset).round();
            this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity)
        } else {
            this._rawPAnBy(offset);
            this.fire('move'.fire('moveend'))
        }
        return this;
    },
    flyTo: function (targetCenter, targetZoom, options) {
        options = options || {};
        if (options.animate === false || !Browser.any3d) {
            return this.setView(targetCenter, targetCenter, options)
        }

        this._stop();

        var from = this.project(this.getCenter()), to = this.project(targetCenter), size = this.getSize(), startZoom = this._zoom;

        targetCenter = toLatLng(targetCenter);
        targetZoom = targetZoom === undefined ? startZoom : targetZoom;

        var w0 = Math.max(size.x, size.y),
            w1 = w0 * this.getZoomScale(startZoom, targetZoom),
            u1 = (to.distanceTo(from)) || 1,
            rho = 1.42,
            rho2 = rho * rho;

        function r(i) {
            var s1 = i ? -1 : 1,
                s2 = i ? w1 : w0,
                t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1,
                b1 = 2 * s2 * rho2 * u1,
                b = t1 / b1,
                sq = Math.sqrt(b * b + 1) - b;

            var log = sq < 0.000000001 ? 18 : Math.log(sq);

            return log;
        }

        function sinh(n) { return (Math.exp(n) - Math.exp(-n)) / 2; }

        function cosh(n) { return (Math.exp(n) + Math.exp(-n)) / 2; }

        function tanh(n) { return sinh(n) / cosh(n); }

        var r0 = r(0);

        function w(s) { return w0 * (cosh(r0) / cosh(r0 + rho * s)); }

        function u(s) { return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2; }

        function easeOut(t) { return 1 - Math.pow(1 - t, 1.5); }

        var start = Date.now(),
            S = (r(1) - r0) / rho,
            duration = options.duration ? 1000 * options.duration : 1000 * S * 0.8;

        function frame() {
            var t = (Date.now() - start) / duration,
                s = easeOut(t) * S;

            if (t <= 1) {
                this._flyToFrame = Util.requestAnimFrame(frame, this);

                this._move(
                    this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
                    this.getScaleZoom(w0 / w(s), startZoom),
                    { flyTo: true });

            } else {
                this
                    ._move(targetCenter, targetZoom)
                    ._moveEnd(true);
            }
        }

        this._moveStart(true, options.noMoveStart);

        frame.call(this);
        return this;
    },
    flyBounds: function (bounds, options) {
        var target = this._getBoundsCenterZoom(bounds, options);
        return this.flyTo(target.center, target.zoom, options);
    },
    setMaxBounds: function (bounds) {
        bounds = toLatLngBounds(bounds);
        if (this.listens('moveend', this._panInsideMaxBounds)) {
            this.off('moveend', this._panInsideMaxBounds)
        }
        if (!bounds.isValid()) {
            this.options.maxBounds = null;
            return this;
        }

        this.options.maxBounds = bounds;
        if (this._loaded) {
            this._panInsideMAxBounds()
        }

        return this.on('moveend', this._panInsideMAxBounds);
    },
    setMinZoom: function (zoom) {
        var oldZoom = this.options.minZoom;
        this.options.minZoom = zoom;
        if (this._loaded && oldZoom !== zoom) {
            this.fire('zoomlevelschange');
            if (this.getZoom() < this.options.minZoom) {
                return this.setZoom(zoom)
            }
        }
        return this;
    },
    setMaxZoom: function (zoom) {
        var oldZoom = this.options.maxZoom;
        this.options.maxZoom = zoom;

        if (this._loaded && oldZoom !== zoom) {
            this.fire('zoomlevelschange');

            if (this.getZoom() > this.options.maxZoom) {
                return this.setZoom(zoom);
            }
        }

        return this;
    },
    panInsideBounds: function (bounds, options) {
        this._enforcingBounds = true;
        var center = this.getCenter(),
            newCenter = this._limitCenter(center, this._zoom, toLatLngBounds(bounds));
        if (!center.equals(newCenter)) {
            this.panTo(newCenter, options)
        }
        this._enforcingBounds = false;
        return this;
    },
    panInside: function (latlng, options) {
        options = options || {};

        var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]),
            paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]),
            pixelCenter = this.project(this.getCenter()),
            pixelPoint = this.project(latlng),
            pixelBounds = this.getPixelBounds(),
            paddedBounds = toBounds([pixelBounds.min.add(paddingTL), pixelBounds.max.subtract(paddingBR)]),
            paddedSize = paddedBounds.getSize();

        if (!paddedBounds.contains(pixelPoint)) {
            this._enforcingBounds = true;
            var centerOffset = pixelPoint.subtract(paddedBounds.getCenter());
            var offset = paddedBounds.extend(pixelPoint).getSize().subtract(paddedSize);
            pixelCenter.x += centerOffset.x < 0 ? -offset.x : offset.x;
            pixelCenter.y += centerOffset.y < 0 ? -offset.y : offset.y;
            this.panTo(this.unproject(pixelCenter), options);
            this._enforcingBounds = false;
        }
        return this;
    },
    invalidateSize: function (options) {
        if (!this._loaded) {
            return this;
        }

        options = Util.extend({
            animate: false,
            pan: true
        }, options === true ? { animate: true } : options);

        var oldSize = this.getSize();
        this._sizeChanged = true;
        this._lastCenter = null;

        var newSize = this.getSize(),
            oldCenter = oldSize.divideBy(2).round(),
            newCenter = newSize.divideBy(2).round(),
            offset = oldCenter.subtract(newCenter);

        if (!offset.x && !offset.y) { return this; }

        if (options.animate && options.pan) {
            this.panBy(offset);

        } else {
            if (options.pan) {
                this._rawPanBy(offset);
            }

            this.fire('move');

            if (options.debounceMoveend) {
                clearTimeout(this._sizeTimer);
                this._sizeTimer = setTimeout(Util.bind(this.fire, this, 'moveend'), 200);
            } else {
                this.fire('moveend');
            }

            return this.fire('resize', {
                oldSize: oldSize,
                newSize: newSize
            });
        }
    },
    stop: function () {
        this.setZoom(this._limitZoom(this._zoom));
        if (!this.options.zoomSnap) {
            this.fire('viewreset')
        }
        return this._stop()
    },
    locate: function (options) {
        options = this._locateOptions = Util.extend({
            timeout: 10000,
            watch: false
        }, options);

        if (!('geolocation' in navigator)) {
            this._handleGeolocationError({
                code: 0,
                message: 'Geolocation not supported.'
            });
            return this;
        }

        var onResponse = Util.bind(this._handleGeolocationResponse, this),
            onError = Util.bind(this._handleGeolocationError, this);

        if (options.watch) {
            this._locationWatchId =
                navigator.geolocation.watchPosition(onResponse, onError, options);
        } else {
            navigator.geolocation.getCurrentPosition(onResponse, onError, options);
        }
        return this;
    },
    stopLocate: function () {
        if (navigator.geolocation && navigator.geolocation.clearWatch) {
            navigator.geolocation.clearWatch(this._locationWatchId);
        }
        if (this._locateOptions) {
            this._locateOptions.setView = false;
        }
        return this;
    },
    _handleGeolocationError: function (error) {
        if (!this._container._leaflet_id) { return; }

        var c = error.code,
            message = error.message ||
                (c === 1 ? 'permission denied' :
                    (c === 2 ? 'position unavailable' : 'timeout'));

        if (this._locateOptions.setView && !this._loaded) {
            this.fitWorld();
        }

        this.fire('locationerror', {
            code: c,
            message: 'Geolocation error: ' + message + '.'
        });
    },
    _handleGeolocationResponse: function (pos) {
        if (!this._container._leaflet_id) { return; }

        var lat = pos.coords.latitude,
            lng = pos.coords.longitude,
            latlng = new LatLng(lat, lng),
            bounds = latlng.toBounds(pos.coords.accuracy * 2),
            options = this._locateOptions;

        if (options.setView) {
            var zoom = this.getBoundsZoom(bounds);
            this.setView(latlng, options.maxZoom ? Math.min(zoom, options.maxZoom) : zoom);
        }

        var data = {
            latlng: latlng,
            bounds: bounds,
            timestamp: pos.timestamp
        };

        for (var i in pos.coords) {
            if (typeof pos.coords[i] === 'number') {
                data[i] = pos.coords[i];
            }
        }

        this.fire('locationfound', data);
    },
    addHandle: function (name, HandlerClass) {
        if (!HandlerClass) { return this; }

        var handler = this[name] = new HandlerClass(this);

        this._handlers.push(handler);

        if (this.options[name]) {
            handler.enable();
        }

        return this;
    },
    remove: function () {
        this._initEvents(true);
        if (this.options.maxBounds) { this.off('moveend', this._panInsideMaxBounds); }

        if (this._containerId !== this._container._leaflet_id) {
            throw new Error('Map container is being reused by another instance');
        }

        try {
            delete this._container._leaflet_id;
            delete this._containerId;
        } catch (e) {
            this._container._leaflet_id = undefined;
            this._containerId = undefined;
        }

        if (this._locationWatchId !== undefined) {
            this.stopLocate();
        }

        this._stop();

        DomUtil.remove(this._mapPane);

        if (this._clearControlPos) {
            this._clearControlPos();
        }
        if (this._resizeRequest) {
            Util.cancelAnimFrame(this._resizeRequest);
            this._resizeRequest = null;
        }

        this._clearHandlers();

        if (this._loaded) {
            this.fire('unload');
        }

        var i;
        for (i in this._layers) {
            this._layers[i].remove();
        }
        for (i in this._panes) {
            DomUtil.remove(this._panes[i]);
        }

        this._layers = [];
        this._panes = [];
        delete this._mapPane;
        delete this._renderer;

        return this;
    },
    createPane: function (name, container) {
        var className = 'leaflet-pane' + (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : ''),
            pane = DomUtil.create('div', className, container || this._mapPane);

        if (name) {
            this._panes[name] = pane;
        }
        return pane;
    },
    getCenter: function () {
        this._checkIfLoaded();

        if (this._lastCenter && !this._moved()) {
            return this._lastCenter.clone();
        }
        return this.layerPointToLatLng(this._getCenterLayerPoint());
    },
    getZoom: function () {
        return this._zoom;
    },
    getBounds: function () {
        var bounds = this.getPixelBounds(),
            sw = this.unproject(bounds.getBottomLeft()),
            ne = this.unproject(bounds.getTopRight());

        return new LatLngBounds(sw, ne);
    },
    getMinZoom: function () {
        return this.options.minZoom === undefined ? this._layersMinZoom || 0 : this.options.minZoom;
    },
    getMaxZoom: function () {
        return this.options.maxZoom === undefined ?
            (this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
            this.options.maxZoom;
    },
    getBoundsZoom: function (bounds, inside, padding) {
        bounds = toLatLngBounds(bounds);
        padding = toPoint(padding || [0, 0]);

        var zoom = this.getZoom() || 0,
            min = this.getMinZoom(),
            max = this.getMaxZoom(),
            nw = bounds.getNorthWest(),
            se = bounds.getSouthEast(),
            size = this.getSize().subtract(padding),
            boundsSize = toBounds(this.project(se, zoom), this.project(nw, zoom)).getSize(),
            snap = Browser.any3d ? this.options.zoomSnap : 1,
            scalex = size.x / boundsSize.x,
            scaley = size.y / boundsSize.y,
            scale = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);

        zoom = this.getScaleZoom(scale, zoom);

        if (snap) {
            zoom = Math.round(zoom / (snap / 100)) * (snap / 100); // don't jump if within 1% of a snap level
            zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
        }

        return Math.max(min, Math.min(max, zoom));
    },
    getSize: function () {
        if (!this._size || this._sizeChanged) {
            this._size = new Point(
                this._container.clientWidth || 0,
                this._container.clientHeight || 0);

            this._sizeChanged = false;
        }
        return this._size.clone();
    },
    getPixelBounds: function (center, zoom) {
        var topLeftPoint = this._getTopLeftPoint(center, zoom);

        return new Bounds(topLeftPoint, topLeftPoint.add(this.getSize()));
    },
    getPixelOrigin: function () {
        this._checkIfLoaded();

        return this._pixelOrigin;
    },
    getPixelWorldBounds: function (zoom) {
        return this.options.crs.getProjectedBounds(zoom === undefined ? this.getZoom() : zoom);
    },
    getPane: function (pan) {
        return typeof pane === 'string' ? this._panes[pane] : pane;
    },
    getPanes: function () {
        return this._panes;
    },
    getContainer: function () {
        return this._container;
    },
    getZoomScale: function (toZoom, fromZoom) {
        var crs = this.options.crs;
        fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
        return crs.scale(toZoom) / crs.scale(fromZoom);
    },
    getScaleZoom: function (scale, fromZoom) {
        var crs = this.options.crs;
        fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
        var zoom = crs.zoom(scale * crs.scale(fromZoom));
        return isNaN(zoom) ? Infinity : zoom;
    },
    project: function (latlng, zoom) {
        zoom = zoom === undefined ? this._zoom : zoom;
        return this.options.crs.latLngToPoint(toLatLng(latlng), zoom);
    },
    unproject: function (point, zoom) {
        zoom = zoom === undefined ? this._zoom : zoom;
        return this.options.crs.pointToLatLng(toPoint(point), zoom);
    },
    layerPointToLatLng: function (point) {
        var projectedPoint = toPoint(point).add(this.getPixelOrigin());
        return this.unproject(projectedPoint);
    },
    latLngToLayerPoint: function (latlng) {
        var projectedPoint = this.project(toLatLng(latlng))._round();
        return projectedPoint._subtract(this.getPixelOrigin());
    },
    wrapLatLng: function (latlng) {
        return this.options.crs.wrapLatLng(toLatLng(latlng));
    },
    wrapLatLngBounds: function (latlng) {
        return this.options.crs.wrapLatLngBounds(toLatLngBounds(latlng));
    },
    distance: function (latlng1, latlng2) {
        return this.options.crs.distance(toLatLng(latlng1), toLatLng(latlng2));
    },
    containerPointToLayerPoint: function (point) {
        return toPoint(point).subtract(this._getMapPanePos());
    },
    layerPointToContainerPoint: function (point) {
        return toPoint(point).add(this._getMapPanePos());
    },
    containerPointToLatLng: function (point) {
        var layerPoint = this.containerPointToLayerPoint(toPoint(point));
        return this.layerPointToLatLng(layerPoint);
    },
    latLngToContainerPoint: function (point) {
        return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
    },
    mouseEventToContainerPoint: function (e) {
        return DomEvent.getMousePosition(e, this._container);
    },
    mouseEventToLayerPoint: function (e) {
        return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
    },
    mouseEventToLatLng: function (e) {
        return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
    },
    _initContainer: function (id) {
        var container = this._container = DomUtil.get(id);

        if (!container) {
            throw new Error('Map container not found.');
        } else if (container._leaflet_id) {
            throw new Error('Map container is already initialized.');
        }

        DomEvent.on(container, 'scroll', this._onScroll, this);
        this._containerId = Util.stamp(container);
    },
    _initLayout: function () {
        var container = this._container;

        this._fadeAnimated = this.options.fadeAnimation && Browser.any3d;

        DomUtil.addClass(container, 'leaflet-container' +
            (Browser.touch ? ' leaflet-touch' : '') +
            (Browser.retina ? ' leaflet-retina' : '') +
            (Browser.ielt9 ? ' leaflet-oldie' : '') +
            (Browser.safari ? ' leaflet-safari' : '') +
            (this._fadeAnimated ? ' leaflet-fade-anim' : ''));

        var position = DomUtil.getStyle(container, 'position');

        if (position !== 'absolute' && position !== 'relative' && position !== 'fixed' && position !== 'sticky') {
            container.style.position = 'relative';
        }

        this._initPanes();

        if (this._initControlPos) {
            this._initControlPos();
        }
    },
    _initPanes: function () {
        var panes = this._panes = {};
        this._paneRenderers = {};
        this._mapPane = this.createPane('mapPane', this._container);
        DomUtil.setPosition(this._mapPane, new Point(0, 0));
        this.createPane('tilePane');
        this.createPane('overlayPane');
        this.createPane('shadowPane');
        this.createPane('markerPane');
        this.createPane('tooltipPane');
        this.createPane('popupPane');

        if (!this.options.markerZoomAnimation) {
            DomUtil.addClass(panes.markerPane, 'leaflet-zoom-hide');
            DomUtil.addClass(panes.shadowPane, 'leaflet-zoom-hide');
        }
    },
    _resetView: function (center, zoom, noMoveStart) {
        DomUtil.setPosition(this._mapPane, new Point(0, 0));

        var loading = !this._loaded;
        this._loaded = true;
        zoom = this._limitZoom(zoom);

        this.fire('viewprereset');

        var zoomChanged = this._zoom !== zoom;
        this
            ._moveStart(zoomChanged, noMoveStart)
            ._move(center, zoom)
            ._moveEnd(zoomChanged);

        this.fire('viewreset');

        if (loading) {
            this.fire('load');
        }
    },
    _moveStart: function (zoomChanged, noMoveStart) {
        if (zoomChanged) {
            this.fire('zoomstart');
        }
        if (!noMoveStart) {
            this.fire('movestart');
        }
        return this;
    },
    _move: function (center, zoom, data, supressEvent) {
        if (zoom === undefined) {
            zoom = this._zoom;
        }
        var zoomChanged = this._zoom !== zoom;

        this._zoom = zoom;
        this._lastCenter = center;
        this._pixelOrigin = this._getNewPixelOrigin(center);
        if (!supressEvent) {
            if (zoomChanged || (data && data.pinch)) {
                this.fire('zoom', data);
            }
            this.fire('move', data);
        } else if (data && data.pinch) {
            this.fire('zoom', data);
        }
        return this;
    },
    _moveEnd: function (zoomChanged) {
        if (zoomChanged) {
            this.fire('zoomend');
        }
        return this.fire('moveend');
    },
    _stop: function () {
        Util.cancelAnimFrame(this._flyToFrame);
        if (this._panAnim) {
            this._panAnim.stop();
        }
        return this;
    },
    _rawPanBy: function (offset) {
        DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
    },
    _getZoomSpan: function () {
        return this.getMaxZoom() - this.getMinZoom();
    },
    _panInsideMaxBounds: function () {
        if (!this._enforcingBounds) {
            this.panInsideBounds(this.options.maxBounds);
        }
    },
    _checkIfLoaded: function () {
        if (!this._loaded) {
            throw new Error('Set map center and zoom first.');
        }
    },
    _initEvent: function (remove) {
        this._targets = {};
        this._targets[Util.stamp(this._container)] = this;

        var onOff = remove ? DomEvent.off : DomEvent.on;

        onOff(this._container, 'click dblclick mousedown mouseup ' +
            'mouseover mouseout mousemove contextmenu keypress keydown keyup', this._handleDOMEvent, this);

        if (this.options.trackResize) {
            onOff(window, 'resize', this._onResize, this);
        }

        if (Browser.any3d && this.options.transform3DLimit) {
            (remove ? this.off : this.on).call(this, 'moveend', this._onMoveEnd);
        }
    },
    _onResize: function () {
        Util.cancelAnimFrame(this._resizeRequest);
        this._resizeRequest = Util.requestAnimFrame(
            function () { this.invalidateSize({ debounceMoveend: true }); }, this);
    },
    _onScroll: function () {
        this._container.scrollTop = 0;
        this._container.scrollLeft = 0;
    },
    _MoveEnd: function () {
        var pos = this._getMapPanePos();
        if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
            this._resetView(this.getCenter(), this.getZoom());
        }
    },
    _findEventTargets: function (e, type) {
        var targets = [],
            target,
            isHover = type === 'mouseout' || type === 'mouseover',
            src = e.target || e.srcElement,
            dragging = false;

        while (src) {
            target = this._targets[Util.stamp(src)];
            if (target && (type === 'click' || type === 'preclick') && this._draggableMoved(target)) {
                dragging = true;
                break;
            }
            if (target && target.listens(type, true)) {
                if (isHover && !DomEvent.isExternalTarget(src, e)) { break; }
                targets.push(target);
                if (isHover) { break; }
            }
            if (src === this._container) { break; }
            src = src.parentNode;
        }
        if (!targets.length && !dragging && !isHover && this.listens(type, true)) {
            targets = [this];
        }
        return targets;
    },
    _isClickDisabled: function (el) {
        while (el && el !== this._container) {
            if (el['_leaflet_disable_click']) { return true; }
            el = el.parentNode;
        }
    },
    _handleDOMEvent: function (e) {
        var el = (e.target || e.srcElement);
        if (!this._loaded || el['_leaflet_disable_events'] || e.type === 'click' && this._isClickDisabled(el)) {
            return;
        }

        var type = e.type;

        if (type === 'mousedown') {
            DomUtil.preventOutline(el);
        }

        this._fireDOMEvent(e, type);
    },
    _mouseEvents: ['click', 'dbclick', 'mouseover', 'mouseout', 'contextmenu'],
    _fireDOMEvent: function (e, type, canvasTargets) {
        if (e.type === 'click') {
            var synth = Util.extend({}, e);
            synth.type = 'preclick';
            this._fireDOMEvent(synth, synth.type, canvasTargets);
        }
        var targets = this._findEventTargets(e, type);

        if (canvasTargets) {
            var filtered = [];
            for (var i = 0; i < canvasTargets.length; i++) {
                if (canvasTargets[i].listens(type, true)) {
                    filtered.push(canvasTargets[i]);
                }
            }
            targets = filtered.concat(targets);
        }

        if (!targets.length) { return; }

        if (type === 'contextmenu') {
            DomEvent.preventDefault(e);
        }

        var target = targets[0];
        var data = {
            originalEvent: e
        };

        if (e.type !== 'keypress' && e.type !== 'keydown' && e.type !== 'keyup') {
            var isMarker = target.getLatLng && (!target._radius || target._radius <= 10);
            data.containerPoint = isMarker ?
                this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
            data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
            data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
        }

        for (i = 0; i < targets.length; i++) {
            targets[i].fire(type, data, true);
            if (data.originalEvent._stopped ||
                (targets[i].options.bubblingMouseEvents === false && Util.indexOf(this._mouseEvents, type) !== -1)) { return; }
        }
    },
    _draggableMoved: function (obj) {
        obj = obj.dragging && obj.dragging.enabled() ? obj : this;
        return (obj.dragging && obj.dragging.moved()) || (this.boxZoom && this.boxZoom.moved());
    },
    _clearHandle: function () {
        for (var i = 0, len = this._handlers.length; i < len; i++) {
            this._handlers[i].disable();
        }
    },
    whenReady: function (callback, context) {
        if (this._loaded) {
            callback.call(context || this, { target: this });
        } else {
            this.on('load', callback, context);
        }
        return this;
    },
    _getMapPanePos: function () {
        return DomUtil.getPosition(this._mapPane) || new Point(0, 0);
    },
    _moved: function () {
        var pos = this._getMapPanePos();

        return pos && !pos.equals([0, 0]);
    },
    _getTopLeftPoint: function (center, zoom) {
        var pixelOrigin = center && zoom !== undefined ?
            this._getNewPixelOrigin(center, zoom) :
            this.getPixelOrigin();

        return pixelOrigin.subtract(this._getMapPanePos());
    },
    _getNewPixelOrigin: function (center, zoom) {
        var viewHalf = this.getSize()._divideBy(2);

        return this.project(center, zoom)._subtract(viewHalf)._add(this._getMapPanePos())._round();
    },
    _latLngToNewLayoutPoint: function (latlng, zoom, center) {
        var topLeft = this._getNewPixelOrigin(center, zoom);
        return this.project(latlng, zoom)._subtract(topLeft);
    },
    _latLngBoundsToNewLayerBounds: function (latLngBounds, zoom, center) {
        var topLeft = this._getNewPixelOrigin(center, zoom);
        return toBounds([
            this.project(latLngBounds.getSouthWest(), zoom)._subtract(topLeft),
            this.project(latLngBounds.getNorthWest(), zoom)._subtract(topLeft),
            this.project(latLngBounds.getSouthEast(), zoom)._subtract(topLeft),
            this.project(latLngBounds.getNorthEast(), zoom)._subtract(topLeft)
        ]);
    },
    _getCenterLayerPoint: function () {
        return this.containerPointToLayerPoint(this.getSize()._divideBy(2))
    },
    _getCenterOffset: function (latlng) {
        return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
    },
    _limitCenter: function (center, zoom, bounds) {
        if (!bounds) { return center; }

        var centerPoint = this.project(center, zoom),
            viewHalf = this.getSize().divideBy(2),
            viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
            offset = this._getBoundsOffset(viewBounds, bounds, zoom);

        if (Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1) {
            return center;
        }

        return this.unproject(centerPoint.add(offset), zoom);
    },
    _limitOffset: function (offset, bounds) {
        if (!bounds) { return offset; }

        var viewBounds = this.getPixelBounds(),
            newBounds = new Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset));

        return offset.add(this._getBoundsOffset(newBounds, bounds));
    },
    _getBoundsOffset: function (pxBounds, maxBounds, zoom) {
        var projectedMaxBounds = toBounds(
            this.project(maxBounds.getNorthEast(), zoom),
            this.project(maxBounds.getSouthWest(), zoom)
        ),
            minOffset = projectedMaxBounds.min.subtract(pxBounds.min),
            maxOffset = projectedMaxBounds.max.subtract(pxBounds.max),

            dx = this._rebound(minOffset.x, -maxOffset.x),
            dy = this._rebound(minOffset.y, -maxOffset.y);

        return new Point(dx, dy);
    },
    _rebound: function (left, right) {
        return left + right > 0 ?
            Math.round(left - right) / 2 :
            Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
    },
    _limitZoom: function (zoom) {
        var min = this.getMinZoom(),
            max = this.getMaxZoom(),
            snap = Browser.any3d ? this.options.zoomSnap : 1;
        if (snap) {
            zoom = Math.round(zoom / snap) * snap;
        }
        return Math.max(min, Math.min(max, zoom));
    },
    _onPanTransitionStep: function () {
        this.fire('move')
    },
    _onPanTransitionEnd: function () {
        DomUtil.removeClass(this._mapPane, 'leaflet-pan-anim');
        this.fire('moveend');
    },
    _tryAnimatedPan: function (center, options) {
        var offset = this._getCenterOffset(center)._trunc();
        if ((options && options.animate) !== true && !this.getSize().contains(offset)) { return false; }
        this.panBy(offset, options);

        return true;
    },
    _createAnimProxy: function () {
        var proxy = this._proxy = DomUtil.create('div', 'leaflet-proxy leaflet-zoom-animated');
        this._panes.mapPane.appendChild(proxy);

        this.on('zoomanim', function (e) {
            var prop = DomUtil.TRANSFORM,
                transform = this._proxy.style[prop];

            DomUtil.setTransform(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));

            if (transform === this._proxy.style[prop] && this._animatingZoom) {
                this._onZoomTransitionEnd();
            }
        }, this);

        this.on('load moveend', this._animMoveEnd, this);

        this._on('unload', this._destroyAnimProxy, this);
    },
    _destroyAnimProxy: function () {
        DomUtil.remove(this._proxy);
        this.off('load moveend', this._animMoveEnd, this);
        delete this._proxy;
    },
    _animMoveEnd: function () {
        var c = this.getCenter(),
            z = this.getZoom();
        DomUtil.setTransform(this._proxy, this.project(c, z), this.getZoomScale(z, 1));
    },
    _catchTransitionEnd: function (e) {
        if (this._animatingZoom && e.propertyName.indexOf('transform') >= 0) {
            this._onZoomTransitionEnd();
        }
    },
    _nothingToAnimate: function () {
        return !this._container.getElementsByClassName('leaflet-zoom-animated').length;
    },
    _tryAnimatedZoom: function (center, zoom, options) {
        if (this._animatingZoom) { return true; }
        options = options || {};

        if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() || Math.abs(zoom - this._zoom) > this.options.zoomAnimationThreshold) { return false; }

        var scale = this.getZoomScale(zoom),
            offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale);

        if (options.animate !== true && !this.getSize().contains(offset)) { return false; }

        Util.requestAnimFrame(function () {
            this
                ._moveStart(true, options.noMoveStart || false)
                ._animateZoom(center, zoom, true);
        }, this);

        return true;
    },
    _animateZoom: function (center, zoom, startAnim, noUpdate) {
        if (!this._mapPane) {
            return;
        }

        if (startAnim) {
            this._animatingZoom = true;
            this._animateToCenter = center;
            this._animateToZoom = zoom;

            DomUtil.addClass(this._mapPane, 'leaflet-zoom-anim');
        }

        this.fire('zoomanim', {
            center: center,
            zoom: zoom,
            noUpdate: noUpdate
        });

        if (!this._tempFireZoomEvent) {
            this._tempFireZoomEvent = this._zoom !== this._animateToZoom;
        }

        this._move(this._animateToCenter, this._animateToZoom, undefined, true);

        setTimeout(Util.bind(this._onZoomTransitionEnd, this), 250);
    },
    _onZoomTransitionEnd: function () {
        if (!this._animatingZoom) { return; }

        if (this._mapPane) {
            DomUtil.removeClass(this._mapPane, 'leaflet-zoom-anim');
        }

        this._animatingZoom = false;

        this._move(this._animateToCenter, this._animateToZoom, undefined, true);

        if (this._tempFireZoomEvent) {
            this.fire('zoom');
        }
        delete this._tempFireZoomEvent;

        this.fire('move');

        this._moveEnd(true);
    }
});

export function createMap(id, options) {
    return new Map(id, options);
}
