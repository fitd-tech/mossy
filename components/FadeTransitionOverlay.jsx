import React, {useRef, useEffect} from 'react'
import { Animated } from 'react-native'

export default function FadeTransitionOverlay({
  isVisible,
}) {
  const alphaChannel = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (isVisible) {
      Animated.timing(alphaChannel, {
        toValue: 0.4,
        duration: 500,
        useNativeDriver: false,
      }).start()
    } else {
      Animated.timing(alphaChannel, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start()
    }
  }, [isVisible])

  return (
    <Animated.View 
      style={{
        position: 'absolute',
        top: 0,
        minWidth: '100%',
        minHeight: '100%',
        height: '100%',
        backgroundColor: alphaChannel.interpolate({
          inputRange: [0, 0.4],
          outputRange: [
            'rgba(0, 0, 0, 0)',
            'rgba(0, 0, 0, 0.4)'
          ]
        }),
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}
