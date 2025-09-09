function watchSyncEffect(effect, options) {
    return doWatch(effect, null, { flush: "sync" })
}