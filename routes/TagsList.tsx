import React, { useContext, useState, useEffect } from 'react';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { size, map } from 'lodash';
import { useFocusEffect } from '@react-navigation/native';

import appStyles from 'appStyles.ts';
import tagsListStyles from 'routes/tagsListStyles.ts';
import { DataContext, StaticContext, ThemeContext } from 'appContext.ts';
import { getMore } from 'common/utilities/requests.ts';

export default function TagsList() {
  const [lastContentHeight, setLastContentHeight] = useState(0);

  const { backgroundColor, textColor, theme } = useContext(ThemeContext);
  const {
    tags,
    loadingTags,
    selectedId: selectedTagId,
    tagsPage,
  } = useContext(DataContext);
  const {
    getTags,
    onPressTagCard: onPress,
    setViewType,
    setTagsPage,
  } = useContext(StaticContext);

  const tagCardStandardColor = {
    borderColor: theme.color2,
    backgroundColor: theme.color2,
  };

  const tagCardHighlightedColor = {
    borderColor: theme.color3,
    backgroundColor: theme.color3,
  };

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
            refreshing={loadingTags}
            onRefresh={getTags}
            style={backgroundColor}
          />
        }
        style={backgroundColor}
        scrollEventThrottle={200}
        onScroll={(e) =>
          getMore(e, {
            pageSize: 200,
            page: tagsPage,
            setPage: setTagsPage,
            lastContentHeight,
            setLastContentHeight,
            fetchFunc: getTags,
          })
        }
      >
        <View style={{ ...appStyles.container, ...backgroundColor }}>
          <View style={tagsListStyles.tagCardContainer}>
            {size(tags) ? (
              <>
                {map(tags, (tag) => {
                  let cardStyles;
                  if (tag._id.$oid === selectedTagId) {
                    cardStyles = [
                      tagsListStyles.tagCard,
                      tagCardHighlightedColor,
                    ];
                  } else {
                    cardStyles = [tagsListStyles.tagCard, tagCardStandardColor];
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
              <View style={{ ...appStyles.placeholder, backgroundColor }}>
                <Text style={{ ...appStyles.placeholderText, ...textColor }}>
                  Create some tags!
                </Text>
              </View>
            )}
          </View>
          <StatusBar style="auto" />
        </View>
      </ScrollView>
    </>
  );
}
