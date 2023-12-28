import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

interface FadeTransitionOverlayProps {
  isVisible: boolean;
}

export default function FadeTransitionOverlay({
  isVisible,
}: FadeTransitionOverlayProps) {
  // This should just be a reference and we should access .current within the useEffect hook
  // But I seem to remember that not working as expected - trying this to see if it works now
  const alphaChannel = useRef(new Animated.Value(0)); // .current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(alphaChannel.current, {
        toValue: 0.4,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(alphaChannel.current, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [isVisible]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        minWidth: '100%',
        minHeight: '100%',
        height: '100%',
        backgroundColor: alphaChannel.current.interpolate({
          inputRange: [0, 0.4],
          outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.4)'],
        }),
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
