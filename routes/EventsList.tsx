import React, { useContext, useState, useEffect } from 'react';
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

import appStyles from 'appStyles.ts';
import eventsListStyles from 'routes/eventsListStyles.ts';
import { DataContext, StaticContext, ThemeContext } from 'appContext.ts';
import getMore from 'common/utilities/getMore.ts';

export default function EventsList() {
  const [lastContentHeight, setLastContentHeight] = useState(0);

  // Attemp to prevent registering event card touch when quickly swiping during navigation
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setSettled(true);
    });
  }, [500]);

  const { darkMode, backgroundColor, textColor, theme } =
    useContext(ThemeContext);

  const {
    events,
    fetchingEvents,
    selectedId: selectedEventId,
    eventsPage,
  } = useContext(DataContext);

  const {
    getEvents,
    onPressEventCard: onPress,
    setViewType,
    setEventsPage,
  } = useContext(StaticContext);

  const eventCardStandardColor = {
    borderColor: theme.color1,
    backgroundColor: theme.color1,
  };

  const eventCardHighlightedColor = {
    borderColor: theme.color3,
    backgroundColor: theme.color3,
  };

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
          onRefresh={getEvents}
          style={backgroundColor}
        />
      }
      style={backgroundColor}
      scrollEventThrottle={200}
      onScroll={(e) =>
        getMore(e, {
          pageSize: 50,
          page: eventsPage,
          setPage: setEventsPage,
          lastContentHeight,
          setLastContentHeight,
          fetchFunc: getEvents,
        })
      }
    >
      <View style={{ ...appStyles.container, ...backgroundColor }}>
        <View style={eventsListStyles.eventCardContainer}>
          {size(events) ? (
            <>
              {map(events, (event) => {
                let cardStyles;
                if (event._id.$oid === selectedEventId) {
                  cardStyles = [
                    eventsListStyles.eventCard,
                    eventCardHighlightedColor,
                  ];
                } else {
                  cardStyles = [
                    eventsListStyles.eventCard,
                    eventCardStandardColor,
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
            <View style={{ ...appStyles.placeholder, ...backgroundColor }}>
              <Text style={{ ...appStyles.placeholderText, ...textColor }}>
                Create some events!
              </Text>
            </View>
          )}
        </View>
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}
