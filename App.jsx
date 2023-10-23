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
  Switch,
  useColorScheme,
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
  filter,
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
import {
  StaticContext,
  DataContext,
  UserContext,
  ThemeContext,
} from './appContext';
import { navigationRef, navigate } from './RootNavigation';
import LogIn from './components/LogIn';
import getDaysFromMilliseconds from './utilities/time';
import { colors } from './constants';
import { themes } from './theme/colors';

const { dark1 } = colors;

const defaultTheme = 'mossy';

const mossyBackendDevUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const adminAppleUserId = process.env.EXPO_PUBLIC_ADMIN_APPLE_USER_ID;

const Tab = createMaterialTopTabNavigator();

export default function App() {
  // System light/dark mode
  const colorScheme = useColorScheme();

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
  const [storedToken, setStoredToken] = useState(null);
  const [tasksPage, setTasksPage] = useState(1);
  const [eventsPage, setEventsPage] = useState(1);
  const [tagsPage, setTagsPage] = useState(1);
  const [useSystemDarkMode, setUseSystemDarkMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState(find(themes, { name: defaultTheme }));
  const [savingUserTheme, setSavingUserTheme] = useState(false);

  const textColor = darkMode
    ? appStyles.darkModeTextColor
    : appStyles.lightModeTextColor;
  const backgroundColor = darkMode
    ? appStyles.darkModeBackgroundColor
    : appStyles.lightModeBackgroundColor;
  const secondaryBackgroundColor = darkMode
    ? appStyles.darkModeLighterBackgroundColor
    : appStyles.lightModeBackgroundColor;
  const primaryButtonColor = {
    backgroundColor: theme.color1,
  };
  const secondaryButtonColor = {
    backgroundColor: theme.color2,
  };

  const taskCardBadgeOverdueColor = {
    backgroundColor: theme.color1,
  };
  const taskCardBadgeNeverCompletedColor = {
    backgroundColor: theme.color2,
  };
  const taskCardBadgeCurrentColor = {
    backgroundColor: theme.color4,
  };

  async function fetchUser() {
    const data = {
      apple_user_id: storedAppleUserId,
    };
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(`${mossyBackendDevUrl}api/user`, config);
    if (response.ok) {
      const serializedUser = await response.json();
      setUserProfile(serializedUser);
      setUseSystemDarkMode(serializedUser.should_color_scheme_use_system);
      setDarkMode(serializedUser.is_color_scheme_dark_mode);
      setTheme(find(themes, { id: serializedUser.color_theme }));
    } else {
      clearUserData();
    }
  }

  function saveUserTheme(data) {
    async function updateUserTheme() {
      setSavingUserTheme(true);
      const userTheme = {
        apple_user_id: data.storedAppleUserId,
        should_color_scheme_use_system: data.useSystemDarkMode,
        is_color_scheme_dark_mode: data.darkMode,
        color_theme: data.theme,
      };
      const config = {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify(userTheme),
      };
      let result;
      try {
        const response = await fetch(
          `${mossyBackendDevUrl}api/user/theme`,
          config,
        );
        const serializedUpdateUserThemeResponse = await response.json();
        result = serializedUpdateUserThemeResponse;
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setSavingUserTheme(false);
    }
    updateUserTheme();
  }

  useEffect(() => {
    if (useSystemDarkMode) {
      if (colorScheme === 'dark') {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    }
  }, [colorScheme, useSystemDarkMode]);

  async function fetchTasks(options) {
    let searchParams;
    if (options) {
      searchParams = new URLSearchParams(options);
    } else {
      setTasksPage(1);
      searchParams = new URLSearchParams({
        limit: 50,
      });
    }
    const querystring = searchParams ? `?${searchParams.toString()}` : '';
    setFetchingTasks(true);
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`,
      },
    };
    let result;
    try {
      const response = await fetch(
        `${mossyBackendDevUrl}api/tasks${querystring}`,
        config,
      );
      const serializedTasksResponse = await response.json();
      setTasks((tasksPrevious) => {
        if (options?.offset) {
          const newTasks = [...tasksPrevious, ...serializedTasksResponse];
          return newTasks;
        }
        return serializedTasksResponse;
      });
      result = serializedTasksResponse;
    } catch (err) {
      result = err.message;
    }
    setFetchingTasks(false);
    return result;
  }

  async function fetchEvents(options) {
    let searchParams;
    if (options) {
      searchParams = new URLSearchParams(options);
    } else {
      setEventsPage(1);
      searchParams = new URLSearchParams({
        limit: 50,
      });
    }
    const querystring = searchParams ? `?${searchParams.toString()}` : '';
    setFetchingEvents(true);
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`,
      },
    };
    let result;
    try {
      const response = await fetch(
        `${mossyBackendDevUrl}api/events-string${querystring}`,
        config,
      );
      const serializedEventsResponse = await response.json();
      setEvents((eventsPrevious) => {
        if (options?.offset) {
          const newEvents = [...eventsPrevious, ...serializedEventsResponse];
          return newEvents;
        }
        return serializedEventsResponse;
      });
      result = serializedEventsResponse;
    } catch (err) {
      result = err.message;
    }
    setFetchingEvents(false);
    return result;
  }

  async function fetchTags(options) {
    let searchParams;
    if (options) {
      searchParams = new URLSearchParams(options);
    } else {
      setTagsPage(1);
      searchParams = new URLSearchParams({
        limit: 200,
      });
    }
    const querystring = searchParams ? `?${searchParams.toString()}` : '';
    setFetchingTags(true);
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`,
      },
    };
    let result;
    try {
      const response = await fetch(
        `${mossyBackendDevUrl}api/tags${querystring}`,
        config,
      );
      const serializedTagsResponse = await response.json();
      setTags((tagsPrevious) => {
        if (options?.offset) {
          const newTags = [...tagsPrevious, ...serializedTagsResponse];
          return newTags;
        }
        return serializedTagsResponse;
      });
      result = serializedTagsResponse;
    } catch (err) {
      result = err.message;
    }
    setFetchingTags(false);
    return result;
  }

  function clearUserData() {
    SecureStore.setItemAsync('mossyAppleUserId', '');
    SecureStore.setItemAsync('mossyToken', '');
    setStoredAppleUserId(null);
    setStoredToken(null);
    setIsModalVisible(false);
    setIsAuthenticated(false);
  }

  useEffect(() => {
    async function loadUser() {
      const token = await SecureStore.getItemAsync('mossyToken');
      setStoredToken(token);
      const mossyAppleUserId =
        await SecureStore.getItemAsync('mossyAppleUserId');
      setStoredAppleUserId(mossyAppleUserId);
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (storedAppleUserId && storedToken && !userProfile) {
      fetchUser();
    }
  }, [storedAppleUserId, storedToken, userProfile]);

  useEffect(() => {
    async function loadData() {
      if (storedToken) {
        fetchTasks();
        fetchEvents();
        fetchTags();
      }
    }
    loadData();
  }, [storedToken]);

  useEffect(() => {
    if (highlightButton && viewType === 'tasks') {
      const task = find(tasks, ['_id.$oid', highlightButton]);
      setName(task.name);
      setFrequency(String(task.frequency));
      setSelectedTags(map(task.tags || [], (tag) => tag.$oid));
    } else if (highlightButton && viewType === 'events') {
      const event = find(events, ['_id.$oid', highlightButton]);
      setCompletionDate(new Date(Number(event.date.$date.$numberLong)));
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
          Authorization: `Bearer ${storedToken}`,
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
          Authorization: `Bearer ${storedToken}`,
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
          Authorization: `Bearer ${storedToken}`,
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
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify([highlightButton]),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/events`, config);
        const serializedDeleteEventsResponse = await response.json();
        result = serializedDeleteEventsResponse;
        await fetchEvents();
        fetchTasks();
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
          Authorization: `Bearer ${storedToken}`,
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
          Authorization: `Bearer ${storedToken}`,
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
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify(event),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/events`, config);
        const serializedCreateEventResponse = await response.json();
        result = serializedCreateEventResponse;
        fetchTasks();
        fetchEvents();
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
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify(updatedEvent),
      };
      let result;
      try {
        const response = await fetch(`${mossyBackendDevUrl}api/events`, config);
        const serializedUpdateEventResponse = await response.json();
        result = serializedUpdateEventResponse;
        fetchEvents();
        fetchTasks();
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
          Authorization: `Bearer ${storedToken}`,
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

  function debugAddAdminTasks() {
    async function postTasks() {
      setLoading(true);
      const taskData = {
        quantity: 50,
      };
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify(taskData),
      };
      let result;
      try {
        const response = await fetch(
          `${mossyBackendDevUrl}api/debug/tasks`,
          config,
        );
        const serializedCreateTaskResponse = await response.json();
        result = serializedCreateTaskResponse;
        await fetchTasks();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    postTasks();
  }

  function debugDeleteAllAdminTasks() {
    async function _deleteTasks() {
      setLoading(true);
      const config = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
      };
      let result;
      try {
        const response = await fetch(
          `${mossyBackendDevUrl}api/debug/tasks`,
          config,
        );
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

  function debugAddAdminEvents() {
    async function postTasks() {
      setLoading(true);
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
      };
      let result;
      try {
        const response = await fetch(
          `${mossyBackendDevUrl}api/debug/events`,
          config,
        );
        const serializedCreateEventsResponse = await response.json();
        result = serializedCreateEventsResponse;
        await fetchTasks();
        await fetchEvents();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    postTasks();
  }

  function debugDeleteAllAdminEvents() {
    async function deleteEvents() {
      setLoading(true);
      const config = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
      };
      let result;
      try {
        const response = await fetch(
          `${mossyBackendDevUrl}api/debug/events`,
          config,
        );
        const serializedDeleteEventsResponse = await response.json();
        result = serializedDeleteEventsResponse;
        await fetchTasks();
        await fetchEvents();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    deleteEvents();
  }

  function debugAddAdminTags() {
    async function postTags() {
      setLoading(true);
      const tagsData = {
        quantity: 50,
      };
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify(tagsData),
      };
      let result;
      try {
        const response = await fetch(
          `${mossyBackendDevUrl}api/debug/tags`,
          config,
        );
        const serializedCreateTagsResponse = await response.json();
        result = serializedCreateTagsResponse;
        await fetchTags();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    postTags();
  }

  function debugDeleteAllAdminTags() {
    async function deleteTags() {
      setLoading(true);
      const config = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
      };
      let result;
      try {
        const response = await fetch(
          `${mossyBackendDevUrl}api/debug/tags`,
          config,
        );
        const serializedDeleteTagsResponse = await response.json();
        result = serializedDeleteTagsResponse;
        await fetchTags();
        handleCloseModal();
      } catch (err) {
        result = err.message;
      }
      setLoading(false);
    }
    deleteTags();
  }

  function handleCreate() {
    if (viewType === 'tasks') {
      fetchTags();
      setName('');
      setFrequency('');
      setFormType('editTask');
      setSelectedTags([]);
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

  function handleViewThemeSettings() {
    setFormType('theme');
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
        clearUserData();
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
          return [appStyles.button, secondaryButtonColor];
        } else {
          return [appStyles.button, primaryButtonColor];
        }
      }
      return (
        <>
          <View style={{ ...appStyles.taskDetailsWrapper, ...backgroundColor }}>
            <Text style={{ ...appStyles.modalTitle, ...textColor }}>Menu</Text>
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
            style={[appStyles.button, primaryButtonColor]}
            onPress={handleViewSettings}
          >
            <Text style={appStyles.buttonText}>Settings</Text>
          </Pressable>
          <Pressable
            style={[
              appStyles.button,
              secondaryButtonColor,
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
          <View style={{ ...appStyles.taskDetailsWrapper, ...backgroundColor }}>
            <Text style={{ ...appStyles.modalTitle, ...textColor }}>
              Settings
            </Text>
            {userProfile?.email && (
              <Text style={textColor}>{userProfile?.email}</Text>
            )}
            <Pressable
              style={[
                appStyles.button,
                primaryButtonColor,
                { marginTop: 25, marginBottom: 0 },
              ]}
              onPress={handleViewThemeSettings}
            >
              <Text style={appStyles.buttonText}>Theme</Text>
            </Pressable>
          </View>
          {storedAppleUserId === adminAppleUserId && (
            <>
              <Text style={{ ...appStyles.modalTitle, ...textColor }}>
                Debug Options
              </Text>
              <Pressable
                style={[appStyles.button, primaryButtonColor]}
                onPress={debugAddAdminTasks}
              >
                <Text style={appStyles.buttonText}>Add 50 Tasks</Text>
              </Pressable>
              <Pressable
                style={[appStyles.button, primaryButtonColor]}
                onPress={debugDeleteAllAdminTasks}
              >
                <Text style={appStyles.buttonText}>Delete All Tasks</Text>
              </Pressable>
              <Pressable
                style={[appStyles.button, primaryButtonColor]}
                onPress={debugAddAdminEvents}
              >
                <Text style={appStyles.buttonText}>Complete All Tasks</Text>
              </Pressable>
              <Pressable
                style={[appStyles.button, primaryButtonColor]}
                onPress={debugDeleteAllAdminEvents}
              >
                <Text style={appStyles.buttonText}>Delete All Events</Text>
              </Pressable>
              <Pressable
                style={[appStyles.button, primaryButtonColor]}
                onPress={debugAddAdminTags}
              >
                <Text style={appStyles.buttonText}>Add 50 Tags</Text>
              </Pressable>
              <Pressable
                style={[appStyles.button, primaryButtonColor]}
                onPress={debugDeleteAllAdminTags}
              >
                <Text style={appStyles.buttonText}>Delete All Tags</Text>
              </Pressable>
            </>
          )}
        </>
      );
    }
    if (formType === 'theme') {
      return (
        <>
          <View style={{ ...appStyles.taskDetailsWrapper, ...backgroundColor }}>
            <Text style={{ ...appStyles.modalTitle, ...textColor }}>Theme</Text>
            <Text style={{ ...appStyles.themeSettingsHeading, ...textColor }}>
              Dark Mode
            </Text>
            <View style={appStyles.switchAndLabelWrapper}>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={useSystemDarkMode ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(e) => {
                  const isSystemDarkMode = colorScheme === 'dark';
                  const data = {
                    storedAppleUserId,
                    useSystemDarkMode: e,
                    darkMode: e ? isSystemDarkMode : darkMode,
                    theme: theme.id,
                  };
                  saveUserTheme(data);
                  setUseSystemDarkMode(e);
                }}
                value={useSystemDarkMode}
                disabled={savingUserTheme}
              />
              <Text style={{ ...appStyles.switchLabel, ...textColor }}>
                Use system setting
              </Text>
            </View>
            <View style={appStyles.switchAndLabelWrapper}>
              <Switch
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={(e) => {
                  const data = {
                    storedAppleUserId,
                    useSystemDarkMode,
                    darkMode: e,
                    theme: theme.id,
                  };
                  saveUserTheme(data);
                  setDarkMode(e);
                }}
                value={darkMode}
                disabled={useSystemDarkMode || savingUserTheme}
              />
              <Text style={{ ...appStyles.switchLabel, ...textColor }}>
                Dark Mode
              </Text>
            </View>
            <Text style={{ ...appStyles.themeSettingsHeading, ...textColor }}>
              Color Theme
            </Text>
            <View style={appStyles.colorThemeWrapper}>
              {map(themes, (themeChoice) => {
                const selectedItemBorder = {
                  borderWidth: 2,
                  borderRadius: 5,
                  borderColor: textColor,
                };
                let rowStyles;
                if (theme.id === themeChoice.id) {
                  rowStyles = {
                    ...appStyles.colorThemeRow,
                    ...selectedItemBorder,
                  };
                } else {
                  rowStyles = appStyles.colorThemeRow;
                }
                return (
                  <Pressable
                    key={themeChoice.id}
                    style={rowStyles}
                    onPress={
                      savingUserTheme
                        ? noop
                        : () => {
                            const data = {
                              storedAppleUserId,
                              useSystemDarkMode,
                              darkMode,
                              theme: themeChoice.id,
                            };
                            saveUserTheme(data);
                            setTheme(themeChoice);
                          }
                    }
                  >
                    <View
                      style={{
                        ...appStyles.colorThemeColor,
                        backgroundColor: themeChoice.color1,
                      }}
                    />
                    <View
                      style={{
                        ...appStyles.colorThemeColor,
                        backgroundColor: themeChoice.color2,
                      }}
                    />
                    <View
                      style={{
                        ...appStyles.colorThemeColor,
                        backgroundColor: themeChoice.color3,
                      }}
                    />
                    <View
                      style={{
                        ...appStyles.colorThemeColor,
                        backgroundColor: themeChoice.color4,
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </>
      );
    }
    if (formType === 'editTask') {
      return (
        <>
          <Text style={{ ...appStyles.modalTitle, ...textColor }}>
            {highlightButton ? 'Edit Task' : 'Create Task'}
          </Text>
          <TextInput
            value={name}
            onChangeText={(value) => handleChangeField(value, setName)}
            placeholder="Name"
            style={{
              ...appStyles.textInput,
              ...textColor,
              ...secondaryBackgroundColor,
            }}
          />
          <TextInput
            value={frequency}
            onChangeText={(value) => handleChangeField(value, setFrequency)}
            placeholder="Frequency"
            inputMode="numeric"
            style={{
              ...appStyles.textInput,
              ...textColor,
              ...secondaryBackgroundColor,
            }}
          />
          <TagsSelectList
            tags={tags}
            selectedTags={selectedTags}
            onPress={handleTagSelectCardPress}
          />
          <Pressable
            style={[appStyles.button, primaryButtonColor]}
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
          <Text style={{ ...appStyles.modalTitle, ...textColor }}>
            Complete Task
          </Text>
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
            style={[appStyles.button, primaryButtonColor]}
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
          <Text style={{ ...appStyles.modalTitle, ...textColor }}>
            Confirm Delete
          </Text>
          <Pressable
            style={[appStyles.button, primaryButtonColor]}
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
          <Text style={{ ...appStyles.modalTitle, ...textColor }}>
            Confirm Log Out
          </Text>
          <Pressable
            style={[appStyles.button, primaryButtonColor]}
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
        overdueStatus = `${daysOverdue} ${pluralize(
          'day',
          daysOverdue,
        )} overdue`;
      }
      let badgeStyles;
      if (!task?.latest_event_date) {
        badgeStyles = [
          appStyles.taskCardBadge,
          taskCardBadgeNeverCompletedColor,
        ];
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
    if (formType === 'editEvent') {
      const event = find(events, ['_id.$oid', highlightButton]);
      const dateTimePickerStyles = generateDateTimePickerStyles(completionDate);
      return (
        <>
          <Text style={{ ...appStyles.modalTitle, ...textColor }}>
            Edit Event
          </Text>
          <View style={appStyles.modalTextWrapper}>
            <Text style={textColor}>{event?.task}</Text>
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
            style={[appStyles.button, primaryButtonColor]}
            onPress={saveEvent}
          >
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <Text style={appStyles.buttonText}>Save</Text>
            )}
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
          <Text style={{ ...appStyles.modalTitle, ...textColor }}>
            {highlightButton ? 'Edit Tag' : 'Create Tag'}
          </Text>
          <TextInput
            value={name}
            onChangeText={(value) => handleChangeField(value, setName)}
            placeholder="Name"
            style={{
              ...appStyles.textInput,
              ...textColor,
              ...secondaryBackgroundColor,
            }}
          />
          <TextInput
            value={description}
            onChangeText={(value) => handleChangeField(value, setDescription)}
            placeholder="Description"
            style={{
              ...appStyles.textInput,
              ...textColor,
              ...secondaryBackgroundColor,
            }}
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
            style={[appStyles.button, primaryButtonColor]}
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
              style={[appStyles.button, primaryButtonColor]}
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
      setStoredToken,
    }),
    [
      isAuthenticated,
      setIsAuthenticated,
      storedAppleUserId,
      setStoredAppleUserId,
      userProfile,
      setUserProfile,
      setStoredToken,
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
      tasksPage,
      eventsPage,
      tagsPage,
    }),
    [
      tasks,
      events,
      tags,
      fetchingTasks,
      fetchingEvents,
      fetchingTags,
      highlightButton,
      tasksPage,
      eventsPage,
      tagsPage,
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
      setTasksPage,
      setEventsPage,
      setTagsPage,
    }),
    [
      fetchTasks,
      fetchEvents,
      fetchTags,
      handleTaskCardPress,
      handleEventCardPress,
      handleTagCardPress,
      setViewType,
      setTasksPage,
      setEventsPage,
      setTagsPage,
    ],
  );

  const themeContext = useMemo(
    () => ({
      darkMode,
      backgroundColor,
      textColor,
      theme,
    }),
    [darkMode, backgroundColor, textColor, theme],
  );

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <View style={{ ...appStyles.appTitleWrapper, ...backgroundColor }}>
          <Text style={{ ...appStyles.appTitle, ...textColor }}>mossy</Text>
        </View>
        <ThemeContext.Provider value={themeContext}>
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
                          <View
                            style={{
                              ...appStyles.modalView,
                              ...backgroundColor,
                            }}
                          >
                            <Pressable
                              onPress={noop}
                              style={appStyles.modalPressReset}
                            >
                              {renderForm()}
                              <Pressable
                                style={[appStyles.button, secondaryButtonColor]}
                                onPress={handleCloseModal}
                              >
                                <Text style={appStyles.buttonText}>Close</Text>
                              </Pressable>
                            </Pressable>
                          </View>
                        </View>
                      </Pressable>
                    </Modal>
                    <Pressable
                      onPress={handleOpenMenu}
                      style={{
                        ...appStyles.menuButtonWrapper,
                        ...secondaryButtonColor,
                      }}
                    >
                      <Ionicons
                        name="menu"
                        size={48}
                        color={darkMode ? dark1 : 'white'}
                      />
                    </Pressable>
                    {viewType !== 'events' && (
                      <Pressable
                        onPress={handleCreate}
                        style={{
                          ...appStyles.addTaskButtonWrapper,
                          ...secondaryButtonColor,
                        }}
                      >
                        <Ionicons
                          name="ios-add-circle"
                          size={48}
                          color={darkMode ? dark1 : 'white'}
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
        </ThemeContext.Provider>
      </NavigationContainer>
    </>
  );
}
