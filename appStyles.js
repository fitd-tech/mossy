import { StyleSheet } from 'react-native';

import { colors } from './constants';

const { color1, color2, color3, color4 } = colors;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  taskCardContainer: {
    flex: 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    justifyContent: 'center',
  },
  eventCardContainer: {
    flex: 0.8,
    flexDirection: 'column',
    width: '90%',
    alignItems: 'center',
  },
  taskTitleFontSizeLarge: {
    fontSize: 30,
  },
  taskTitleFontSizeMedium: {
    fontSize: 25,
  },
  taskTitleFontSizeSmall: {
    fontSize: 20,
  },
  taskCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 160,
    height: 160,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
  },
  eventCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 50,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
  },
  eventCardStandardColor: {
    borderColor: color1,
    backgroundColor: color1,
  },
  eventCardHighlightedColor: {
    borderColor: color3,
    backgroundColor: color3,
  },
  eventCardTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventCardText: {
    color: 'white',
  },
  tagCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // width: '100%',
    height: 50,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
  },
  tagCardStandardColor: {
    borderColor: color2,
    backgroundColor: color2,
  },
  tagCardHighlightedColor: {
    borderColor: color3,
    backgroundColor: color3,
  },
  tagCardTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagCardText: {
    color: 'white',
  },
  taskTitle: {
    fontWeight: 700,
  },
  taskDetailsText: {
    fontSize: 15,
    color: 'darkgrey',
    fontWeight: 600,
  },
  taskCardHighlighted: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 160,
    height: 160,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: color3,
    backgroundColor: color3,
  },
  taskTitleHighlighted: {
    fontWeight: 700,
    color: 'white',
  },
  taskTextHighlighted: {
    fontSize: 15,
    color: 'white',
    fontWeight: 600,
  },
  taskCardOverdue: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 160,
    height: 160,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: color1,
    backgroundColor: color1,
  },
  taskTitleOverdue: {
    fontWeight: 700,
    color: 'white',
  },
  taskTextOverdue: {
    fontSize: 15,
    color: 'white',
    fontWeight: 600,
  },
  taskCardNeverCompleted: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: 160,
    height: 160,
    margin: 5,
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: color2,
    backgroundColor: color2,
  },
  taskTitleNeverCompleted: {
    fontWeight: 700,
    color: 'white',
  },
  taskTextNeverCompleted: {
    fontSize: 15,
    color: 'white',
    fontWeight: 600,
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
    backgroundColor: 'white',
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
  primaryButtonColor: {
    backgroundColor: color1,
  },
  secondaryButtonColor: {
    backgroundColor: color2,
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
  dateTimePickerForceCenter: {
    marginLeft: -10,
  },
  badgeWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '30%',
  },
  taskCardBadge: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    minWidth: '30%',
    maxWidth: '30%',
    height: '30%',
    maxHeight: '100%',
    minHeight: '100%',
    borderRadius: 5,
    backgroundColor: 'white',
  },
  badgeTitle: {
    fontSize: 24,
    fontWeight: 600,
  },
  badgeUom: {
    fontSize: 8,
  },
  taskDetailsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 25,
  },
  appTitle: {},
  appTitleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingBottom: 5,
    width: '100%',
    borderBottomWidth: 1,
  },
  menuButtonWrapper: {
    position: 'absolute',
    bottom: 30,
    left: 30,
  },
  addTaskButtonWrapper: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
});

export default styles;
