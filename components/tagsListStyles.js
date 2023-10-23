import { StyleSheet } from 'react-native';

import { colors } from '../constants';

const { color1, color2, color3, color4 } = colors;

const styles = StyleSheet.create({
  tagCardContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    alignItems: 'center',
    minHeight: '100%',
  },
  tagCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
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
});

export default styles;
