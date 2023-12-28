import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import appStyles from 'src/appStyles.ts';
import { Event, HandleChangeDate } from 'src/types/types.ts';

interface EditEventFormProps {
  textColor: {
    color: string;
  };
  event: Event;
  completionDate: Date;
  handleChangeDate: HandleChangeDate;
  setCompletionDate: React.Dispatch<React.SetStateAction<Date>>;
  dateTimePickerStyles: Record<string, unknown>;
  primaryButtonColor: {
    backgroundColor: string;
  };
  saveEvent: () => void;
  loading: boolean;
  confirmDelete: () => void;
}

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
}: EditEventFormProps) {
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
