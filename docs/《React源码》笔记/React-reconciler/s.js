function performWorkOnRoot(root, lanes, forceSync) {
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
    throw new Error("Should not already be working.");
  }

  const shouldTimeSlice =
    (!forceSync &&
      !includesBlockingLane(lanes) &&
      !includesExpiredLane(root, lanes)) ||
    checkIfRootIsPrerendering(root, lanes);

  let exitStatus = shouldTimeSlice
    ? renderRootConcurrent(root, lanes)
    : renderRootSync(root, lanes, true);
  let renderWasConcurrent = shouldTimeSlice;

  do {
    if (exitStatus === RootInProgress) {
      if (workInProgressRootIsPrerendering && !shouldTimeSlice) {
        const didAttemptEntireTree = false;
        markRootSuspended(root, lanes, NoLane, didAttemptEntireTree);
      }
      break;
    } else {

      const finishedWork = root.current.alternate;
      if (
        renderWasConcurrent &&
        !isRenderConsistentWithExternalStores(finishedWork)
      ) {
        exitStatus = renderRootSync(root, lanes, false);
        renderWasConcurrent = false;
        continue;
      }

      /**
       *  错误处理
       * */

      finishConcurrentRender(
        root,
        exitStatus,
        finishedWork,
        lanes,
        renderEndTime,
      );
    }
  } while (true);
  ensureRootIsScheduled(root);
}
