import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  tagCardContainer: {
    flex: 0.8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    alignItems: 'center',
    minHeight: 100,
    maxHeight: 200,
  },
  tagCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    padding: 5,
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
