import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import appStyles from 'appStyles.ts';

function ConfirmDelete({
  textColor,
  primaryButtonColor,
  handleDelete,
  loading,
}) {
  return (
    <>
      <Text style={{ ...appStyles.modalTitle, ...textColor }}>
        Confirm Delete
      </Text>
      <Pressable
        style={[appStyles.button, primaryButtonColor]}
        onPress={handleDelete}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={appStyles.buttonText}>Delete</Text>
        )}
      </Pressable>
    </>
  );
}

export default ConfirmDelete;
