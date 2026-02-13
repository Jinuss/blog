function performWorkOnRoot(root, lanes, forceSync) {
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
    throw new Error("Should not already be working.");
  }

  const shouldTimeSlice =
    (!forceSync &&
      !includesBlockingLanes(root, lanes) &&
      !includesExpiredLanes(root, lanes)) ||
    checkIfRootIsPrerendering(root, lanes);

  let exitStatus = shouldTimeSlice
    ? renderRootConcurrent(root, lanes)
    : renderRootSync(root, lanes, true);

  let renderWasConcurrent = shouldTimeSlice;

  do {
    if (exitStatus === RootInProgress) {
      if (workInProgressRootIsPrerendering && !shouldTimeSlice) {
        markRootSuspended(root, lanes, NoLane, false);
      }
      break;
    } else {
      let renderEndTime = 0;
      const finishedWork = root.current.alternate;
      if (
        renderWasConcurrent &&
        !isRenderConsistentWithExternalStores(finishedWork)
      ) {
        exitStatus = renderRootSync(root, lanes, false);
        renderWasConcurrent = false;
        continue;
      }

      if (exitStatus == RootErrored) {
        const lanesThatJustErrored = lanes;
        const errorRetryLanes = getLanesToRetrySynchronouslyOnError(
          root,
          lanesThatJustErrored,
        );
        if (errorRetryLanes !== NoLanes) {
          lanes = errorRetryLanes;
          exitStatus = recoverFormConcurrentError(
            root,
            lanesThatJustErrored,
            errorRetryLanes,
          );

          renderWasConcurrent = false;

          if (exitStatus !== RootErrored) {
            continue;
          }
        }
      }

      if (exitStatus === RootFatalErrored) {
        prepareFreshStack(root, NoLanes);
        const didAttemptEntireTree = true;
        markRootSuspended(root, lanes, NoLane, didAttemptEntireTree);
        break;
      }

      finishConcurrentRender(
        root,
        exitStatus,
        finishedWork,
        lanes,
        renderEndTime,
      );
    }
    break;
  } while (true);

  ensureRootIsScheduled(root);
}

function renderRootSync(root, lanes, shouldYieldForPrerendering) {
  var prevExecutionContext = executionContext;
  executionContext |= RenderContext;
  var prevDispatcher = pushDispatcher(),
    prevAsyncDispatcher = pushAsyncDispatcher();
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes)
    (workInProgressTransitions = null), prepareFreshStack(root, lanes);
  lanes = !1;
  var exitStatus = workInProgressRootExitStatus;
  a: do
    try {
      if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
        var unitOfWork = workInProgress,
          thrownValue = workInProgressThrownValue;
        switch (workInProgressSuspendedReason) {
        }
      }
      workLoopSync();
      exitStatus = workInProgressRootExitStatus;
      break;
    } catch (thrownValue$165) {
      handleThrow(root, thrownValue$165);
    }
  while (1);
  lanes && root.shellSuspendCounter++;
  lastContextDependency = currentlyRenderingFiber$1 = null;
  executionContext = prevExecutionContext;
  ReactSharedInternals.H = prevDispatcher;
  ReactSharedInternals.A = prevAsyncDispatcher;
  null === workInProgress &&
    ((workInProgressRoot = null),
    (workInProgressRootRenderLanes = 0),
    finishQueueingConcurrentUpdates());
  return exitStatus;
}

function workLoopSync() {
  while (null !== workInProgress) performUnitOfWork(workInProgress);
}

function renderRootConcurrent(root, lanes) {
  var prevExecutionContext = executionContext;
  executionContext |= RenderContext;
  var prevDispatcher = pushDispatcher(),
    prevAsyncDispatcher = pushAsyncDispatcher();
  workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes
    ? ((workInProgressTransitions = null),
      (workInProgressRootRenderTargetTime = now() + 500),
      prepareFreshStack(root, lanes))
    : (workInProgressRootIsPrerendering = checkIfRootIsPrerendering(
        root,
        lanes,
      ));
  a: do
    try {
      if (
        NotSuspended !== workInProgressSuspendedReason &&
        null !== workInProgress
      ) {
        lanes = workInProgress;
        var thrownValue = workInProgressThrownValue;
        b: switch (workInProgressSuspendedReason) {
        }
      }
      workLoopConcurrentByScheduler();
      break;
    } catch (thrownValue$167) {
      handleThrow(root, thrownValue$167);
    }
  while (true);
  lastContextDependency = currentlyRenderingFiber$1 = null;
  ReactSharedInternals.H = prevDispatcher;
  ReactSharedInternals.A = prevAsyncDispatcher;
  executionContext = prevExecutionContext;
  if (null !== workInProgress) return RootInProgress;
  workInProgressRoot = null;
  workInProgressRootRenderLanes = NoLanes;
  finishQueueingConcurrentUpdates();
  return workInProgressRootExitStatus;
}

function workLoopConcurrentByScheduler() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
function performUnitOfWork(unitOfWork) {
  var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  null === next ? completeUnitOfWork(unitOfWork) : (workInProgress = next);
}

function finishConcurrentRender(
  root,
  exitStatus,
  finishedWork,
  lanes,
  renderEndTime,
) {
  switch (exitStatus) {
    case RootInProgress:
    case RootFatalErrored:
      throw Error(formatProdErrorMessage(345));
    case RootSuspendedWithDelay:
      if ((lanes & 4194048) !== lanes) break;
    case RootSuspendedAtTheShell:
      markRootSuspended(
        shouldTimeSlice,
        lanes,
        workInProgressDeferredLane,
        !workInProgressRootDidSkipSuspendedSiblings,
      );
      return;
    case RootErrored:
      workInProgressRootRecoverableErrors = null;
      break;
    case RootSuspended:
    case RootCompleted:
      break;
    default:
      throw Error(formatProdErrorMessage(329));
  }
  if (
    includesOnlyRetries(lanes) &&
    (alwaysThrottleRetries || exitStatus === RootSuspended)
  ) {
    const msUntilTimeout =
      globalMostRecentFallbackTime + FALLBACK_THROTTLE_MS - now();
    if (msUntilTimeout > 10) {
      const didAttemptEntireTree = !workInProgressRootDidSkipSuspendedSiblings;
      markRootSuspended(
        root,
        lanes,
        workInProgressDeferredLane,
        didAttemptEntireTree,
      );

      const nextLanes = getNextLanes(root, NoLanes, true);
      if (nextLanes !== NoLanes) {
        return;
      }

      pendingEffectsLanes = lanes;
      root.timeoutHandle = scheduleTimeout(
        commitRootWhenReady.bind(
          null,
          root,
          finishedWork,
          workInProgressRootRecoverableErrors,
          workInProgressTransitions,
          workInProgressRootDidIncludeRecursiveRenderUpdate,
          lanes,
          workInProgressDeferredLane,
          workInProgressRootInterleavedUpdatedLanes,
          workInProgressSuspendedRetryLanes,
          workInProgressRootDidSkipSuspendedSiblings,
          exitStatus,
          "Throttled",
          renderStartTime,
          renderEndTime,
        ),
        msUntilTimeout,
      );
      return;
    }
  }

  commitRootWhenReady(
    root,
    finishedWork,
    workInProgressRootRecoverableErrors,
    workInProgressTransitions,
    workInProgressRootDidIncludeRecursiveRenderUpdate,
    lanes,
    workInProgressDeferredLane,
    workInProgressRootInterleavedUpdatedLanes,
    workInProgressSuspendedRetryLanes,
    workInProgressRootDidSkipSuspendedSiblings,
    exitStatus,
    null,
    renderStartTime,
    renderEndTime,
  );
}
