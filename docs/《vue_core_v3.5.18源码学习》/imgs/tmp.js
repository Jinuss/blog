function instanceWatch(source, value, options) {
    const publicThis = this.proxy;
    const getter = shared.isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
    let cb;
    if (shared.isFunction(value)) {
        cb = value;
    } else {
        cb = value.handler;
        options = value;
    }

    const reset = setCurrentInstance(this);
    const res = doWatch(getter, cb.bind(publicThis), options);
    reset();
    return res;
}