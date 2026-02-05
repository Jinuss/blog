function beginWork(current, workInProgress, renderLanes) {
  if (current != null) {
    if (current.memoizedProps !== workInProgress.pendingProps) {
      didReceiveUpdate = true;
    } else {
      const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(
        current,
        renderLanes,
      );
      if (
        !hasScheduledUpdateOrContext &&
        (workInProgress.flags & DidCapture) === NoFlags
      ) {
        didReceiveUpdate = false;
        return attemptEarlyBailoutIfNoScheduledUpdate(
          current,
          workInProgress,
          renderLanes,
        );
      }

      if ((current.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
        didReceiveUpdate = true;
      } else {
        didReceiveUpdate = false;
      }
    }
  } else {
    didReceiveUpdate = false;
    if (getIsHydrating() && isForkedChild(workInProgress)) {
      const slotIndex = workInProgress.index;
      const numberOfForks = getForksAtLevel(workInProgress);
      pushTreeId(workInProgress, numberOfForks, slotIndex);
    }
  }

  workInProgress.lanes = NoLanes;
  switch (workInProgress.tag) {
    case LazyComponent: {
      const elementType = workInProgress.elementType;
      return mountLazyComponent(
        current,
        workInProgress,
        elementType,
        renderLanes,
      );
    }
    case FunctionComponent: {
      const Component = workInProgress.type;
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        workInProgress.pendingProps,
        renderLanes,
      );
    }

    case ClassComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps = resolveClassComponentProps(
        Component,
        unresolvedProps,
      );
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    case HostRoot: {
      return updateHostRoot(current, workInProgress, renderLanes);
    }
    case HostHoistable: {
      if (supportsResources) {
        return updateHostHoistable(current, workInProgress, renderLanes);
      }
    }
    case HostSingleton: {
      if (supportsSingletons) {
        return updateHostSingleton(current, workInProgress, renderLanes);
      }
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
    case HostText:
      return updateHostText(current, workInProgress);
    case SuspenseComponent:
      return updateSuspenseComponent(current, workInProgress, renderLanes);
    case HostPortal:
      return updatePortalComponent(current, workInProgress, renderLanes);
    case ForwardRef: {
      return updateForwardRef(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes,
      );
    }
    case Fragment:
      return updateFragment(current, workInProgress, renderLanes);
    case Mode:
      return updateMode(current, workInProgress, renderLanes);
    case Profiler:
      return updateProfiler(current, workInProgress, renderLanes);
    case ContextProvider:
      return updateContextProvider(current, workInProgress, renderLanes);
    case ContextConsumer:
      return updateContextConsumer(current, workInProgress, renderLanes);
    case MemoComponent: {
      return updateMemoComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes,
      );
    }
    case SimpleMemoComponent: {
      return updateSimpleMemoComponent(
        current,
        workInProgress,
        workInProgress.type,
        workInProgress.pendingProps,
        renderLanes,
      );
    }
    case IncompleteClassComponent: {
      if (disableLegacyMode) {
        break;
      }
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps = resolveClassComponentProps(
        Component,
        unresolvedProps,
      );
      return mountIncompleteClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    case IncompleteFunctionComponent: {
      if (disableLegacyMode) {
        break;
      }
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps = resolveClassComponentProps(
        Component,
        unresolvedProps,
      );
      return mountIncompleteFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    case SuspenseListComponent: {
      return updateSuspenseListComponent(current, workInProgress, renderLanes);
    }
    case ScopeComponent: {
      if (enableScopeAPI) {
        return updateScopeComponent(current, workInProgress, renderLanes);
      }
      break;
    }
    case ActivityComponent: {
      return updateActivityComponent(current, workInProgress, renderLanes);
    }
    case OffscreenComponent: {
      return updateOffscreenComponent(
        current,
        workInProgress,
        renderLanes,
        workInProgress.pendingProps,
      );
    }
    case LegacyHiddenComponent: {
      if (enableLegacyHidden) {
        return updateLegacyHiddenComponent(
          current,
          workInProgress,
          renderLanes,
        );
      }
      break;
    }
    case CacheComponent: {
      return updateCacheComponent(current, workInProgress, renderLanes);
    }
    case TracingMarkerComponent: {
      if (enableTransitionTracing) {
        return updateTracingMarkerComponent(
          current,
          workInProgress,
          renderLanes,
        );
      }
      break;
    }
    case ViewTransitionComponent: {
      if (enableViewTransition) {
        return updateViewTransition(current, workInProgress, renderLanes);
      }
      break;
    }
    case Throw: {
      throw workInProgress.pendingProps;
    }  
  }
}
