import { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';

import { mossyBackendDevUrl } from './constants';

export default function App() {
  const [buttonLabel, setButtonLabel] = useState('loading...')

  useEffect(() => {
    /* setTimeout(() => {
      setButtonLabel('press me')
    }, 3000) */
    async function fetchStuff() {
      const config = {
        method: 'GET',
        headers: {
          "Content-Type": "application/json"
        }
      }
      let result
      try {
        const response = await fetch(`http://${mossyBackendDevUrl}/api/books`, config)
        const serializedResponse = await response.json()
        console.log('serializedResponse', serializedResponse)
        result = serializedResponse.author
      } catch (err) {
        console.log('err', err)
        result = err.message
      }
      setButtonLabel(result)
    }
    fetchStuff()
  }, [])

  function handleButtonPress() {
    if (buttonLabel === 'press me again') {
      setButtonLabel('i done been pressed')
    } else {
      setButtonLabel('press me again')
    }
  }

  return (
    <View style={styles.container}>
      <Text>mossy</Text>
      <Text>you have work to do</Text>
      <Button
        title={buttonLabel}
        onPress={handleButtonPress}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
