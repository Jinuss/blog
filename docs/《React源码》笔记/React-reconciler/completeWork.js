function completeUnitOfWork(unitOfWork) {
  var completedWork = unitOfWork;
  do {
    if (NoFlags !== (completedWork.flags & Incomplete)) {
      unwindUnitOfWork(
        completedWork,
        workInProgressRootDidSkipSuspendedSiblings,
      );
      return;
    }
    unitOfWork = completedWork.return;
    var next = completeWork(
      completedWork.alternate,
      completedWork,
      entangledRenderLanes,
    );
    if (null !== next) {
      workInProgress = next;
      return;
    }
    completedWork = completedWork.sibling;
    if (null !== completedWork) {
      workInProgress = completedWork;
      return;
    }
    workInProgress = completedWork = unitOfWork;
  } while (null !== completedWork);
  RootInProgress === workInProgressRootExitStatus &&
    (workInProgressRootExitStatus = RootCompleted);
}

function completeWork(current, workInProgress, renderLanes) {
  var newProps = workInProgress.pendingProps;
  popTreeContext(workInProgress);
  switch (workInProgress.tag) {
    case IncompleteFunctionComponent:
    case LazyComponent:
    case SimpleMemoComponent:
    case FunctionComponent:
    case ForwardRef:
    case Fragment:
    case Mode:
    case PRofiler:
    case ContextConsumer:
    case MemoComponent:
      bubbleProperties(workInProgress);
      return null;
    case ClassComponent: {
      bubbleProperties(workInProgress);
      return null;
    }
    case HostRoot: {
      const fiberRoot = workInProgress.stateNode;
      let previousCache = null;
      if (current !== null) {
        previousCache = current.memoizedState.cache;
      }
      const cache = workInProgress.memoizedState.cache;
      if (cache !== previousCache) {
        workInProgress.flags |= Passive;
      }

      popCachePRovider(workInProgress, cache);

      popRootTransition(workInProgress, fiberRoot, renderLanes);

      popHostContainer(workInProgress);

      popTopLevelLegacyContextObject(workInProgress);

      if (fiberRoot.pendingContext) {
        fiberRoot.context = fiberRoot.pendingContext;
        fiberRoot.pendingContext = null;
      }
      if (current === null || current.child === null) {
        const wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          emitPendingHydrationWarnings();
          markUpdate(workInProgress);
        } else {
          if (current !== null) {
            const prevState = current.memoizedState;
            if (
              !prevState.isDehydrated ||
              (workInProgress.flags & ForceClientRender) !== NoFlags
            ) {
              workInProgress.flags |= Snapshot;
              upgradeHydrationErrorsToRecoverable();
            }
          }
        }
      }

      updateHostContainer(current, workInProgress);
      bubbleProperties(workInProgress);

      return null;
    }
    case HostHoistable: {
      const type = workInProgress.type;
      const nextResource = workInProgress.memoizedState;
      if (current === null) {
        markUpdate(workInProgress);
        if (nextResource !== null) {
          bubbleProperties(workInProgress);
          preloadResourceAndSuspendIfNeeded(
            workInProgress,
            nextResource,
            type,
            newProps,
            renderLanes,
          );
          return null;
        } else {
          bubbleProperties(workInProgress);
          preloadInstanceAndSuspendIfNeeded(
            workInProgress,
            type,
            null,
            newProps,
            renderLanes,
          );
          return null;
        }
      } else {
        if (nextResource) {
          if (nextResource !== current.memoizedState) {
            markUpdate(workInProgress);
            bubbleProperties(workInProgress);
            preloadResourceAndSuspendIfNeeded(
              workInProgress,
              nextResource,
              type,
              newProps,
              renderLanes,
            );
            return null;
          } else {
            bubbleProperties(workInProgress);
            workInProgress.flags &= ~MaySuspendCommit;
            return null;
          }
        } else {
          const oldProps = current.memoizedProps;
          if (supportsMutation) {
            if (oldProps !== newProps) {
              markUpdate(workInProgress);
            }
          } else {
            updateHostComponent(
              current,
              workInProgress,
              type,
              newProps,
              renderLanes,
            );
          }
          bubbleProperties(workInProgress);
          preloadInstanceAndSuspendIfNeeded(
            workInProgress,
            type,
            oldProps,
            newProps,
            renderLanes,
          );
          return null;
        }
      }
    }
    case HostSingleton: {
      popHostContext(workInProgress);
      renderLanes = rootInstanceStackCursor.current;
      type = workInProgress.type;
      if (null !== current && null != workInProgress.stateNode)
        current.memoizedProps !== newProps && markUpdate(workInProgress);
      else {
        if (!newProps) {
          if (null === workInProgress.stateNode)
            throw Error(formatProdErrorMessage(166));
          bubbleProperties(workInProgress);
          return null;
        }
        current = contextStackCursor.current;
        popHydrationState(workInProgress)
          ? prepareToHydrateHostInstance(workInProgress, current)
          : ((current = resolveSingletonInstance(type, newProps, renderLanes)),
            (workInProgress.stateNode = current),
            markUpdate(workInProgress));
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case HostComponent: {
      popHostContext(workInProgress);
      const type = workInProgress.type;
      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          renderLanes,
        );
      } else {
        if (!newProps) {
          if (workInProgress.stateNode === null) {
            throw new Error(
              "HostComponent should have a DOM element initialized. This error is likely caused by a bug in React. Please file an issue.",
            );
          }

          bubbleProperties(workInProgress);
          return null;
        }
        const currentHostContext = getHostContext();
        const wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          prepareToHydrateHostInstance(workInProgress, currentHostContext);
          if (
            finalizeHydratedChildren(
              workInProgress.stateNode,
              type,
              newProps,
              currentHostContext,
            )
          ) {
            workInProgress.flags |= Hydrate;
          }
        } else {
          const rootContainerInstance = getRootHostContainer();
          const instance = createInstance(
            type,
            newProps,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );
          markCloned(workInProgress);
          appendAllChildren(instance, workInProgress, false, false);
          workInProgress.stateNode = instance;
          if (
            finalizeInitialChildren(
              instance,
              type,
              newProps,
              currentHostContext,
            )
          ) {
            markUpdate(workInProgress);
          }
        }
      }
      bubbleProperties(workInProgress);
      preloadInstanceAndSuspendIfNeeded(
        workInProgress,
        workInProgress.type,
        current === null ? null : current.memoizedProps,
        workInProgress.pendingProps,
        renderLanes,
      );
      return null;
    }
    case HostText: {
      const newText = newProps;
      if (current && workInProgress.stateNode != null) {
        const oldText = current.memoizedProps;
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        if (typeof newText !== "string") {
          if (workInProgress.stateNode === null) {
            throw new Error(
              "HostText should have a text node initialized. This error is likely caused by a bug in React. Please file an issue.",
            );
          }
        }

        const rootContainerInstance = getRootHostContainer();
        const currentHostContext = getHostContext();
        const wasHydrated = popHydrationState(workInProgress);
        if (wasHydrated) {
          prepareToHydrateHostTextInstance(workInProgress);
        } else {
          markCloned(workInProgress);
          workInProgress.stateNode = createTextInstance(
            newText,
            rootContainerInstance,
            currentHostContext,
            workInProgress,
          );
        }
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case ActivityComponent: {
      const nextState = workInProgress.memoizedState;
      if (current === null || current.memoizedState !== null) {
        const fallthroughToNormalOffscreenPath =
          completeDehydrateActivityBoundary(current, workInProgress, nextState);
        if (!fallthroughToNormalOffscreenPath) {
          if (workInProgress.flags & ForceClientRender) {
            popSuspenseHandler(workInProgress);
            return workInProgress;
          } else {
            popSuspenseHandler(workInProgress);
            return null;
          }
        }
      }

      bubbleProperties(workInProgress);
      return null;
    }
    case SuspenseComponent: {
      const nextState = workInProgress.memoizedState;
      if (
        current !== null ||
        (current.memoizedState !== null &&
          current.memoizedState.dehydrated !== null)
      ) {
        const fallthroughToNormalSuspensePath =
          completeDehydratedSuspenseBoundary(
            current,
            workInProgress,
            nextState,
          );
        if (!fallthroughToNormalSuspensePath) {
          if (workInProgress.flags & ForceClientRender) {
            popSuspenseHandler(workInProgress);
            return workInProgress;
          } else {
            popSuspenseHandler(workInProgress);
            return null;
          }
        }
      }

      popSuspenseHandler(workInProgress);

      if ((workInProgress.flags & DidCapture) !== NoFlags) {
        workInProgress.lanes = renderLanes;
        return workInProgress;
      }
      const nextDidTimeout = nextState !== null;
      const prevDidTimeout = current !== null && current.memoizedState !== null;

      if (nextDidTimeout) {
        const offscreenFiber = workInProgress.child;
        let previousCache = null;
        if (
          offscreenFiber.alternate !== null &&
          offscreenFiber.alternate.memoizedState !== null &&
          offscreenFiber.alternate.memoizedState.cachePool !== null
        ) {
          previousCache = offscreenFiber.alternate.memoizedState.cachePool.pool;
        }
        let cache = null;
        if (
          offscreenFiber.memoizedState !== null &&
          offscreenFiber.memoizedState.cachePool !== null
        ) {
          cache = offscreenFiber.memoizedState.cachePool.pool;
        }
        if (cache !== previousCache) {
          offscreenFiber.flags |= Passive;
        }
      }

      if (nextDidTimeout !== prevDidTimeout) {
        if (nextDidTimeout) {
          const offsreenFiber = workInProgress.child;
          offsreenFiber.flags |= Visibility;
        }
      }

      const retryQueue = workInProgress.updateQueue;
      scheduleRetryEffect(workInProgress, retryQueue);
      bubbleProperties(workInProgress);
      return null;
    }
    case HostPortal: {
      popHostContainer(workInProgress);
      updateHostContainer(current, workInProgress);
      if (current === null) {
        preparePortalMount(workInProgress.stateNode.containerInfo);
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case ContextProvider: {
      const context = workInProgress.type;
      popProvider(context, workInProgress);
      bubbleProperties(workInProgress);
      return null;
    }
    case SuspenseListComponent: {
      popSuspenseListContext(workInProgress);
      const renderState = workInProgress.memoizedState;
      if (renderState === null) {
        bubbleProperties(workInProgress);
        return null;
      }
      let didSuspendAlready = (workInProgress.flags & DidCapture) !== NoFlags;

      const renderedTail = renderState.rendering;
      if (renderedTail === null) {
        if (!didSuspendAlready) {
          const cannotBeSuspended =
            renderHasNotSuspendedYet() &&
            (current === null || (current.flags & DidCapture) === NoFlags);
          if (!cannotBeSuspended) {
            let row = workInProgress.child;
            while (row !== null) {
              const suspended = findFirstSuspended(row);
              if (suspended !== null) {
                didSuspendAlready = true;
                workInProgress.flags |= DidCapture;
                cutOffTailIfNeeded(renderState, false);
                const retryQueue = suspended.updateQueue;
                scheduleRetryEffect(workInProgress, retryQueue);
                workInProgress.subtreeFlags = NoFlags;
                resetChildFibers(workInProgress, renderedTail);
                pushSuspenseListContext(
                  workInProgress,
                  setShallowSuspenseListContext(
                    suspenseStackCursor.current,
                    ForceSuspenseFallback,
                  ),
                );
                if (getIsHydrating()) {
                  pushTreeFork(workInProgress, renderState.treeForkCount);
                }
                return workInProgress.child;
              }
              row = row.sibling;
            }
          }
          if (renderState.tail !== null && now() > getRenderTargetTime()) {
            workInProgress.flags |= DidCapture;
            didSuspendAlready = true;

            cutOffTailIfNeeded(renderState, false);
            workInProgress.lanes = SomeRetryLane;
          }
        } else {
          cutOffTailIfNeeded(renderState, false);
        }
      } else {
        if (!didSuspendAlready) {
          const suspended = findFirstSuspended(renderedTail);
          if (suspended !== null) {
            workInProgress.flags |= DidCapture;
            didSuspendAlready = true;
            const retryQueue = suspended.updateQueue;
            workInProgress.updateQueue = retryQueue;
            scheduleRetryEffect(workInProgress, retryQueue);
            cutOffTailIfNeeded(renderState, true);
            if (
              renderState.tail === null &&
              renderState.tailMode === "hidden" &&
              !renderedTail.alternate &&
              !getIsHydrating()
            ) {
              bubbleProperties(workInProgress);
              return null;
            }
          } else if (
            now() * 2 - renderState.renderingStartTime >
              getRenderTargetTime() &&
            renderLanes !== OffscreenLane
          ) {
            workInProgress.flags |= DidCapture;
            didSuspendAlready = true;

            cutOffTailIfNeeded(renderState, false);
            workInProgress.lanes = SomeRetryLane;
          }
        }
        if (renderState.isBackwards) {
          renderedTail.sibling = workInProgress.child;
          workInProgress.child = renderedTail;
        } else {
          const previousSibling = renderState.last;
          if (previousSibling !== null) {
            previousSibling.sibling = renderedTail;
          } else {
            workInProgress.child = renderedTail;
          }
          renderState.last = renderedTail;
        }
      }
      if (renderState.tail !== null) {
        const next = renderState.tail;
        renderState.rendering = next;
        renderState.tail = next.sibling;
        renderState.renderingStartTime = now();
        next.sibling = null;
        let suspenseContext = suspenseStackCursor.current;
        if (didSuspendAlready) {
          suspenseContext = setShallowSuspenseListContext(
            suspenseContext,
            ForceSuspenseFallback,
          );
        } else {
          suspenseContext =
            setDefaultShallowSuspenseListContext(suspenseContext);
        }
        pushSuspenseListContext(workInProgress, suspenseContext);
        if (getIsHydrating()) {
          pushTreeFork(workInProgress, renderState.treeForkCount);
        }
        return next;
      }
      bubbleProperties(workInProgress);
      return null;
    }
    case OffscreenComponent:
    case LegacyHiddenComponent: {
      popSuspenseHandler(workInProgress);
      popHiddenContext(workInProgress);
      const newState = workInProgress.memoizedState;
      const nextIsHidden = newState !== null;
      if (workInProgress.tag === LegacyHiddenComponent) {
      } else {
        if (current !== null) {
          const prevState = current.memoizedState;
          const prevIsHidden = prevState !== null;
          if (prevIsHidden !== nextIsHidden) {
            workInProgress.flags |= Visibility;
          } else {
            if (nextIsHidden) {
              workInProgress.flags |= Visibility;
            }
          }
        }
      }

      if (!nextIsHidden) {
        bubbleProperties(workInProgress);
      } else {
        if (
          includesSomeLane(renderLanes, offscreenLane) &&
          (workInProgress.flags & DidCapture) === MoLanes
        ) {
          bubbleProperties(workInProgress);
          if (
            workInProgress.tag !== LegacyHiddenComponent &&
            workInProgress.subtreeFlags & (Placement | Update)
          ) {
            workInProgress.flags |= Visibility;
          }
        }
      }
      const offsreenQueue = workInProgress.updateQueue;
      if (offsreenQueue !== null) {
        const retryQueue = offsreenQueue.retryQueue;
        scheduleRetryEffect(workInProgress, retryQueue);
      }
      let previousCache = null;
      if (
        current !== null &&
        current.memoizedState !== null &&
        current.memoizedState.cachePool !== null
      ) {
        previousCache = current.memoizedState.cachePool.pool;
      }

      let cache = null;
      if (
        workInProgress.memoizedState !== null &&
        workInProgress.memoizedState.cachePool !== null
      ) {
        cache = workInProgress.memoizedState.cachePool.pool;
      }
      if (cache !== previousCache) {
        workInProgress.flags |= Passive;
      }

      popTransition(workInProgress, current);
      return null;
    }
    case CacheComponent: {
      let previousCache = null;
      if (current !== null) {
        previousCache = current.memoizedState.cache;
      }
      const cache = workInProgress.memoizedState.cache;
      if (cache !== previousCache) {
        workInProgress.flags |= Passive;
      }
      popCachePRovider(workInProgress, cache);
      bubbleProperties(workInProgress);
      return null;
    }
    case TracingMarkerComponent: {
      return null;
    }
    case ViewTransitionComponent: {
      return null;
    }
    case Throw: {
      return null;
    }
  }
}

function bubbleProperties(completedWork) {
  const didBailout =
    completedWork.alternate !== null &&
    completedWork.alternate.child === completedWork.child;
  let newChildLanes = NoLanes;
  let subtreeFlags = NoFlags;
  if (!didBailout) {
    let child = completeWork.child;
    while (child !== null) {
      newChildLanes = mergeLanes(
        newChildLanes,
        mergeLanes(child.lanes, child.childLanes),
      );
      subtreeFlags |= child.subtreeFlags;
      subtreeFlags |= child.flags;

      child.return = completedWork;
      child = child.sibling;
    }
    completeWork.subtreeFlags |= subtreeFlags;
  } else {
    let child = completedWork.child;
    while (child !== null) {
      newChildLanes = mergeLanes(
        newChildLanes,
        mergeLanes(child.lanes, child.childLanes),
      );

      subtreeFlags |= child.subtreeFlags & StaticMask;
      subtreeFlags |= child.flags & StaticMask;
      child.return = completedWork;

      child = child.sibling;
    }
    completedWork.subtreeFlags |= subtreeFlags;
  }

  completedWork.childLanes = newChildLanes;

  return didBailout;
}
