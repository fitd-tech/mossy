import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  cardContainer: {
    // flex: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    alignItems: 'center',
    // minHeight: 100,
    // maxHeight: 200,
    padding: 2,
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    padding: 5,
    borderWidth: 2,
    borderRadius: 5,
  },
  cardTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  cardText: {
    color: 'white',
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
});

export default styles;
