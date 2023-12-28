import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native';

import TagsSelectList from 'src/components/TagsSelectList.tsx';
import appStyles from 'src/appStyles.ts';
import {
  HandleChangeField,
  HandleTagSelectCardPress,
  Tag,
} from 'src/types/types.ts';

interface EditTaskFormProps {
  textColor: {
    color: string;
  };
  selectedTaskId: string;
  handleChangeField: HandleChangeField;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  secondaryBackgroundColor: {
    backgroundColor: string;
  };
  frequency: string;
  setFrequency: React.Dispatch<React.SetStateAction<string>>;
  tags: Tag[];
  handleTagSelectCardPress: HandleTagSelectCardPress;
  primaryButtonColor: {
    backgroundColor: string;
  };
  handleSaveTask: () => void;
  loading: boolean;
  selectedTagIds: string[];
}

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
  handleTagSelectCardPress,
  primaryButtonColor,
  handleSaveTask,
  loading,
  selectedTagIds,
}: EditTaskFormProps) {
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
        selectedTagIds={selectedTagIds}
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
