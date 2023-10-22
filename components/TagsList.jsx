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
import { size, map } from 'lodash';
import { useFocusEffect } from '@react-navigation/native';

import appStyles from '../appStyles.js';
import tagsListStyles from './tagsListStyles.js';
import { DataContext, StaticContext } from '../appContext';
import fetchMore from '../utilities/fetchMore.js';

export default function TagsList() {
  const [lastContentHeight, setLastContentHeight] = useState(0);

  const { tags, fetchingTags, highlightButton, tagsPage } =
    useContext(DataContext);
  const {
    fetchTags,
    onPressTagCard: onPress,
    setViewType,
    setTagsPage,
  } = useContext(StaticContext);

  useEffect(() => {
    if (tagsPage === 1) {
      setLastContentHeight(0);
    }
  }, [tagsPage]);

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
        scrollEventThrottle={200}
        onScroll={(e) =>
          fetchMore(e, {
            pageSize: 200,
            page: tagsPage,
            setPage: setTagsPage,
            lastContentHeight,
            setLastContentHeight,
            fetchFunc: fetchTags,
          })
        }
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
