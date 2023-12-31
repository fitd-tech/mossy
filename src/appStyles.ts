import { StyleSheet } from 'react-native';

import { colors } from 'src/common/constants.ts';

const { dark1, dark2 } = colors;

const appStyles = StyleSheet.create({
  lightModeBackgroundColor: {
    backgroundColor: 'white',
  },
  lightModeTextColor: {
    color: 'black',
  },
  darkModeBackgroundColor: {
    backgroundColor: dark1,
  },
  darkModeLighterBackgroundColor: {
    backgroundColor: dark2,
  },
  darkModeTextColor: {
    color: 'white',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 10,
  },
  tagCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
  },
  tagCardTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagCardText: {
    color: 'white',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    minWidth: '100%',
    minHeight: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1,
  },
  modalPressOut: {
    flex: 1,
  },
  modalPressReset: {
    width: 200,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: '60%',
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholder: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 100,
  },
  placeholderText: {
    fontSize: 20,
  },
  textInput: {
    borderBottomWidth: 1,
    width: 200,
    height: 30,
    marginBottom: 25,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 2,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  createButtonWrapper: {
    marginTop: 25,
  },
  dateWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateTimePicker: {},
  dateTimePickerOffsetOneDigit: {
    marginLeft: -10,
  },
  dateTimePickerOffsetTwoDigits: {
    marginLeft: -20,
  },
  taskDetailsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 25,
  },
  taskStatusWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  appTitle: {
    fontWeight: 'bold',
  },
  appTitleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 5,
    width: '100%',
    borderBottomWidth: 1,
  },
  menuButtonWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    borderRadius: 5,
  },
  addTaskButtonWrapper: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: 5,
  },
  taskStatusRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  taskCardBadge: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    minWidth: 48,
    maxWidth: 48,
    height: 48,
    maxHeight: 48,
    minHeight: 48,
    borderRadius: 5,
    marginTop: 2,
    marginBottom: 2,
    marginLeft: 3,
    marginRight: 5,
  },
  badgeTitle: {
    fontSize: 24,
    color: 'white',
  },
  badgeUom: {
    fontSize: 8,
    marginTop: -10,
    color: 'white',
  },
  switchAndLabelWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  switchLabel: {
    marginLeft: 10,
  },
  themeSettingsHeading: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  colorThemeWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  colorThemeRow: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    padding: 3,
  },
  colorThemeColor: {
    width: 50,
    height: 50,
  },
});

export default appStyles;
