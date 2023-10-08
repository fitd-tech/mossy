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
import { size, map } from 'lodash';
import { useFocusEffect } from '@react-navigation/native';

import appStyles from '../appStyles.js';
import tagsListStyles from './tagsListStyles.js';
import { DataContext, StaticContext } from '../appContext';

export default function TagsList(
  {
    /* tags,
  highlightButton,
  onPress,
  fetchingTags,
  fetchTags, */
  },
) {
  const { tags, fetchingTags, highlightButton } = useContext(DataContext);
  const {
    fetchTags,
    onPressTagCard: onPress,
    setViewType,
  } = useContext(StaticContext);

  useFocusEffect(() => {
    setViewType('tags');
  });

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={fetchingTags}
            onRefresh={fetchTags}
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
          <View style={tagsListStyles.tagCardContainer}>
            {size(tags) ? (
              <>
                {map(tags, (tag) => {
                  let cardStyles;
                  if (tag._id.$oid === highlightButton) {
                    cardStyles = [
                      tagsListStyles.tagCard,
                      tagsListStyles.tagCardHighlightedColor,
                    ];
                  } else {
                    cardStyles = [
                      tagsListStyles.tagCard,
                      tagsListStyles.tagCardStandardColor,
                    ];
                  }
                  return (
                    <Pressable
                      key={tag._id.$oid}
                      style={cardStyles}
                      onPress={() => onPress(tag._id.$oid)}
                    >
                      <Text style={tagsListStyles.tagCardTitle}>
                        {tag.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </>
            ) : (
              <View style={appStyles.placeholder}>
                <Text style={appStyles.placeholderText}>Create some tags!</Text>
              </View>
            )}
          </View>
          <StatusBar style="auto" />
        </View>
      </ScrollView>
    </>
  );
}
