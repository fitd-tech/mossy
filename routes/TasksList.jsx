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
import { size, map } from 'lodash';
import { useFocusEffect } from '@react-navigation/native';

import { pluralize } from 'common/utilities/formatStrings.ts';
import appStyles from 'appStyles.ts';
import tasksListStyles from 'routes/tasksListStyles.ts';
import { DataContext, StaticContext, ThemeContext } from 'appContext.ts';
import getDaysFromMilliseconds from 'common/utilities/time.ts';
import getMore from 'common/utilities/getMore.ts';

export default function TasksList() {
  const [lastContentHeight, setLastContentHeight] = useState(0);

  const { darkMode, backgroundColor, textColor, theme } =
    useContext(ThemeContext);
  const {
    tasks,
    fetchingTasks,
    selectedId: selectedTaskId,
    tasksPage,
  } = useContext(DataContext);
  const {
    getTasks,
    onPressTaskCard: onPress,
    setViewType,
    setTasksPage,
  } = useContext(StaticContext);

  const taskCardOverdueColors = {
    borderColor: theme.color1,
    backgroundColor: theme.color1,
  };

  const taskCardNeverCompletedColors = {
    borderColor: theme.color2,
    backgroundColor: theme.color2,
  };

  const taskCardHighlightedColors = {
    borderColor: theme.color3,
    backgroundColor: theme.color3,
  };

  const taskCardColors = {
    borderColor: theme.color4,
    backgroundColor: theme.color4,
  };

  useEffect(() => {
    if (tasksPage === 1) {
      setLastContentHeight(0);
    }
  }, [tasksPage]);

  useFocusEffect(() => {
    setViewType('tasks');
  });

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={fetchingTasks}
          onRefresh={getTasks}
          style={backgroundColor}
        />
      }
      style={backgroundColor}
      scrollEventThrottle={200}
      onScroll={(e) =>
        getMore(e, {
          pageSize: 50,
          page: tasksPage,
          setPage: setTasksPage,
          lastContentHeight,
          setLastContentHeight,
          fetchFunc: getTasks,
        })
      }
    >
      <View style={{ ...appStyles.container, ...backgroundColor }}>
        <View style={tasksListStyles.taskCardContainer}>
          {size(tasks) ? (
            <>
              {map(tasks, (task) => {
                const taskSelected = selectedTaskId === task._id.$oid;
                const daysSince = getDaysFromMilliseconds(
                  task.time_since_latest_event,
                );
                const daysSinceLastEvent = daysSince > 0 ? daysSince : 0;
                const mossDays = getDaysFromMilliseconds(task.moss);
                const daysOverdue = mossDays > 0 ? mossDays : 0;
                const isOverdue = mossDays > 0;
                const neverCompleted = !task.latest_event_date;
                let taskCardStyle;
                if (taskSelected) {
                  taskCardStyle = {
                    ...tasksListStyles.taskCardHighlighted,
                    ...taskCardHighlightedColors,
                  };
                } else if (isOverdue) {
                  taskCardStyle = {
                    ...tasksListStyles.taskCardOverdue,
                    ...taskCardOverdueColors,
                  };
                } else if (neverCompleted) {
                  taskCardStyle = {
                    ...tasksListStyles.taskCardNeverCompleted,
                    ...taskCardNeverCompletedColors,
                  };
                } else {
                  taskCardStyle = {
                    ...tasksListStyles.taskCard,
                    ...taskCardColors,
                  };
                }
                let taskTitleStyle;
                if (taskSelected) {
                  taskTitleStyle = tasksListStyles.taskTitleHighlighted;
                } else if (isOverdue) {
                  taskTitleStyle = tasksListStyles.taskTitleOverdue;
                } else if (neverCompleted) {
                  taskTitleStyle = tasksListStyles.taskTitleNeverCompleted;
                } else {
                  taskTitleStyle = tasksListStyles.taskTitle;
                }
                const titleLength = size(task.name);
                let titleFontSize;
                if (titleLength < 15) {
                  titleFontSize = tasksListStyles.taskTitleFontSizeLarge;
                } else if (titleLength >= 15 && titleLength < 25) {
                  titleFontSize = tasksListStyles.taskTitleFontSizeMedium;
                } else {
                  titleFontSize = tasksListStyles.taskTitleFontSizeSmall;
                }
                return (
                  <Pressable
                    onPress={() => onPress(task._id.$oid)}
                    key={task._id.$oid}
                  >
                    <View style={taskCardStyle}>
                      <Text style={[taskTitleStyle, titleFontSize]}>
                        {task.name}
                      </Text>
                      <View style={tasksListStyles.badgeWrapper}>
                        <View
                          style={{
                            ...tasksListStyles.taskCardBadge,
                            ...backgroundColor,
                          }}
                        >
                          <Text
                            style={{
                              ...tasksListStyles.badgeTitle,
                              ...textColor,
                            }}
                          >
                            {task.frequency}
                          </Text>
                          <Text
                            style={{
                              ...tasksListStyles.badgeUom,
                              ...textColor,
                            }}
                          >
                            {pluralize('day', task.frequency, {
                              capitalize: true,
                            })}
                          </Text>
                        </View>
                        <View
                          style={{
                            ...tasksListStyles.taskCardBadge,
                            ...backgroundColor,
                          }}
                        >
                          <Text
                            style={{
                              ...tasksListStyles.badgeTitle,
                              ...textColor,
                            }}
                          >
                            {daysSinceLastEvent}
                          </Text>
                          <Text
                            style={{
                              ...tasksListStyles.badgeUom,
                              ...textColor,
                            }}
                          >
                            {pluralize('day', daysSinceLastEvent, {
                              capitalize: true,
                            })}
                          </Text>
                        </View>
                        <View
                          style={{
                            ...tasksListStyles.taskCardBadge,
                            ...backgroundColor,
                          }}
                        >
                          <Text
                            style={{
                              ...tasksListStyles.badgeTitle,
                              ...textColor,
                            }}
                          >
                            {daysOverdue}
                          </Text>
                          <Text
                            style={{
                              ...tasksListStyles.badgeUom,
                              ...textColor,
                            }}
                          >
                            {pluralize('day', daysOverdue, {
                              capitalize: true,
                            })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </>
          ) : (
            <View style={{ ...appStyles.placeholder, ...backgroundColor }}>
              <Text style={{ ...appStyles.placeholderText, ...textColor }}>
                Create some tasks!
              </Text>
            </View>
          )}
        </View>
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}
