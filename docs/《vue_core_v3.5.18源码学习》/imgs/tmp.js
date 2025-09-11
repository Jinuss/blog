const queue = [];
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let flushIndex = -1;
let postFlushIndex = 0;

const getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;

function findInsertionIndex(id) {
    let start = flushIndex + 1;
    let end = queue.length;
    while (start < end) {
        const middle = start + end >>> 1;
        const middleJob = queue[middle];
        const middleJobId = getId(middleJob);
        if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
            start = middle + 1;
        } else {
            end = middle;
        }
    }
    return start;
}

function queueJob(job) {
    if (!(job.flags & 1)) {
        const jobId = getId(job);
        const lastJob = queue[queue.length - 1];
        if (!lastJob || !(job.flags & 2) && jobId >= getId(lastJob)) {
            queue.push(job);
        } else {
            queue.splice(findInsertionIndex(jobId), 0, job)
        }
        job.flags |= 1;
        queueFlush();
    }
}

let currentFlushPromise = null;

const resolvePromise = Promise.resolve();

function queueFlush() {
    if (!currentFlushPromise) {
        currentFlushPromise = resolvePromise.then(flushJobs);
    }
}

function flushJobs() {
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex];
            if (job && !(job.flags & 8)) {
                if (job.flags & 4) {
                    job.flags &= ~1;
                }
                callWithErrorHandling(job, job.i, job.i ? 15 : 14);
                if (!(job.flags & 4)) {
                    job.flags &= ~1;
                }
            }
        }
    } finally {
        for (; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex];
            if (job) {
                job.flags &= -2;
            }
        }
        flushIndex = -1;
        queue.length = 0;
        flushPostFlushCbs();
        currentFlushPromise = null;
        if (queue.length || pendingPostFlushCbs.length) {
            flushJobs();
        }
    }
}

function flushPostFlushCbs() {
    if (pendingPostFlushCbs.length) {
        const deduped = [...new Set(pendingPostFlushCbs)].sort((a, b) => getId(a) - getId(b))
        pendingPostFlushCbs.length = 0;
        if (activePostFlushCbs) {
            activePostFlushCbs.push(...deduped);
            return;
        }
        activePostFlushCbs = deduped;
        for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
            const cb = activePostFlushCbs[postFlushIndex];
            if (cb.flags & 4) {
                cb.flags &= -2;
            }
            if (!(cb.flags & 8)) {
                cb();
            }
            cb.flags &= -2;
        }
        activePostFlushCbs = null;
        postFlushIndex = 0;
    }
}

function queueEffectWithSuspense(fn, suspense) {
    if (suspense && suspense.pendingBranch) {
        if (shared.isArray(fn)) {
            suspense.effects.push(...fn)
        } else {
            suspense.effects.push(fn)
        }
    } else {
        queuePostFlushCb(fn)
    }
}

function queuePostFlushCb(cb) {
    if (!shared.isArray(cb)) {
        if (activePostFlushCbs && cb.id === -1) {
            activePostFlushCbs.splice(postFlushIndex + 1, 0, cb)
        } else if (!(cb.flags & 1)) {
            pendingPostFlushCbs.push(cb);
            cb.flags |= 1;
        }
    } else {
        pendingPostFlushCbs.push(...cb)
    }
    queueFlush()
}

function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
    for (; i < queue.length; i++) {
        const cb = queue[i];
        if (cb && cb.flags & 2) {
            if (instance && cb.id !== instance.id) {
                continue;
            }
            queue.splice(i, 1);
            i--;
            if (cb.flags & 4) {
                cb.flags &= -2;
            }
            cb();
            if (!(cb.flags & 4)) {
                cb.flags &= -2;
            }
        }
    }
}