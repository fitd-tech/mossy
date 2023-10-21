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

import { pluralize } from '../utilities/formatStrings';
import appStyles from '../appStyles';
import tasksListStyles from './tasksListStyles';
import { DataContext, StaticContext } from '../appContext';
import getDaysFromMilliseconds from '../utilities/time';
import fetchMore from '../utilities/fetchMore';

export default function TasksList() {
  const [lastContentHeight, setLastContentHeight] = useState(0);

  const { tasks, fetchingTasks, highlightButton, tasksPage } =
    useContext(DataContext);
  const {
    fetchTasks,
    fetchMoreTasks,
    onPressTaskCard: onPress,
    setViewType,
    setTasksPage,
  } = useContext(StaticContext);

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
          onRefresh={fetchTasks}
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
          page: tasksPage,
          setPage: setTasksPage,
          lastContentHeight,
          setLastContentHeight,
          fetchFunc: fetchTasks,
        })
      }
    >
      <View style={appStyles.container}>
        <View style={tasksListStyles.taskCardContainer}>
          {size(tasks) ? (
            <>
              {map(tasks, (task) => {
                const taskSelected = highlightButton === task._id.$oid;
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
                  taskCardStyle = tasksListStyles.taskCardHighlighted;
                } else if (isOverdue) {
                  taskCardStyle = tasksListStyles.taskCardOverdue;
                } else if (neverCompleted) {
                  taskCardStyle = tasksListStyles.taskCardNeverCompleted;
                } else {
                  taskCardStyle = tasksListStyles.taskCard;
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
                        <View style={tasksListStyles.taskCardBadge}>
                          <Text style={tasksListStyles.badgeTitle}>
                            {task.frequency}
                          </Text>
                          <Text style={tasksListStyles.badgeUom}>
                            {pluralize('day', task.frequency, {
                              capitalize: true,
                            })}
                          </Text>
                        </View>
                        <View style={tasksListStyles.taskCardBadge}>
                          <Text style={tasksListStyles.badgeTitle}>
                            {daysSinceLastEvent}
                          </Text>
                          <Text style={tasksListStyles.badgeUom}>
                            {pluralize('day', daysSinceLastEvent, {
                              capitalize: true,
                            })}
                          </Text>
                        </View>
                        <View style={tasksListStyles.taskCardBadge}>
                          <Text style={tasksListStyles.badgeTitle}>
                            {daysOverdue}
                          </Text>
                          <Text style={tasksListStyles.badgeUom}>
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
            <View style={appStyles.placeholder}>
              <Text style={appStyles.placeholderText}>Create some tasks!</Text>
            </View>
          )}
        </View>
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}
