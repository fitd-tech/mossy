import {
  StyleSheet,
  Text,
  View,
  Button,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { size, map, truncate } from 'lodash';

import appStyles from '../appStyles';
import eventsListStyles from './eventsListStyles';

export default function EventsList({
  events,
  fetchingEvents,
  fetchEvents,
  highlightButton,
  onPress,
}) {
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={fetchingEvents} onRefresh={fetchEvents} />
      }
    >
      <View style={appStyles.container}>
        <View style={eventsListStyles.eventCardContainer}>
          {size(events) ? (
            <>
              {map(events, (event) => {
                console.log('event.task', event.task);
                let cardStyles;
                if (event._id.$oid === highlightButton) {
                  cardStyles = [
                    eventsListStyles.eventCard,
                    eventsListStyles.eventCardHighlightedColor,
                  ];
                } else {
                  cardStyles = [
                    eventsListStyles.eventCard,
                    eventsListStyles.eventCardStandardColor,
                  ];
                }
                return (
                  <Pressable
                    key={event._id.$oid}
                    style={cardStyles}
                    onPress={() => onPress(event._id.$oid)}
                  >
                    <Text style={eventsListStyles.eventCardTitle}>
                      {truncate(event.task, { length: 40 })}
                    </Text>
                    <Text style={eventsListStyles.eventCardText}>
                      {new Date(event.date).toLocaleDateString()}
                    </Text>
                  </Pressable>
                );
              })}
            </>
          ) : (
            <View style={appStyles.placeholder}>
              <Text style={appStyles.placeholderText}>Create some events!</Text>
            </View>
          )}
        </View>
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}
