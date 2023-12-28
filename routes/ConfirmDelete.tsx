import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import appStyles from 'appStyles.ts';

interface ConfirmDeleteProps {
  textColor: {
    color: string;
  };
  primaryButtonColor: {
    backgroundColor: string;
  };
  handleDelete: () => void;
  loading: boolean;
}

function ConfirmDelete({
  textColor,
  primaryButtonColor,
  handleDelete,
  loading,
}: ConfirmDeleteProps) {
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
