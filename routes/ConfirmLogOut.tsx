import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import appStyles from '../appStyles.js';

function ConfirmLogOut({
  textColor,
  primaryButtonColor,
  handleConfirmLogOut,
  loading,
}) {
  return (
    <>
      <Text style={{ ...appStyles.modalTitle, ...textColor }}>
        Confirm Log Out
      </Text>
      <Pressable
        style={[appStyles.button, primaryButtonColor]}
        onPress={handleConfirmLogOut}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={appStyles.buttonText}>Log Out</Text>
        )}
      </Pressable>
    </>
  );
}

export default ConfirmLogOut;
