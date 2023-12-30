import { exportedForTesting } from 'src/common/utilities/time.ts';

describe('getDateTimePickerOffsetDigits', () => {
  const singleDigitMonthSingleDigitDay = new Date('2020-01-01');
  const singleDigitMonthDoubleDigitDay = new Date('2020-01-10');
  const doubleDigitMonthSingleDigitDay = new Date('2020-10-01');
  const doubleDigitMonthDoubleDigitDay = new Date('2020-10-10');

  function getDateInIntendedTimezone(date) {
    const timezoneOffset = date.getTimezoneOffset();
    const correctedDate = new Date(date.getTime() + timezoneOffset * 60 * 1000);
    return correctedDate;
  }

  test('given a single-digit month and a single-digit day, return 2', () => {
    const date = getDateInIntendedTimezone(singleDigitMonthSingleDigitDay);
    expect(exportedForTesting.getDateTimePickerOffsetDigits(date)).toBe(2);
  });

  test('given a single-digit month and a double-digit day, return 1', () => {
    const date = getDateInIntendedTimezone(singleDigitMonthDoubleDigitDay);
    expect(exportedForTesting.getDateTimePickerOffsetDigits(date)).toBe(1);
  });

  test('given a double-digit month and a single-digit day, return 1', () => {
    const date = getDateInIntendedTimezone(doubleDigitMonthSingleDigitDay);
    expect(exportedForTesting.getDateTimePickerOffsetDigits(date)).toBe(1);
  });

  test('given a double-digit month and a double-digit day, return 0', () => {
    const date = getDateInIntendedTimezone(doubleDigitMonthDoubleDigitDay);
    expect(exportedForTesting.getDateTimePickerOffsetDigits(date)).toBe(0);
  });
});

describe('getDaysFromMilliseconds', () => {
  const millisecondsInADay = 24 * 60 * 60 * 1000; // 86,400,000 ms
  test('given 0 milliseconds, return 0', () => {
    expect(exportedForTesting.getDaysFromMilliseconds(0)).toBe(0);
  });
  test('given 86,400,000 milliseconds, return 1', () => {
    expect(exportedForTesting.getDaysFromMilliseconds(millisecondsInADay)).toBe(
      1,
    );
  });
  test('given 86,399,999 milliseconds, return 0', () => {
    expect(
      exportedForTesting.getDaysFromMilliseconds(millisecondsInADay - 1),
    ).toBe(0);
  });
});
