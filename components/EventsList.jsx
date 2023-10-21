import { useContext, useState, useEffect } from 'react';
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
import { size, map, truncate, noop } from 'lodash';
import { useFocusEffect } from '@react-navigation/native';

import appStyles from '../appStyles';
import eventsListStyles from './eventsListStyles';
import { DataContext, StaticContext } from '../appContext';
import fetchMore from '../utilities/fetchMore';

export default function EventsList() {
  const [lastContentHeight, setLastContentHeight] = useState(0);

  // Attemp to prevent registering event card touch when quickly swiping during navigation
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setSettled(true);
    });
  }, [500]);

  const { events, fetchingEvents, highlightButton, eventsPage } =
    useContext(DataContext);

  const {
    fetchEvents,
    onPressEventCard: onPress,
    setViewType,
    setEventsPage,
  } = useContext(StaticContext);

  useEffect(() => {
    if (eventsPage === 1) {
      setLastContentHeight(0);
    }
  }, [eventsPage]);

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
      scrollEventThrottle={200}
      onScroll={(e) =>
        fetchMore(e, {
          pageSize: 50,
          page: eventsPage,
          setPage: setEventsPage,
          lastContentHeight,
          setLastContentHeight,
          fetchFunc: fetchEvents,
        })
      }
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
                    onPress={settled ? () => onPress(event._id.$oid) : noop}
                  >
                    <Text style={eventsListStyles.eventCardTitle}>
                      {truncate(event.task, { length: 40 })}
                    </Text>
                    <Text style={eventsListStyles.eventCardText}>
                      {new Date(
                        Number(event.date.$date.$numberLong),
                      ).toLocaleDateString()}
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
