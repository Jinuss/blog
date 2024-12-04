/**
 * @module ol/layer/Layer
 */
import BaseLayer from './Base.js';
import EventType from '../events/EventType.js';
import LayerProperty from './Property.js';
import RenderEventType from '../render/EventType.js';
import View from '../View.js';
import { assert } from '../asserts.js';
import { intersects } from '../extent.js';
import { listen, unlistenByKey } from '../events.js';
class Layer extends BaseLayer {
  constructor(options) {
    const baseOptions = Object.assign({}, options);
    delete baseOptions.source;

    super(baseOptions);
    this.on;
    this.once;
    this.un;
    this.mapPrecomposeKey_ = null;
    this.mapRenderKey_ = null;
    this.sourceChangeKey_ = null;
    this.renderer_ = null;
    this.sourceReady_ = false;
    this.rendered = false;
    if (options.render) {
      this.render = options.render;
    }

    if (options.map) {
      this.setMap(options.map);
    }

    this.addChangeListener(
      LayerProperty.SOURCE,
      this.handleSourcePropertyChange_,
    );

    const source = options.source
      ? (options.source)
      : null;
    this.setSource(source);
  }

  getLayersArray(array) {
    array = array ? array : [];
    array.push(this);
    return array;
  }
  getLayerStatesArray(states) {
    states = states ? states : [];
    states.push(this.getLayerState());
    return states;
  }
  getSource() {
    return (this.get(LayerProperty.SOURCE)) || null;
  }
  getRenderSource() {
    return this.getSource();
  }
  getSourceState() {
    const source = this.getSource();
    return !source ? 'undefined' : source.getState();
  }

  handleSourceChange_() {
    this.changed();
    if (this.sourceReady_ || this.getSource().getState() !== 'ready') {
      return;
    }
    this.sourceReady_ = true;
    this.dispatchEvent('sourceready');
  }

  handleSourcePropertyChange_() {
    if (this.sourceChangeKey_) {
      unlistenByKey(this.sourceChangeKey_);
      this.sourceChangeKey_ = null;
    }
    this.sourceReady_ = false;
    const source = this.getSource();
    if (source) {
      this.sourceChangeKey_ = listen(
        source,
        EventType.CHANGE,
        this.handleSourceChange_,
        this,
      );
      if (source.getState() === 'ready') {
        this.sourceReady_ = true;
        setTimeout(() => {
          this.dispatchEvent('sourceready');
        }, 0);
      }
    }
    this.changed();
  }

  getFeatures(pixel) {
    if (!this.renderer_) {
      return Promise.resolve([]);
    }
    return this.renderer_.getFeatures(pixel);
  }

  getData(pixel) {
    if (!this.renderer_ || !this.rendered) {
      return null;
    }
    return this.renderer_.getData(pixel);
  }
  isVisible(view) {
    let frameState;
    const map = this.getMapInternal();
    if (!view && map) {
      view = map.getView();
    }
    if (view instanceof View) {
      frameState = {
        viewState: view.getState(),
        extent: view.calculateExtent(),
      };
    } else {
      frameState = view;
    }
    if (!frameState.layerStatesArray && map) {
      frameState.layerStatesArray = map.getLayerGroup().getLayerStatesArray();
    }
    let layerState;
    if (frameState.layerStatesArray) {
      layerState = frameState.layerStatesArray.find(
        (layerState) => layerState.layer === this,
      );
    } else {
      layerState = this.getLayerState();
    }

    const layerExtent = this.getExtent();

    return (
      inView(layerState, frameState.viewState) &&
      (!layerExtent || intersects(layerExtent, frameState.extent))
    );
  }

  getAttributions(view) {
    if (!this.isVisible(view)) {
      return [];
    }
    const getAttributions = this.getSource()?.getAttributions();
    if (!getAttributions) {
      return [];
    }
    const frameState =
      view instanceof View ? view.getViewStateAndExtent() : view;
    let attributions = getAttributions(frameState);
    if (!Array.isArray(attributions)) {
      attributions = [attributions];
    }
    return attributions;
  }

  render(frameState, target) {
    const layerRenderer = this.getRenderer();

    if (layerRenderer.prepareFrame(frameState)) {
      this.rendered = true;
      return layerRenderer.renderFrame(frameState, target);
    }
    return null;
  }

  unrender() {
    this.rendered = false;
  }
  getDeclutter() {
    return undefined;
  }
  renderDeclutter(frameState, layerState) { }

  renderDeferred(frameState) {
    const layerRenderer = this.getRenderer();
    if (!layerRenderer) {
      return;
    }
    layerRenderer.renderDeferred(frameState);
  }
  setMapInternal(map) {
    if (!map) {
      this.unrender();
    }
    this.set(LayerProperty.MAP, map);
  }

  getMapInternal() {
    return this.get(LayerProperty.MAP);
  }

  setMap(map) {
    if (this.mapPrecomposeKey_) {
      unlistenByKey(this.mapPrecomposeKey_);
      this.mapPrecomposeKey_ = null;
    }
    if (!map) {
      this.changed();
    }
    if (this.mapRenderKey_) {
      unlistenByKey(this.mapRenderKey_);
      this.mapRenderKey_ = null;
    }
    if (map) {
      this.mapPrecomposeKey_ = listen(
        map,
        RenderEventType.PRECOMPOSE,
        this.handlePrecompose_,
        this,
      );
      this.mapRenderKey_ = listen(this, EventType.CHANGE, map.render, map);
      this.changed();
    }
  }

  handlePrecompose_(renderEvent) {
    const layerStatesArray = (renderEvent)
      .frameState.layerStatesArray;
    const layerState = this.getLayerState(false);
    assert(
      !layerStatesArray.some(
        (arrayLayerState) => arrayLayerState.layer === layerState.layer,
      ),
      'A layer can only be added to the map once. Use either `layer.setMap()` or `map.addLayer()`, not both.',
    );
    layerStatesArray.push(layerState);
  }

  setSource(source) {
    this.set(LayerProperty.SOURCE, source);
  }

  getRenderer() {
    if (!this.renderer_) {
      this.renderer_ = this.createRenderer();
    }
    return this.renderer_;
  }

  hasRenderer() {
    return !!this.renderer_;
  }

  createRenderer() {
    return null;
  }
  disposeInternal() {
    if (this.renderer_) {
      this.renderer_.dispose();
      delete this.renderer_;
    }

    this.setSource(null);
    super.disposeInternal();
  }
}

export function inView(layerState, viewState) {
  if (!layerState.visible) {
    return false;
  }
  const resolution = viewState.resolution;
  if (
    resolution < layerState.minResolution ||
    resolution >= layerState.maxResolution
  ) {
    return false;
  }
  const zoom = viewState.zoom;
  return zoom > layerState.minZoom && zoom <= layerState.maxZoom;
}

export default Layer;
