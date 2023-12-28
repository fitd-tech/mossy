import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import appStyles from 'src/appStyles.ts';

interface ConfirmLogOutProps {
  textColor: {
    color: string;
  };
  primaryButtonColor: {
    backgroundColor: string;
  };
  handleConfirmLogOut: () => void;
  loading: boolean;
}

function ConfirmLogOut({
  textColor,
  primaryButtonColor,
  handleConfirmLogOut,
  loading,
}: ConfirmLogOutProps) {
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
