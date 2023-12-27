import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import appStyles from 'appStyles.ts';

function EditEventForm({
  textColor,
  event,
  completionDate,
  handleChangeDate,
  setCompletionDate,
  dateTimePickerStyles,
  primaryButtonColor,
  saveEvent,
  loading,
  confirmDelete,
}) {
  return (
    <>
      <Text style={{ ...appStyles.modalTitle, ...textColor }}>Edit Event</Text>
      <View style={appStyles.modalTextWrapper}>
        <Text style={textColor}>{event?.task}</Text>
      </View>
      <View style={appStyles.dateWrapper}>
        <DateTimePicker
          mode="date"
          value={completionDate}
          onChange={(e, date) => handleChangeDate(e, date, setCompletionDate)}
          style={dateTimePickerStyles}
        />
      </View>
      <Pressable
        style={[appStyles.button, primaryButtonColor]}
        onPress={saveEvent}
      >
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={appStyles.buttonText}>Save</Text>
        )}
      </Pressable>
      <Pressable
        style={[appStyles.button, primaryButtonColor]}
        onPress={confirmDelete}
      >
        <Text style={appStyles.buttonText}>Delete</Text>
      </Pressable>
    </>
  );
}

export default EditEventForm;
