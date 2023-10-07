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

import { pluralize } from '../utilities/formatStrings';
import appStyles from '../appStyles';
import tasksListStyles from './tasksListStyles';

export default function TasksList({
  tasks,
  fetchingTasks,
  fetchTasks,
  highlightButton,
  onPress,
}) {
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={fetchingTasks} onRefresh={fetchTasks} />
      }
    >
      <View style={appStyles.container}>
        <View style={tasksListStyles.taskCardContainer}>
          {size(tasks) ? (
            <>
              {map(tasks, (task) => {
                const taskSelected = highlightButton === task._id.$oid;
                const daysSinceLastEvent =
                  task.daysSince > 0 ? task.daysSince : 0;
                const daysOverdue = task.moss > 0 ? task.moss : 0;
                const isOverdue = task.moss > 0;
                const neverCompleted = task.moss === null;
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
