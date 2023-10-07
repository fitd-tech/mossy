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
import { size, map, includes } from 'lodash';

import appStyles from '../appStyles.js';
import tagsSelectListStyles from './tagsSelectListStyles.js';

export default function TagsSelectList({ tags, selectedTags, onPress }) {
  return (
    <ScrollView>
      <View style={appStyles.container}>
        <View style={tagsSelectListStyles.tagCardContainer}>
          {size(tags) ? (
            <>
              {map(tags, (tag) => {
                let cardStyles;
                if (includes(selectedTags, tag._id.$oid)) {
                  cardStyles = [
                    tagsSelectListStyles.tagCard,
                    tagsSelectListStyles.tagCardHighlightedColor,
                  ];
                } else {
                  cardStyles = [
                    tagsSelectListStyles.tagCard,
                    tagsSelectListStyles.tagCardStandardColor,
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
