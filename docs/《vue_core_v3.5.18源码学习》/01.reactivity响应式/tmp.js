function refreshComputed(computed) {
    if (computed.flags & 4 && !(computed.flags & 16)) {
        return;
    }
    computed.flags & =-17;
    if (computed.globalVersion === globalVersion) {
        return;
    }
    computed.globalVersion = globalVersion;
    if (!computed.isSSR && computed.flags & 128 && (!computed.deps && !computed._dirty || !isDirty(computed))) {
        return;
    }
    computed.flags |= 2;
    const dep = computed.dep;
    const prevSub = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = computed;
    shouldTrack = true;
    try {
        prepareDeps(computed);
        const value = computed.fn(computed._value);
        if (dep.version === 0 || hasChanged(value, computed._value)) {
            computed.flags |= 128;
            computed._value = value;
            dep.version++;
        }
    } catch (err) {
        dep.version++;
        throw err;
    } finally {
        activeSub = prevSub;
        shouldTrack = prevShouldTrack;
        cleanupDep(computed);
        computed.flags &= -3;
    }
}