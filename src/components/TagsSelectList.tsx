import React, { useContext } from 'react';
import { Text, View, Pressable, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { size, map, includes } from 'lodash';

import appStyles from 'src/appStyles.ts';
import tagsSelectListStyles from 'src/components/tagsSelectListStyles.ts';
import { ThemeContext } from 'src/appContext.ts';
import { Tag } from 'src/types/types.ts';

interface TagsSelectListProps {
  tags: Tag[];
  selectedTagIds: string[];
  onPress: (param: string) => void;
}

export default function TagsSelectList({
  tags,
  selectedTagIds,
  onPress,
}: TagsSelectListProps) {
  const { backgroundColor, theme } = useContext(ThemeContext);

  const tagCardStandardColor = {
    borderColor: theme.color2,
    backgroundColor: theme.color2,
  };
  const tagCardHighlightedColor = {
    borderColor: theme.color1,
    backgroundColor: theme.color1,
  };

  return (
    <ScrollView>
      <View style={{ ...appStyles.container, ...backgroundColor }}>
        <View style={tagsSelectListStyles.tagCardContainer}>
          {size(tags) ? (
            <>
              {map(tags, (tag) => {
                let cardStyles;
                if (includes(selectedTagIds, tag._id.$oid)) {
                  cardStyles = [
                    tagsSelectListStyles.tagCard,
                    tagCardHighlightedColor,
                  ];
                } else {
                  cardStyles = [
                    tagsSelectListStyles.tagCard,
                    tagCardStandardColor,
                  ];
                }
                return (
                  <Pressable
                    key={tag._id.$oid}
                    style={cardStyles}
                    onPress={() => onPress(tag._id.$oid)}
                  >
                    <Text style={tagsSelectListStyles.tagCardTitle}>
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
  );
}
