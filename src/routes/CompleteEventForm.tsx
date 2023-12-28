import React, { SetStateAction } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import appStyles from 'src/appStyles.ts';
import { HandleChangeDate } from 'src/types/types.ts';

interface CompleteEventFormProps {
  textColor: {
    color: string;
  };
  completionDate: Date;
  handleChangeDate: HandleChangeDate;
  setCompletionDate: React.Dispatch<SetStateAction<Date>>;
  dateTimePickerStyles: Record<string, unknown>;
  primaryButtonColor: {
    backgroundColor: string;
  };
  handleSaveComplete: () => void;
  loading: boolean;
}

function CompleteEventForm({
  textColor,
  completionDate,
  handleChangeDate,
  setCompletionDate,
  dateTimePickerStyles,
  primaryButtonColor,
  handleSaveComplete,
  loading,
}: CompleteEventFormProps) {
  return (
    <>
      <Text style={{ ...appStyles.modalTitle, ...textColor }}>
        Complete Task
      </Text>
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
        onPress={handleSaveComplete}
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

export default CompleteEventForm;
