import Toast from 'react-native-root-toast';

import requestBuilder from 'src/apis/requestBuilder.ts';
import { responseStatus } from 'src/common/constants.ts';
import { RequestBuilderParams } from 'src/types/types.ts';

type OnSuccessData =
  | Record<string, unknown>
  | Array<Record<string, unknown>>
  | null;

interface HandleResponseOptions {
  requestBuilderOptions: RequestBuilderParams;
  onSuccess?: (_: OnSuccessData) => Promise<void>;
  onFailure?: () => Promise<void>;
  setLoading?: (bool) => void;
}

// Could this be a custom hook?
export function getMore(e, options) {
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
    fetchFunc({ params });
    setPage((pagePrevious) => pagePrevious + 1);
  }
}

export async function handleResponse({
  requestBuilderOptions,
  onSuccess,
  onFailure,
  setLoading,
}: HandleResponseOptions) {
  try {
    const { status, data, error } = await requestBuilder(requestBuilderOptions);
    if (status === responseStatus.OK) {
      if (typeof onSuccess === 'function') {
        await onSuccess(data);
      }
      if (typeof setLoading === 'function') {
        setLoading(false);
      }
      return data;
    } else {
      Toast.show(error);
      if (typeof onFailure === 'function') {
        await onFailure();
      }
      if (typeof setLoading === 'function') {
        setLoading(false);
      }
      return null;
    }
  } catch (err) {
    Toast.show(err.message);
    if (typeof onFailure === 'function') {
      await onFailure();
    }
    if (typeof setLoading === 'function') {
      setLoading(false);
    }
    return null;
  }
}
