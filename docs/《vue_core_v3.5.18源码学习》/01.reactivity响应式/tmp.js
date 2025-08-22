const targetMap = new WeakMap();

function track(target, type, key) {
    if (shouldTrack && activeSub) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, depsMap = new Map());
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, dep = new Dep());
            dep.map = depsMap;
            dep.key = key;
        }
        dep.track();
    }
}

function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        globalVersion++;
        return;
    }
    const run = (dep) => {
        if (dep) {
            dep.trigger();
        }
    };
    startBatch();
    if (type === "clear") {
        depsMap.forEach(run);
    } else {
        const targetIsArray = isArray(target);
        const isArrayIndex = targetIsArray && isIntegerKey(key);
        if (targetIsArray && key === "length") {
            const newLength = Number(newValue);
            depsMap.forEach((dep, key2) => {
                if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
                    run(dep);
                }
            });
        } else {
            if (key !== void 0 || depsMap.has(void 0)) {
                run(depsMap.get(key));
            }
            if (isArrayIndex) {
                run(depsMap.get(ARRAY_ITERATE_KEY));
            }
            switch (type) {
                case "add":
                    if (!targetIsArray) {
                        run(depsMap.get(ITERATE_KEY));
                        if (isMap(target)) {
                            run(depsMap.get(MAP_KEY_ITERATE_KEY));
                        }
                    } else if (isArrayIndex) {
                        run(depsMap.get("length"));
                    }
                    break;
                case "delete":
                    if (!targetIsArray) {
                        run(depsMap.get(ITERATE_KEY));
                        if (isMap(target)) {
                            run(depsMap.get(MAP_KEY_ITERATE_KEY));
                        }
                    }
                    break;
                case "set":
                    if (isMap(target)) {
                        run(depsMap.get(ITERATE_KEY));
                    }
                    break;
            }
        }
    }
    endBatch();
}