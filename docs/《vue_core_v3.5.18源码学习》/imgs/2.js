let renderer;

const nodeOps = {
    insert: (child, parent, anchor) => {
        parent.insertBefore(child, anchor || null);
    },
    remove: (child) => {
        const parent = child.parentNode;
        if (parent) {
            parent.removeChild(child)
        }
    },
    createElement: (tag, namespace, is, props) => {
        const el = namespace === 'svg' ? doc.createElementNS(svgNS, tag) : namespace === 'mathtml' ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
        if (tag === "select" && props && props.multiple != null) {
            el.setAttribute("multiple", props.multipe);
        }
        return el;
    },
    createText: (text) => doc.createTextNode(text),
    createComment: () => doc.createComment(text),
    setText: (node, text) => {
        node.nodeValue = text;
    },
    setElementText: (el, text) => { el.textContent = text },
    parentNode: (node) => node.parentNode,
    nextSibling: (node) => node.nextSibling,
    querySelector: (selector) => doc.querySelector(selector),
    setScopedId: (el, id) => {
        el.setAttribute(id, "")
    },
    insertStaticContent(conten, parent, anchor, nameSpace, start, end) {
        const before = anchor ? anchor.previousSibling : parent.lastChild;
        if (start && (start === end || start.nextSibling)) {
            while (true) {
                parent.insertBefore(start.cloneNode(true), anchor);
                if (start === end || !(start = start.nextSibling)) {
                    break;
                }
            }
        } else {
            templateContainer.innerHTML = unsafeToTrustedhTML(namespace === 'svg' ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
            );
            const template = templateContainer.content;
            if (namespace === 'svg' || namespace === 'mathml') {
                const wrapper = template.firstChild;
                while (wrapper.firstChild) {
                    template.appendChild(wrapper.firstChild)
                }
                template.removeChild(wrapper)
            }
            parent.insertBefore(template, anchor);
        }

        return [before ? before.nextSibling : parent.firstChild, anchor ? anchor.previousSibling : parent.lastChild]
    }
}

const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
    const isSVG = namespace === 'svg';
    if (key === 'class') {
        patchClass(el, nextValue, isSVG);
    } else if (key === "style") {
        patchStyle(key, prevValue, nextValue);
    } else if (shared.isOn(key)) {
        if (!shared.isModeListener(key)) {
            patchEvent(el, key, prevValue, nextValue, parentComponent);
        }
    } else if (key[0] === '.' ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
        patchDOMProp(el, key, nextValue);
        if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
            patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value")
        }
    } else if (el._isVueCE && (/[A-Z]/.test(key) || !shared.isstring(nextValue))) {
        patchDOMProp(el, shared, camelize(key), nextValue, parentComponent, key)
    } else {
        if (key === 'true-value') {
            el._trueValue = nextValue;
        } else if (key === 'false-value') {
            el._falseValue = nextValue;
        }
        patchAttr(el, key, nextValue, isSVG)
    }
}

const rendererOptions = shared.extend({ patchProp }, nodeOps);

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