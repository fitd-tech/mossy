import appStyles from 'src/appStyles.ts';

export function getDaysFromMilliseconds(milliseconds) {
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const days = Math.floor(milliseconds / millisecondsInADay);
  return days;
}

function getDateTimePickerOffsetDigits(date) {
  const day = date.getDate();
  // getMonth() values start at 0
  const month = date.getMonth() + 1;
  if (day < 10 && month < 10) {
    return 2;
  }
  if (day < 10 || month < 10) {
    return 1;
  }
  return 0;
}

export function generateDateTimePickerStyles(date) {
  const offsetDigits = getDateTimePickerOffsetDigits(date);
  let dateTimePickerStyles;
  if (offsetDigits === 2) {
    dateTimePickerStyles = [
      appStyles.dateTimePicker,
      appStyles.dateTimePickerOffsetTwoDigits,
    ];
  } else if (offsetDigits === 1) {
    dateTimePickerStyles = [
      appStyles.dateTimePicker,
      appStyles.dateTimePickerOffsetOneDigit,
    ];
  } else {
    dateTimePickerStyles = appStyles.dateTimePicker;
  }
  return dateTimePickerStyles;
}

export const exportedForTesting = {
  getDaysFromMilliseconds,
  getDateTimePickerOffsetDigits,
};
