/**
 * @module ol/layer/Base
 */
import BaseObject from '../Object.js';
import LayerProperty from './Property.js';
import {abstract} from '../util.js';
import {assert} from '../asserts.js';
import {clamp} from '../math.js';
class BaseLayer extends BaseObject {
  /**
   * @param {Options} options Layer options.
   */
  constructor(options) {
    super();

    /***
     * @type {BaseLayerOnSignature<import("../events").EventsKey>}
     */
    this.on;

    /***
     * @type {BaseLayerOnSignature<import("../events").EventsKey>}
     */
    this.once;

    /***
     * @type {BaseLayerOnSignature<void>}
     */
    this.un;

    /**
     * @type {BackgroundColor|false}
     * @private
     */
    this.background_ = options.background;

    /**
     * @type {Object<string, *>}
     */
    const properties = Object.assign({}, options);
    if (typeof options.properties === 'object') {
      delete properties.properties;
      Object.assign(properties, options.properties);
    }

    properties[LayerProperty.OPACITY] =
      options.opacity !== undefined ? options.opacity : 1;
    assert(
      typeof properties[LayerProperty.OPACITY] === 'number',
      'Layer opacity must be a number',
    );

    properties[LayerProperty.VISIBLE] =
      options.visible !== undefined ? options.visible : true;
    properties[LayerProperty.Z_INDEX] = options.zIndex;
    properties[LayerProperty.MAX_RESOLUTION] =
      options.maxResolution !== undefined ? options.maxResolution : Infinity;
    properties[LayerProperty.MIN_RESOLUTION] =
      options.minResolution !== undefined ? options.minResolution : 0;
    properties[LayerProperty.MIN_ZOOM] =
      options.minZoom !== undefined ? options.minZoom : -Infinity;
    properties[LayerProperty.MAX_ZOOM] =
      options.maxZoom !== undefined ? options.maxZoom : Infinity;

    /**
     * @type {string}
     * @private
     */
    this.className_ =
      properties.className !== undefined ? properties.className : 'ol-layer';
    delete properties.className;

    this.setProperties(properties);

    /**
     * @type {import("./Layer.js").State}
     * @private
     */
    this.state_ = null;
  }

  getBackground() {
    return this.background_;
  }

  getClassName() {
    return this.className_;
  }
  getLayerState(managed) {
    /** @type {import("./Layer.js").State} */
    const state =
      this.state_ ||
      /** @type {?} */ ({
        layer: this,
        managed: managed === undefined ? true : managed,
      });
    const zIndex = this.getZIndex();
    state.opacity = clamp(Math.round(this.getOpacity() * 100) / 100, 0, 1);
    state.visible = this.getVisible();
    state.extent = this.getExtent();
    state.zIndex = zIndex === undefined && !state.managed ? Infinity : zIndex;
    state.maxResolution = this.getMaxResolution();
    state.minResolution = Math.max(this.getMinResolution(), 0);
    state.minZoom = this.getMinZoom();
    state.maxZoom = this.getMaxZoom();
    this.state_ = state;

    return state;
  }

  getLayersArray(array) {
    return abstract();
  }
  getLayerStatesArray(states) {
    return abstract();
  }
  getExtent() {
    return /** @type {import("../extent.js").Extent|undefined} */ (
      this.get(LayerProperty.EXTENT)
    );
  }
  getMaxResolution() {
    return /** @type {number} */ (this.get(LayerProperty.MAX_RESOLUTION));
  }
  getMinResolution() {
    return /** @type {number} */ (this.get(LayerProperty.MIN_RESOLUTION));
  }

  getMinZoom() {
    return /** @type {number} */ (this.get(LayerProperty.MIN_ZOOM));
  }
  getMaxZoom() {
    return /** @type {number} */ (this.get(LayerProperty.MAX_ZOOM));
  }
  getOpacity() {
    return /** @type {number} */ (this.get(LayerProperty.OPACITY));
  }

  getSourceState() {
    return abstract();
  }
  getVisible() {
    return /** @type {boolean} */ (this.get(LayerProperty.VISIBLE));
  }

  getZIndex() {
    return /** @type {number|undefined} */ (this.get(LayerProperty.Z_INDEX));
  }

  setBackground(background) {
    this.background_ = background;
    this.changed();
  }
  setExtent(extent) {
    this.set(LayerProperty.EXTENT, extent);
  }

  setMaxResolution(maxResolution) {
    this.set(LayerProperty.MAX_RESOLUTION, maxResolution);
  }
  setMinResolution(minResolution) {
    this.set(LayerProperty.MIN_RESOLUTION, minResolution);
  }
  setMaxZoom(maxZoom) {
    this.set(LayerProperty.MAX_ZOOM, maxZoom);
  }
  setMinZoom(minZoom) {
    this.set(LayerProperty.MIN_ZOOM, minZoom);
  }
  setOpacity(opacity) {
    assert(typeof opacity === 'number', 'Layer opacity must be a number');
    this.set(LayerProperty.OPACITY, opacity);
  }

  /**
   * Set the visibility of the layer (`true` or `false`).
   * @param {boolean} visible The visibility of the layer.
   * @observable
   * @api
   */
  setVisible(visible) {
    this.set(LayerProperty.VISIBLE, visible);
  }

  /**
   * Set Z-index of the layer, which is used to order layers before rendering.
   * The default Z-index is 0.
   * @param {number} zindex The z-index of the layer.
   * @observable
   * @api
   */
  setZIndex(zindex) {
    this.set(LayerProperty.Z_INDEX, zindex);
  }

  /**
   * Clean up.
   * @override
   */
  disposeInternal() {
    if (this.state_) {
      this.state_.layer = null;
      this.state_ = null;
    }
    super.disposeInternal();
  }
}

export default BaseLayer;
