// Could this be a custom hook?
function getMore(e, options) {
  const {
    pageSize,
    page,
    setPage,
    lastContentHeight,
    setLastContentHeight,
    fetchFunc,
  } = options || {};
  const scrollEvent = e.nativeEvent;
  const topOfScreen = scrollEvent.contentOffset.y;
  const screenHeight = scrollEvent.layoutMeasurement.height;
  const bottomOfScreenPosition = topOfScreen + screenHeight;
  const bottomOfContent = scrollEvent.contentSize.height;
  const distanceFromBottomOfContent = bottomOfContent - bottomOfScreenPosition;
  const fetchThreshold = 2000;
  if (
    distanceFromBottomOfContent < fetchThreshold &&
    bottomOfContent > lastContentHeight &&
    topOfScreen > 0
  ) {
    // Prevent duplicate requests
    setLastContentHeight(bottomOfContent);
    const params = {
      limit: pageSize,
      offset: page * pageSize,
    };
    fetchFunc({params});
    setPage((pagePrevious) => pagePrevious + 1);
  }
}

export default getMore;
