import { exportedForTesting } from 'src/common/utilities/formatStrings.ts';

describe('pluralize', () => {
  test(`given the word "test" and a quantity of 2, return "tests"`, () => {
    expect(exportedForTesting.pluralize('test', 2)).toBe('tests');
  });
  test(`given the word "test", a quantity of 2, and the "capitalize" option, return "Tests"`, () => {
    expect(exportedForTesting.pluralize('test', 2, { capitalize: true })).toBe(
      'Tests',
    );
  });
  test(`given the word "test" and a quantity of 1, return "test"`, () => {
    expect(exportedForTesting.pluralize('test', 1)).toBe('test');
  });
  test(`given the word "test", a quantity of 1, and the "capitalize" option, return "Test"`, () => {
    expect(exportedForTesting.pluralize('test', 1, { capitalize: true })).toBe(
      'Test',
    );
  });
  test(`given the word "test" and a quantity of 0, return "tests"`, () => {
    expect(exportedForTesting.pluralize('test', 0)).toBe('tests');
  });
  test(`given the word "test", a quantity of 0, and the "capitalize" option, return "Tests"`, () => {
    expect(exportedForTesting.pluralize('test', 0, { capitalize: true })).toBe(
      'Tests',
    );
  });
  test(`given the custom word "foot" and a quantity of 2, return "feet"`, () => {
    expect(exportedForTesting.pluralize('foot', 2)).toBe('feet');
  });
  test(`given the custom word "foot", a quantity of 2, and the "capitalize" option, return "Feet"`, () => {
    expect(exportedForTesting.pluralize('foot', 2, { capitalize: true })).toBe(
      'Feet',
    );
  });
  test(`given the custom word "foot" and a quantity of 1, return "foot"`, () => {
    expect(exportedForTesting.pluralize('foot', 1)).toBe('foot');
  });
  test(`given the custom word "foot", a quantity of 1, and the "capitalize" option, return "Foot"`, () => {
    expect(exportedForTesting.pluralize('foot', 1, { capitalize: true })).toBe(
      'Foot',
    );
  });
  test(`given the custom word "foot" and a quantity of 0, return "feet"`, () => {
    expect(exportedForTesting.pluralize('foot', 0)).toBe('feet');
  });
  test(`given the custom word "foot", a quantity of 0, and the "capitalize" option, return "Feet"`, () => {
    expect(exportedForTesting.pluralize('foot', 0, { capitalize: true })).toBe(
      'Feet',
    );
  });
  // We try to do what the user might expect when this function is called with a string that has multiple words
  test(`given the string "multiple word", a quantity of 2, and the "capitalize" option, return "Multiple Words"`, () => {
    expect(
      exportedForTesting.pluralize('multiple word', 2, { capitalize: true }),
    ).toBe('Multiple Words');
  });
  test(`given the string "multiple foot", a quantity of 2, and the "capitalize" option, return "Multiple Feet"`, () => {
    expect(
      exportedForTesting.pluralize('multiple foot', 2, { capitalize: true }),
    ).toBe('Multiple Feet');
  });
});
