import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native';

import TagsSelectList from 'components/TagsSelectList.tsx';
import appStyles from 'appStyles.ts';

function EditTaskForm({
  textColor,
  selectedTaskId,
  handleChangeField,
  name,
  setName,
  secondaryBackgroundColor,
  frequency,
  setFrequency,
  tags,
  selectedTags,
  handleTagSelectCardPress,
  primaryButtonColor,
  handleSaveTask,
  loading,
}) {
  return (
    <>
      <Text style={{ ...appStyles.modalTitle, ...textColor }}>
        {selectedTaskId ? 'Edit Task' : 'Create Task'}
      </Text>
      <TextInput
        value={name}
        onChangeText={(value) => handleChangeField(value, setName)}
        placeholder="Name"
        style={{
          ...appStyles.textInput,
          ...textColor,
          ...secondaryBackgroundColor,
        }}
      />
      <TextInput
        value={frequency}
        onChangeText={(value) => handleChangeField(value, setFrequency)}
        placeholder="Frequency"
        inputMode="numeric"
        style={{
          ...appStyles.textInput,
          ...textColor,
          ...secondaryBackgroundColor,
        }}
      />
      <TagsSelectList
        tags={tags}
        selectedTags={selectedTags}
        onPress={handleTagSelectCardPress}
      />
      <Pressable
        style={[appStyles.button, primaryButtonColor]}
        onPress={handleSaveTask}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={appStyles.buttonText}>Save</Text>
        )}
      </Pressable>
    </>
  );
}

export default EditTaskForm;
