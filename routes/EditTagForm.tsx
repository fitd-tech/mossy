import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { map } from 'lodash';

import appStyles from 'appStyles.ts';
import { HandleChangeField, Tag } from 'types/types.ts';

interface EditTagFormProps {
  tags: Tag[];
  textColor: {
    color: string;
  };
  selectedTagId: string;
  name: string;
  handleChangeField: HandleChangeField;
  setName: React.Dispatch<React.SetStateAction<string>>;
  secondaryBackgroundColor: {
    backgroundColor: string;
  };
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  parentTag: string;
  setParentTag: React.Dispatch<React.SetStateAction<string>>;
  primaryButtonColor: {
    backgroundColor: string;
  };
  handleSaveTag: () => void;
  loading: boolean;
  confirmDelete: () => void;
}

function EditTagForm({
  tags,
  textColor,
  selectedTagId,
  name,
  handleChangeField,
  setName,
  secondaryBackgroundColor,
  description,
  setDescription,
  parentTag,
  setParentTag,
  primaryButtonColor,
  handleSaveTag,
  loading,
  confirmDelete,
}: EditTagFormProps) {
  const tagChoices = [
    {
      _id: {
        $oid: 'placeholder',
      },
      name: 'Parent tag',
    },
    ...tags,
  ];
  return (
    <>
      <Text style={{ ...appStyles.modalTitle, ...textColor }}>
        {selectedTagId ? 'Edit Tag' : 'Create Tag'}
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
        value={description}
        onChangeText={(value) => handleChangeField(value, setDescription)}
        placeholder="Description"
        style={{
          ...appStyles.textInput,
          ...textColor,
          ...secondaryBackgroundColor,
        }}
      />
      <Picker
        selectedValue={parentTag}
        onValueChange={(itemValue) => setParentTag(itemValue)}
      >
        {map(tagChoices, (tag) => (
          <Picker.Item
            key={tag._id.$oid}
            label={tag.name}
            value={tag._id.$oid}
          />
        ))}
      </Picker>
      <Pressable
        style={[appStyles.button, primaryButtonColor]}
        onPress={handleSaveTag}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={appStyles.buttonText}>Save</Text>
        )}
      </Pressable>
      {selectedTagId && (
        <Pressable
          style={[appStyles.button, primaryButtonColor]}
          onPress={confirmDelete}
        >
          <Text style={appStyles.buttonText}>Delete</Text>
        </Pressable>
      )}
    </>
  );
}

export default EditTagForm;
