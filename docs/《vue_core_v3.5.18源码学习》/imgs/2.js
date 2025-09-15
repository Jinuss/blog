let renderer;

const rendererOptions = /* @__PURE__ */ shared.extend({ patchProp }, nodeOps);

function ensureRenderer() {
  return renderer || (renderer = runtimeCore.createRenderer(rendererOptions));
}

const createApp = (...args) => {
    const app = ensureRenderer().createApp(...args);
    const { mount } = app;
    app.mount = (containerOrSelector) => {
        const container = normalizeContainer(containerOrSelector);
        if (!container) {
            return;
        }
        const component = app._component;
        if (!shared.isFunction(component) && !component.render && !component.template) {
            component.template = container.innerHTML;
        }
        if (container.nodeType === 1) {
            container.textContent = "";
        }
        const proxy = mount(container, false, resolveRootNamespace(container));
        if (container instanceof Element) {
            container.removeAttribute("v-cloak");
            container.setAttribute("data-v-app", "");
        }
        return proxy;
    }
    return app;
}