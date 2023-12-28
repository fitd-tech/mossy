import { StyleSheet } from 'react-native';

const taskListStyles = StyleSheet.create({
  taskCardContainer: {
    flex: 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    justifyContent: 'center',
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
  taskTitle: {
    fontWeight: '700',
    color: 'white',
  },
  taskDetailsText: {
    fontSize: 15,
    color: 'darkgrey',
    fontWeight: '600',
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
  },
  taskTitleHighlighted: {
    fontWeight: '700',
    color: 'white',
  },
  taskTextHighlighted: {
    fontSize: 15,
    color: 'white',
    fontWeight: '600',
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
  },
  taskTitleOverdue: {
    fontWeight: '700',
    color: 'white',
  },
  taskTextOverdue: {
    fontSize: 15,
    color: 'white',
    fontWeight: '600',
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
  },
  taskTitleNeverCompleted: {
    fontWeight: '700',
    color: 'white',
  },
  taskTextNeverCompleted: {
    fontSize: 15,
    color: 'white',
    fontWeight: '600',
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
  },
  badgeTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  badgeUom: {
    fontSize: 8,
    marginTop: -10,
  },
});

export default taskListStyles;
