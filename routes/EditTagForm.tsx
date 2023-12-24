import React from 'react';
import { ActivityIndicator, Pressable, Text, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { map } from 'lodash';

import appStyles from '../appStyles.js';

function EditTagForm({
  tags,
  textColor,
  highlightButton,
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
}) {
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
        {highlightButton ? 'Edit Tag' : 'Create Tag'}
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
        onValueChange={(itemValue, _itemIndex) => setParentTag(itemValue)}
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
      {highlightButton && (
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
