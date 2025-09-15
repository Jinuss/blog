function createRenderer(options) {
    return baseCreateRenderer(options);
}

function baseCreateRenderer(options, createHydrationFns) {
    const target = shared.getGlobalThis();
    target.__VUE__ = true;
    const {
        insert: hostInsert,
        remove: hostRemove,
        patchProp: hostPatchProp,
        createElement: hostCreateElement,
        createText: hostCreateText,
        createComment: hostCreateComment,
        setText: hostSetText,
        setElementText: hostSetElementText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
        setScopeId: hostSetScopeId = shared.NOOP,
        insertStaticContent: hostInsertStaticContent
    } = options;

    const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => { };

    const processText = (n1, n2, container, anchor) => { };

    const processCommentNode = (n1, n2, container, anchor) => { };

    const mountStaticNode = (n2, container, anchor, namespace) => { };

    const moveStaticsNode = ({ el, anchor }, container, nextSibling) => { };

    const removeStaticNode = ({ el, anchor }) => { };

    const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => { };
    const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => { };
    const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => { };
    const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => { };
    const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => { };
    const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => { };
    const pathProps = (el, oldProps, newProps, parentComponent, namespace) => { };
    const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => { };
    const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => { };
    const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => { };
    const updateComponent = (n1, n2, optimized) => { };
    const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => { };
    const updateComponentPreRender = (instance, nextVNode, optimized) => { };
    const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => { };
    const patchUnKeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => { };
    const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => { };
    const move = (vnode, container, anchor, moveType, parentSuspense = null) => { };
    const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => { };
    const remove = (vnode) => { };
    const removeFragment = (cur, end) => { }
    const unmountComponent = (instance, parentSuspense, doRemove) => { }
    const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => { };
    const getNextHostNode = (vnode) => { }

    let isFlushing = false;
    const render = (vnode, container, namespace) => {
        if (vnode == null) {
            if (container._vnode) {
                unmount(container._vnode, null, null, true)
            }
        } else {
            patch(
                container._vnode || null,
                vnode,
                container,
                null,
                null,
                null,
                namespace
            )
        }
        container._vnode = vnode;
        if (!isFlushing) {
            isFlushing = true;
            flushPreFlushCbs();
            flushPostFlushCbs();
            isFlushing = false;
        }
    };
    const internals = {
        p: patch,
        um: unmount,
        m: move,
        r: remove,
        mt: mountComponent,
        mc: mountChildren,
        pc: patchChildren,
        pbc: patchBlockChildren,
        n: getNextHostNode,
        o: options
    };
    let hydrate;
    let hydrateNode;
    if (createHydrationFns) {
        [hydrate, hydrateNode] = createHydrationFns(internals);
    }
    return {
        render,
        hydrate,
        createApp: createAppAPI(render, hydrate)
    }
}

function createAppContext() {
    return {
        app: null,
        config: {
            isNativeTag: shared.NO,
            performance: false,
            globalProperties: {},
            optionMergeStrategies: {},
            errorHandler: void 0,
            warnHandler: void 0,
            compilerOptions: {}
        },
        mixins: [],
        components: {},
        directives: {},
        provides: /* @__PURE__ */ Object.create(null),
        optionsCache: /* @__PURE__ */ new WeakMap(),
        propsCache: /* @__PURE__ */ new WeakMap(),
        emitsCache: /* @__PURE__ */ new WeakMap()
    };
}

function createAppAPI(render, hydrate) {
    return function createApp(rootComponent, rootProps = null) {
        if (!shared.isFunction(rootComponent)) {
            rootComponent = shared.extend({}, rootComponent)
        }
        if (rootProps != null && !shared.isObject(rootProps)) {
            rootProps = null
        }

        const context = createAppContext();
        const installedPlugins = new WeakSet();
        const pluginCleanupFns = [];
        let isMounted = false;
        const app = context.app = {
            _uid: uid$1++,
            _component: rootComponent,
            _props: rootProps,
            _container: null,
            _context: context,
            _instance: null,
            version,
            get config() {
                return context.config;
            },
            set config(v) {

            },
            use(plugin, ...options) {
                if (installedPlugins.has(plugin));
                else if (plugin && shared.isFunction(plugin.install)) {
                    installedPlugins.add(plugin);
                    plugin.install(app, ...options);
                } else if (shared.isFunction(plugin)) {
                    installedPlugins.add(plugin);
                    plugin(app, ...options);
                }
                return app;
            },
            mixin(mixin) {
                if (!context.mixins.includes(mixin)) {
                    context.mixins.push(mixin)
                }
                return app;
            },
            component(name, component) {
                if (!component) {
                    return context.components[name];
                }
                context.components[name] = component;
                return app;
            },
            directive(name, directive) {
                if (!directive) {
                    return context.directives[name];
                }
                context.directives[name] = directive;
                return app;
            },
            mount(rootContainer, isHydrate, namespace) {
                if (!isMounted) {
                    const vnode = app._ceVNode || createVNode(rootComponent, rootProps)
                    vnode.appContext = context;
                    if (namespace === true) {
                        namespace = 'svg';
                    } else if (namespace === false) {
                        namespace = void 0;
                    }
                    if (isHydrate && hydrate) {
                        hydrate(vnode, rootContainer)
                    } else {
                        render(vnode, rootContainer, namespace)
                    }
                    isMounted = true;
                    app._container = rootContainer;
                    rootContainer.__vue_app__ = app;
                    return getComponentPublicInstance(vnode.component)
                }
            },
            onUnmount(cleanupFn) {
                pluginCleanupFns.push(cleanupFn)
            },
            unmount() {
                if (isMounted) {
                    callWithAsyncErrorHandling(pluginCleanupFns, app._instance, 16)
                    render(null, app._container);
                    delete app._container.__vue_app__;
                }
            },
            provide(key, value) {
                context.provides[key] = value;
            },
            runWithContext(fn) {
                const lastApp = currentApp;
                currentApp = app;
                try {
                    fn();
                } finally {
                    currentApp = lastApp;
                }
            }
        }
        return app;
    }
}