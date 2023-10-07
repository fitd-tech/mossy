import { StyleSheet } from 'react-native';

import { colors } from '../constants';

const { color1, color2, color3, color4 } = colors;

const styles = StyleSheet.create({
  tagCardContainer: {
    flex: 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    alignItems: 'center',
  },
  tagCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default styles;
