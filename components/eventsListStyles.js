import { StyleSheet } from 'react-native';

import { colors } from '../constants';

const { color1, color2, color3, color4 } = colors;

const eventsListStyles = StyleSheet.create({
  eventCardContainer: {
    flex: 0.8,
    flexDirection: 'column',
    width: '90%',
    alignItems: 'center',
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
});

export default eventsListStyles;
