import React, { useContext } from 'react';
import { Text, Pressable, ScrollView } from 'react-native';
import { size, map, includes } from 'lodash';

import selectListStyles from 'src/components/selectListStyles.ts';
import { ThemeContext } from 'src/appContext.ts';
import { MongoDbObject } from 'src/types/types.ts';

interface SelectListProps {
  items: MongoDbObject[];
  selectedItemIds?: string[];
  onPress?: (param: string) => void;
  placeholder?: string;
}

export default function SelectList({
  items,
  selectedItemIds,
  onPress,
  placeholder,
}: SelectListProps) {
  const { backgroundColor, theme, textColor } = useContext(ThemeContext);

  const tagCardStandardColor = {
    borderColor: theme.color2,
    backgroundColor: theme.color2,
  };
  const tagCardHighlightedColor = {
    borderColor: theme.color1,
    backgroundColor: theme.color1,
  };

  type CardContainer = typeof selectListStyles.cardContainer;
  interface ContentContainerStyle extends Omit<CardContainer, 'width'> {
    justifyContent?: 'center';
    width?: '90%' | '100%';
  }

  const contentContainerStyle: ContentContainerStyle = {
    ...selectListStyles.cardContainer,
  };
  if (!size(items)) {
    contentContainerStyle.justifyContent = 'center';
    contentContainerStyle.width = '100%';
    contentContainerStyle.padding = 6;
  }

  return (
    <ScrollView
      style={{
        ...backgroundColor,
        maxHeight: 200,
        marginBottom: 25,
        borderWidth: 1,
        borderRadius: 5,
        width: '100%',
      }}
      contentContainerStyle={contentContainerStyle}
    >
      {size(items) ? (
        <>
          {map(items, (item) => {
            let cardStyles;
            if (!selectedItemIds || includes(selectedItemIds, item._id.$oid)) {
              cardStyles = [selectListStyles.card, tagCardHighlightedColor];
            } else {
              cardStyles = [selectListStyles.card, tagCardStandardColor];
            }
            return (
              <Pressable
                key={item._id.$oid}
                style={cardStyles}
                onPress={() => onPress?.(item._id.$oid)}
              >
                <Text style={selectListStyles.cardTitle}>{item.name}</Text>
              </Pressable>
            );
          })}
        </>
      ) : (
        <Text style={{ ...selectListStyles.placeholderText, ...textColor }}>
          {placeholder || 'No items yet!'}
        </Text>
      )}
    </ScrollView>
  );
}
