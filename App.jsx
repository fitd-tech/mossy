import { useState, useEffect, createContext, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
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
import {
  map,
  size,
  find,
  orderBy,
  noop,
  truncate,
  includes,
  reject,
} from 'lodash';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';

import FadeTransitionOverlay from './components/FadeTransitionOverlay';
import { pluralize } from './utilities/formatStrings';
import appStyles from './appStyles.js';
import tasksListStyles from './components/tasksListStyles';
import TagsList from './components/TagsList';
import TagsSelectList from './components/TagsSelectList';
import TasksList from './components/TasksList';
import EventsList from './components/EventsList';
import { StaticContext, DataContext, UserContext } from './appContext';
import { navigationRef, navigate } from './RootNavigation';
import LogIn from './components/LogIn';

const mossyBackendDevUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const Tab = createMaterialTopTabNavigator();

export default function App() {
  const [highlightButton, setHighlightButton] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [tags, setTags] = useState([]);
  const [name, setName] = useState(null);
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [parentTag, setParentTag] = useState(null);
  const [formType, setFormType] = useState('task');
  const [completionDate, setCompletionDate] = useState(new Date());
  const [fetchingTasks, setFetchingTasks] = useState(false);
  const [fetchingEvents, setFetchingEvents] = useState(false);
  const [fetchingTags, setFetchingTags] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('tasks');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storedAppleUserId, setStoredAppleUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  async function fetchTasks() {
    setFetchingTasks(true);
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    let result;
    try {
      const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config);
      const serializedTasksResponse = await response.json();
      const tasksWithMoss = map(serializedTasksResponse, (task) => {
        const dateDifference = new Date() - new Date(task.latest_event_date);
        const daysDifference = Math.round(
          dateDifference / (1000 * 60 * 60 * 24),
        );
        return {
          ...task,
          daysSince: task.latest_event_date ? daysDifference : null,
          moss: task.latest_event_date ? daysDifference - task.frequency : null,
        };
      });
      const sortedTasksWithMoss = orderBy(tasksWithMoss, 'moss', 'desc');
      setTasks(sortedTasksWithMoss);
      result = serializedTasksResponse;
    } catch (err) {
      result = err.message;
    }
    setFetchingTasks(false);
    return result;
  }

  async function fetchEvents() {
    setFetchingEvents(true);
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    let result;
    try {
      const response = await fetch(
        `${mossyBackendDevUrl}api/events-string`,
        config,
      );
      const serializedEventsResponse = await response.json();
      setEvents(serializedEventsResponse);
      result = serializedEventsResponse;
    } catch (err) {
      result = err.message;
    }
    setFetchingEvents(false);
    return result;
  }

  async function fetchTags() {
    setFetchingTags(true);
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    let result;
    try {
      const response = await fetch(`${mossyBackendDevUrl}api/tags`, config);
      const serializedTagsResponse = await response.json();
      setTags(serializedTagsResponse);
      result = serializedTagsResponse;
    } catch (err) {
      result = err.message;
    }
    setFetchingTags(false);
    return result;
  }

  useEffect(() => {
    fetchTasks();
    fetchEvents();
    fetchTags();
  }, []);

  useEffect(() => {
    if (highlightButton && viewType === 'tasks') {
      const task = find(tasks, ['_id.$oid', highlightButton]);
      setName(task.name);
      setFrequency(String(task.frequency));
      setSelectedTags(map(task.tags || [], (tag) => tag.$oid));
    } else if (highlightButton && viewType === 'events') {
      const event = find(events, ['_id.$oid', highlightButton]);
      setCompletionDate(new Date(event.date));
    } else if (highlightButton && viewType === 'tags') {
      const tag = find(tags, ['_id.$oid', highlightButton]);
      setName(tag.name);
      setParentTag(tag.parent_tag?.$oid);
    }
  }, [highlightButton]);

  function handleTaskCardPress(id) {
    fetchTags();
    setHighlightButton(id);
    setFormType('taskDetails');
    setIsModalVisible(true);
  }

  function handleEventCardPress(id) {
    setHighlightButton(id);
    setFormType('editEvent');
    setIsModalVisible(true);
  }

  function handleTagCardPress(id) {
    setHighlightButton(id);
    setFormType('editTag');
    setIsModalVisible(true);
  }

  function handleTagSelectCardPress(id) {
    setSelectedTags((selectedTagsPrevious) => {
      let newSelectedTags;
      if (includes(selectedTagsPrevious, id)) {
        newSelectedTags = reject(selectedTagsPrevious, (tag) => tag === id);
      } else {
        newSelectedTags = [...selectedTagsPrevious, id];
      }
      return newSelectedTags;
    });
  }

  function handleCloseModal() {
    setIsModalVisible(false);
    setHighlightButton(null);
    setFormType(null);
  }

  function createTask() {
    async function postTask() {
      setLoading(true);
      const taskData = {
        name,
        frequency: frequency ? Number(frequency) : 0,
        tags: selectedTags,
      };
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config);
        const serializedCreateTaskResponse = await response.json();
        result = serializedCreateTaskResponse;
        await fetchTasks();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    postTask();
  }

  function createTag() {
    async function postTag() {
      setLoading(true);
      const tagData = {
        name,
        parent_tag: parentTag === 'placeholder' ? null : parentTag,
      };
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tagData),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tags`, config);
        const serializedCreateTagResponse = await response.json();
        result = serializedCreateTagResponse;
        await fetchTags();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    postTag();
  }

  function deleteTasks() {
    async function _deleteTasks() {
      setLoading(true);
      const config = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([highlightButton]),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config);
        const serializedDeleteTasksResponse = await response.json();
        result = serializedDeleteTasksResponse;
        await fetchTasks();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    _deleteTasks();
  }

  function deleteEvents() {
    async function _deleteEvents() {
      setLoading(true);
      const config = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([highlightButton]),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/events`, config);
        const serializedDeleteEventsResponse = await response.json();
        result = serializedDeleteEventsResponse;
        await fetchEvents();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    _deleteEvents();
  }

  function deleteTags() {
    async function _deleteTags() {
      setLoading(true);
      const config = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([highlightButton]),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tags`, config);
        const serializedDeleteTagsResponse = await response.json();
        result = serializedDeleteTagsResponse;
        await fetchTags();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    _deleteTags();
  }

  function saveTask() {
    async function updateTask() {
      setLoading(true);
      const task = {
        _id: highlightButton,
        name,
        frequency: frequency ? Number(frequency) : 0,
        tags: selectedTags,
      };
      const config = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tasks`, config);
        const serializedUpdateTaskResponse = await response.json();
        result = serializedUpdateTaskResponse;
        await fetchTasks();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    updateTask();
  }

  function completeTask() {
    async function _completeTask() {
      setLoading(true);
      const event = {
        task: highlightButton,
        date: completionDate,
      };
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/events`, config);
        const serializedCreateEventResponse = await response.json();
        result = serializedCreateEventResponse;
        fetchTasks();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    _completeTask();
  }

  function saveEvent() {
    async function updateEvent() {
      setLoading(true);
      const event = find(events, ['_id.$oid', highlightButton]);
      const updatedEvent = {
        _id: event._id,
        task: event.task,
        date: completionDate,
      };
      const config = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/events`, config);
        const serializedUpdateEventResponse = await response.json();
        result = serializedUpdateEventResponse;
        fetchEvents();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    updateEvent();
  }

  function saveTag() {
    async function updateTag() {
      setLoading(true);
      const tag = {
        _id: highlightButton,
        name,
        parent_tag: parentTag === 'plcaeholder' ? null : parentTag,
      };
      const config = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tag),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/tags`, config);
        const serializedUpdateTagResponse = await response.json();
        result = serializedUpdateTagResponse;
        fetchTags();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    updateTag();
  }

  function handleCreate() {
    if (viewType === 'tasks') {
      fetchTags();
      setName('');
      setFrequency('');
      setFormType('editTask');
    } else if (viewType === 'tags') {
      setName('');
      setParentTag(null);
      setFormType('editTag');
    }
    setIsModalVisible(true);
  }

  function handleEdit() {
    setFormType('editTask');
  }

  function handleSaveTask() {
    if (highlightButton) {
      saveTask();
    } else {
      createTask();
    }
  }

  function handleSaveTag() {
    if (highlightButton) {
      saveTag();
    } else {
      createTag();
    }
  }

  function handleComplete() {
    setCompletionDate(new Date());
    setFormType('completeEvent');
  }

  function handleSaveComplete() {
    completeTask();
  }

  function confirmDelete() {
    setFormType('delete');
  }

  function handleDelete() {
    if (viewType === 'tasks') {
      deleteTasks();
    } else if (viewType === 'events') {
      deleteEvents();
    } else if (viewType === 'tags') {
      deleteTags();
    }
  }

  function handleChangeField(value, setFunc) {
    setFunc(value);
  }

  function handleChangeDate(e, date, setFunc) {
    if (e.type === 'set') {
      setFunc(date);
    }
  }

  function handleOpenMenu() {
    setFormType('menu');
    setIsModalVisible(true);
  }

  function handleViewTasks() {
    navigate('tasks');
    setIsModalVisible(false);
  }

  function handleViewEvents() {
    navigate('events');
    setIsModalVisible(false);
  }

  function handleViewTags() {
    navigate('tags');
    setIsModalVisible(false);
  }

  function handleViewSettings() {
    setFormType('settings');
  }

  function handleLogOut() {
    setFormType('logOut');
  }

  function handleConfirmLogOut() {
    async function logOut() {
      try {
        const response = await AppleAuthentication.signOutAsync({
          user: storedAppleUserId,
        });
      } catch (err) {
        // The log in prompt automatically opens again - log the user out if they cancel it
        // Removing this value from storage is temporary - Apple doesn't allow the user to sign out except through settings
        // https://github.com/invertase/react-native-apple-authentication/issues/10
        SecureStore.setItemAsync('mossyAppleUserId', '');
        setIsModalVisible(false);
        setIsAuthenticated(false);
      }
    }
    logOut();
  }

  function generateDateTimePickerStyles(date) {
    let dateTimePickerStyles;
    if (date.getDate() < 10 && date.getMonth() < 10) {
      dateTimePickerStyles = [
        appStyles.dateTimePicker,
        appStyles.dateTimePickerOffsetTwoDigits,
      ];
    } else if (date.getDate() < 10 || date.getMonth() < 10) {
      dateTimePickerStyles = [
        appStyles.dateTimePicker,
        appStyles.dateTimePickerOffsetOneDigit,
      ];
    } else {
      dateTimePickerStyles = appStyles.dateTimePicker;
    }
    return dateTimePickerStyles;
  }

  function renderForm() {
    if (formType === 'menu') {
      function generateButtonStyles(buttonView) {
        if (buttonView === viewType) {
          return [appStyles.button, appStyles.secondaryButtonColor];
        } else {
          return [appStyles.button, appStyles.primaryButtonColor];
        }
      }
      return (
        <>
          <View style={appStyles.taskDetailsWrapper}>
            <Text style={appStyles.modalTitle}>Menu</Text>
          </View>
          <Pressable
            style={generateButtonStyles('tasks')}
            onPress={handleViewTasks}
          >
            <Text style={appStyles.buttonText}>Tasks</Text>
          </Pressable>
          <Pressable
            style={generateButtonStyles('events')}
            onPress={handleViewEvents}
          >
            <Text style={appStyles.buttonText}>Events</Text>
          </Pressable>
          <Pressable
            style={generateButtonStyles('tags')}
            onPress={handleViewTags}
          >
            <Text style={appStyles.buttonText}>Tags</Text>
          </Pressable>
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={handleViewSettings}
          >
            <Text style={appStyles.buttonText}>Settings</Text>
          </Pressable>
          <Pressable
            style={[
              appStyles.button,
              appStyles.secondaryButtonColor,
              { marginBottom: 30 },
            ]}
            onPress={handleLogOut}
          >
            <Text style={appStyles.buttonText}>Log Out</Text>
          </Pressable>
        </>
      );
    }
    if (formType === 'settings') {
      return (
        <>
          <View style={appStyles.taskDetailsWrapper}>
            <Text style={appStyles.modalTitle}>Settings</Text>
            {userProfile?.email && <Text>{userProfile?.email}</Text>}
          </View>
        </>
      );
    }
    if (formType === 'editTask') {
      return (
        <>
          <Text style={appStyles.modalTitle}>
            {highlightButton ? 'Edit Task' : 'Create Task'}
          </Text>
          <TextInput
            value={name}
            onChangeText={(value) => handleChangeField(value, setName)}
            placeholder="Name"
            style={appStyles.textInput}
          />
          <TextInput
            value={frequency}
            onChangeText={(value) => handleChangeField(value, setFrequency)}
            placeholder="Frequency"
            inputMode="numeric"
            style={appStyles.textInput}
          />
          <TagsSelectList
            tags={tags}
            selectedTags={selectedTags}
            onPress={handleTagSelectCardPress}
          />
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={handleSaveTask}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={appStyles.buttonText}>Save</Text>
            )}
          </Pressable>
        </>
      );
    }
    if (formType === 'completeEvent') {
      const dateTimePickerStyles = generateDateTimePickerStyles(completionDate);
      return (
        <>
          <Text style={appStyles.modalTitle}>Complete Task</Text>
          <View style={appStyles.dateWrapper}>
            <DateTimePicker
              mode="date"
              value={completionDate}
              onChange={(e, date) =>
                handleChangeDate(e, date, setCompletionDate)
              }
              style={dateTimePickerStyles}
            />
          </View>
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={handleSaveComplete}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={appStyles.buttonText}>Save</Text>
            )}
          </Pressable>
        </>
      );
    }
    if (formType === 'delete') {
      return (
        <>
          <Text style={appStyles.modalTitle}>Confirm Delete</Text>
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={handleDelete}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={appStyles.buttonText}>Delete</Text>
            )}
          </Pressable>
        </>
      );
    }
    if (formType === 'logOut') {
      return (
        <>
          <Text style={appStyles.modalTitle}>Confirm Log Out</Text>
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={handleConfirmLogOut}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={appStyles.buttonText}>Log Out</Text>
            )}
          </Pressable>
        </>
      );
    }
    if (formType === 'taskDetails') {
      const task = find(tasks, (task) => {
        return task._id.$oid === highlightButton;
      });
      const daysSinceLastEvent = task?.daysSince > 0 ? task?.daysSince : 0;
      const daysOverdue = task?.moss > 0 ? task?.moss : 0;
      const daysSinceStatus = task?.moss
        ? `${daysSinceLastEvent} ${pluralize('day', daysSinceLastEvent)} since`
        : 'Never completed!';
      let overdueStatus;
      if (!task?.moss) {
        overdueStatus = '';
      } else if (daysOverdue <= 0) {
        overdueStatus = '';
      } else {
        overdueStatus = `${daysOverdue} ${pluralize(
          'day',
          daysOverdue,
        )} overdue`;
      }
      let badgeStyles;
      if (!task?.moss) {
        badgeStyles = [
          appStyles.taskCardBadge,
          appStyles.taskCardBadgeNeverCompletedColor,
        ];
      } else if (task?.moss > 0) {
        badgeStyles = [
          appStyles.taskCardBadge,
          appStyles.taskCardBadgeOverdueColor,
        ];
      } else {
        badgeStyles = [
          appStyles.taskCardBadge,
          appStyles.taskCardBadgeCurrentColor,
        ];
      }
      return (
        <>
          <View style={appStyles.taskDetailsWrapper}>
            <Text style={appStyles.modalTitle}>Task Details</Text>
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
                <Text>frequency</Text>
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
                <Text>
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
                <Text>overdue</Text>
              </View>
            </View>
          </View>
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={handleEdit}
          >
            <Text style={appStyles.buttonText}>Edit</Text>
          </Pressable>
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={handleComplete}
          >
            <Text style={appStyles.buttonText}>Complete</Text>
          </Pressable>
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={confirmDelete}
          >
            <Text style={appStyles.buttonText}>Delete</Text>
          </Pressable>
        </>
      );
    }
    if (formType === 'editEvent') {
      const event = find(events, ['_id.$oid', highlightButton]);
      const dateTimePickerStyles = generateDateTimePickerStyles(completionDate);
      return (
        <>
          <Text style={appStyles.modalTitle}>Edit Event</Text>
          <View style={appStyles.modalTextWrapper}>
            <Text>{event?.task}</Text>
          </View>
          <View style={appStyles.dateWrapper}>
            <DateTimePicker
              mode="date"
              value={completionDate}
              onChange={(e, date) =>
                handleChangeDate(e, date, setCompletionDate)
              }
              style={dateTimePickerStyles}
            />
          </View>
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={saveEvent}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={appStyles.buttonText}>Save</Text>
            )}
          </Pressable>
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={confirmDelete}
          >
            <Text style={appStyles.buttonText}>Delete</Text>
          </Pressable>
        </>
      );
    }
    if (formType === 'editTag') {
      const tagChoices = [
        {
          _id: {
            $oid: 'placeholder',
          },
          name: 'Parent tag',
        },
        ...tags,
      ];
      return (
        <>
          <Text style={appStyles.modalTitle}>
            {highlightButton ? 'Edit Tag' : 'Create Tag'}
          </Text>
          <TextInput
            value={name}
            onChangeText={(value) => handleChangeField(value, setName)}
            placeholder="Name"
            style={appStyles.textInput}
          />
          <TextInput
            value={description}
            onChangeText={(value) => handleChangeField(value, setDescription)}
            placeholder="Description"
            style={appStyles.textInput}
          />
          <Picker
            selectedValue={parentTag}
            onValueChange={(itemValue, _itemIndex) => setParentTag(itemValue)}
          >
            {map(tagChoices, (tag) => (
              <Picker.Item
                key={tag._id.$oid}
                label={tag.name}
                value={tag._id.$oid}
              />
            ))}
          </Picker>
          <Pressable
            style={[appStyles.button, appStyles.primaryButtonColor]}
            onPress={handleSaveTag}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={appStyles.buttonText}>Save</Text>
            )}
          </Pressable>
          {highlightButton && (
            <Pressable
              style={[appStyles.button, appStyles.primaryButtonColor]}
              onPress={confirmDelete}
            >
              <Text style={appStyles.buttonText}>Delete</Text>
            </Pressable>
          )}
        </>
      );
    }
  }

  const userContext = useMemo(
    () => ({
      isAuthenticated,
      setIsAuthenticated,
      storedAppleUserId,
      setStoredAppleUserId,
      userProfile,
      setUserProfile,
    }),
    [
      isAuthenticated,
      setIsAuthenticated,
      storedAppleUserId,
      setStoredAppleUserId,
      userProfile,
      setUserProfile,
    ],
  );

  const dataContext = useMemo(
    () => ({
      tasks,
      events,
      tags,
      fetchingTasks,
      fetchingEvents,
      fetchingTags,
      highlightButton,
    }),
    [
      tasks,
      events,
      tags,
      fetchingTasks,
      fetchingEvents,
      fetchingTags,
      highlightButton,
    ],
  );

  const staticContext = useMemo(
    () => ({
      fetchTasks,
      fetchEvents,
      fetchTags,
      onPressTaskCard: handleTaskCardPress,
      onPressEventCard: handleEventCardPress,
      onPressTagCard: handleTagCardPress,
      setViewType,
    }),
    [
      fetchTasks,
      fetchEvents,
      fetchTags,
      handleTaskCardPress,
      handleEventCardPress,
      handleTagCardPress,
      setViewType,
    ],
  );

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <View style={appStyles.appTitleWrapper}>
          <Text style={appStyles.appTitle}>mossy</Text>
        </View>
        <UserContext.Provider value={userContext}>
          <StaticContext.Provider value={staticContext}>
            <DataContext.Provider value={dataContext}>
              {isAuthenticated ? (
                <>
                  <Tab.Navigator
                    initialRouteName="tasks"
                    screenOptions={{
                      tabBarStyle: {
                        height: 0,
                      },
                    }}
                  >
                    <Tab.Screen name="tasks" component={TasksList} />
                    <Tab.Screen name="events" component={EventsList} />
                    <Tab.Screen name="tags" component={TagsList} />
                  </Tab.Navigator>
                  <FadeTransitionOverlay isVisible={isModalVisible} />
                  <Modal
                    animationType="slide"
                    transparent
                    visible={isModalVisible}
                  >
                    <Pressable
                      onPress={() => handleCloseModal()}
                      style={appStyles.modalPressOut}
                    >
                      <View style={appStyles.centeredView}>
                        <View style={appStyles.modalView}>
                          <Pressable
                            onPress={noop}
                            style={appStyles.modalPressReset}
                          >
                            {renderForm()}
                            <Pressable
                              style={[
                                appStyles.button,
                                appStyles.secondaryButtonColor,
                              ]}
                              onPress={handleCloseModal}
                            >
                              <Text style={appStyles.buttonText}>Cancel</Text>
                            </Pressable>
                          </Pressable>
                        </View>
                      </View>
                    </Pressable>
                  </Modal>
                  <Pressable
                    onPress={handleOpenMenu}
                    style={appStyles.menuButtonWrapper}
                  >
                    <Ionicons name="menu" size={48} color="white" />
                  </Pressable>
                  {viewType !== 'events' && (
                    <Pressable
                      onPress={handleCreate}
                      style={appStyles.addTaskButtonWrapper}
                    >
                      <Ionicons
                        name="ios-add-circle"
                        size={48}
                        color="white"
                        style={{ marginLeft: 3 }}
                      />
                    </Pressable>
                  )}
                </>
              ) : (
                <Tab.Navigator
                  initialRouteName="log-in"
                  screenOptions={{
                    tabBarStyle: {
                      height: 0,
                    },
                  }}
                >
                  <Tab.Screen name="log-in" component={LogIn} />
                </Tab.Navigator>
              )}
            </DataContext.Provider>
          </StaticContext.Provider>
        </UserContext.Provider>
      </NavigationContainer>
    </>
  );
}
