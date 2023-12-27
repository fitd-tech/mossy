import React from 'react';
import { Pressable, Text, View } from 'react-native';

import appStyles from 'appStyles.ts';
import { pluralize } from 'common/utilities/formatStrings.ts';
import getDaysFromMilliseconds from 'common/utilities/time.ts';

function TaskDetailsForm({
  task,
  theme,
  backgroundColor,
  textColor,
  primaryButtonColor,
  handleEdit,
  handleComplete,
  confirmDelete,
}) {
  const taskCardBadgeOverdueColor = {
    backgroundColor: theme.color1,
  };
  const taskCardBadgeNeverCompletedColor = {
    backgroundColor: theme.color2,
  };
  const taskCardBadgeCurrentColor = {
    backgroundColor: theme.color4,
  };

  const daysSince = getDaysFromMilliseconds(task?.time_since_latest_event);
  const daysSinceLastEvent = daysSince > 0 ? daysSince : 0;
  const mossDays = getDaysFromMilliseconds(task?.moss);
  const daysOverdue = mossDays > 0 ? mossDays : 0;
  const daysSinceStatus = task?.latest_event_date
    ? `${daysSinceLastEvent} ${pluralize('day', daysSinceLastEvent)} since`
    : 'Never completed!';
  let overdueStatus;
  if (!task?.latest_event_date) {
    overdueStatus = '';
  } else if (daysOverdue <= 0) {
    overdueStatus = '';
  } else {
    overdueStatus = `${daysOverdue} ${pluralize('day', daysOverdue)} overdue`;
  }
  let badgeStyles;
  if (!task?.latest_event_date) {
    badgeStyles = [appStyles.taskCardBadge, taskCardBadgeNeverCompletedColor];
  } else if (mossDays > 0) {
    badgeStyles = [appStyles.taskCardBadge, taskCardBadgeOverdueColor];
  } else {
    badgeStyles = [appStyles.taskCardBadge, taskCardBadgeCurrentColor];
  }
  return (
    <>
      <View style={{ ...appStyles.taskDetailsWrapper, ...backgroundColor }}>
        <Text style={{ ...appStyles.modalTitle, ...textColor }}>
          Task Details
        </Text>
        <View style={appStyles.taskStatusWrapper}>
          <View style={appStyles.taskStatusRow}>
            <View style={badgeStyles}>
              <Text style={appStyles.badgeTitle}>{task.frequency}</Text>
              <Text style={appStyles.badgeUom}>
                {pluralize('day', task.frequency, {
                  capitalize: true,
                })}
              </Text>
            </View>
            <Text style={textColor}>frequency</Text>
          </View>
          <View style={appStyles.taskStatusRow}>
            <View style={badgeStyles}>
              <Text style={appStyles.badgeTitle}>{daysSinceLastEvent}</Text>
              <Text style={appStyles.badgeUom}>
                {pluralize('day', daysSinceLastEvent, {
                  capitalize: true,
                })}
              </Text>
            </View>
            <Text style={textColor}>
              {!task?.moss ? 'never completed!' : 'since last completed'}
            </Text>
          </View>
          <View style={appStyles.taskStatusRow}>
            <View style={badgeStyles}>
              <Text style={appStyles.badgeTitle}>{daysOverdue}</Text>
              <Text style={appStyles.badgeUom}>
                {pluralize('day', daysOverdue, {
                  capitalize: true,
                })}
              </Text>
            </View>
            <Text style={textColor}>overdue</Text>
          </View>
        </View>
      </View>
      <Pressable
        style={[appStyles.button, primaryButtonColor]}
        onPress={handleEdit}
      >
        <Text style={appStyles.buttonText}>Edit</Text>
      </Pressable>
      <Pressable
        style={[appStyles.button, primaryButtonColor]}
        onPress={handleComplete}
      >
        <Text style={appStyles.buttonText}>Complete</Text>
      </Pressable>
      <Pressable
        style={[appStyles.button, primaryButtonColor]}
        onPress={confirmDelete}
      >
        <Text style={appStyles.buttonText}>Delete</Text>
      </Pressable>
    </>
  );
}

export default TaskDetailsForm;
