import { useContext } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';

import appStyles from '../appStyles';
import eventsListStyles from './eventsListStyles';
import { DataContext, StaticContext } from '../appContext';

export default function EventsList({
  /* events,
  fetchingEvents,
  fetchEvents,
  highlightButton,
  onPress, */
  navigation,
}) {
  const { events, fetchingEvents, highlightButton } = useContext(DataContext);
  const {
    fetchEvents,
    onPressEventCard: onPress,
    setViewType,
  } = useContext(StaticContext);

  useFocusEffect(() => {
    setViewType('events');
  });

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={fetchingEvents}
          onRefresh={fetchEvents}
          style={{
            backgroundColor: 'white',
          }}
        />
      }
      style={{
        backgroundColor: 'white',
      }}
    >
      <View style={appStyles.container}>
        <View style={eventsListStyles.eventCardContainer}>
          {size(events) ? (
            <>
              {map(events, (event) => {
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
