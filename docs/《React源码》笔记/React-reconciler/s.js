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

  do{
    if(){
      
    }
  }while(true);
  ensureRootIsScheduled(root) 
}
