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

import FadeTransitionOverlay from './components/FadeTransitionOverlay.jsx';
import { pluralize } from './utilities/formatStrings';
import appStyles from './appStyles.js';
import tasksListStyles from './routes/tasksListStyles.js';
import TagsList from './routes/TagsList.jsx';
import TagsSelectList from './components/TagsSelectList.jsx';
import TasksList from './routes/TasksList.jsx';
import EventsList from './routes/EventsList.jsx';
import {
  StaticContext,
  DataContext,
  UserContext,
  ThemeContext,
} from './appContext';
import { navigationRef, navigate } from './RootNavigation';
import LogIn from './routes/LogIn.jsx';
import getDaysFromMilliseconds from './utilities/time';
import { colors } from './constants';
import { themes } from './theme/colors';
import TaskDetailsForm from './routes/TaskDetailsForm.tsx';
import SettingsMenu from './routes/SettingsMenu.tsx';
import MainMenu from './routes/MainMenu.tsx';
import ThemeMenu from './routes/ThemeMenu.tsx';
import EditTaskForm from './routes/EditTaskForm.tsx';
import CompleteEventForm from './routes/CompleteEventForm.tsx';
import ConfirmDelete from './routes/ConfirmDelete.tsx';
import ConfirmLogOut from './routes/ConfirmLogOut.tsx';
import EditEventForm from './routes/EditEventForm.tsx';
import EditTagForm from './routes/EditTagForm.tsx';

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
  const [formType, setFormType] = useState(null);
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
  console.log('isModalVisible', isModalVisible);
  console.log('formType', formType);

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
      return (
        <MainMenu
          viewType={viewType}
          primaryButtonColor={primaryButtonColor}
          secondaryButtonColor={secondaryButtonColor}
          backgroundColor={backgroundColor}
          textColor={textColor}
          handleViewTasks={handleViewTasks}
          handleViewEvents={handleViewEvents}
          handleViewTags={handleViewTags}
          handleViewSettings={handleViewSettings}
          handleLogOut={handleLogOut}
        />
      );
    }
    if (formType === 'settings') {
      return (
        <SettingsMenu
          backgroundColor={backgroundColor}
          textColor={textColor}
          userProfile={userProfile}
          primaryButtonColor={primaryButtonColor}
          handleViewThemeSettings={handleViewThemeSettings}
          storedAppleUserId={storedAppleUserId}
          adminAppleUserId={adminAppleUserId}
          debugAddAdminTasks={debugAddAdminTasks}
          debugDeleteAllAdminTasks={debugDeleteAllAdminTasks}
          debugAddAdminEvents={debugAddAdminEvents}
          debugDeleteAllAdminEvents={debugDeleteAllAdminEvents}
          debugAddAdminTags={debugAddAdminTags}
          debugDeleteAllAdminTags={debugDeleteAllAdminTags}
        />
      );
    }
    if (formType === 'theme') {
      return (
        <ThemeMenu
          backgroundColor={backgroundColor}
          textColor={textColor}
          useSystemDarkMode={useSystemDarkMode}
          colorScheme={colorScheme}
          storedAppleUserId={storedAppleUserId}
          darkMode={darkMode}
          theme={theme}
          saveUserTheme={saveUserTheme}
          setUseSystemDarkMode={setUseSystemDarkMode}
          savingUserTheme={savingUserTheme}
          setDarkMode={setDarkMode}
          themes={themes}
          setTheme={setTheme}
        />
      );
    }
    if (formType === 'editTask') {
      return (
        <EditTaskForm
          textColor={textColor}
          highlightButton={highlightButton}
          handleChangeField={handleChangeField}
          name={name}
          setName={setName}
          secondaryBackgroundColor={secondaryBackgroundColor}
          frequency={frequency}
          setFrequency={setFrequency}
          tags={tags}
          selectedTags={selectedTags}
          handleTagSelectCardPress={handleTagSelectCardPress}
          primaryButtonColor={primaryButtonColor}
          handleSaveTask={handleSaveTask}
          loading={loading}
        />
      );
    }
    if (formType === 'completeEvent') {
      const dateTimePickerStyles = generateDateTimePickerStyles(completionDate);
      return (
        <CompleteEventForm
          textColor={textColor}
          completionDate={completionDate}
          handleChangeDate={handleChangeDate}
          setCompletionDate={setCompletionDate}
          dateTimePickerStyles={dateTimePickerStyles}
          primaryButtonColor={primaryButtonColor}
          handleSaveComplete={handleSaveComplete}
          loading={loading}
        />
      );
    }
    if (formType === 'delete') {
      return (
        <ConfirmDelete
          textColor={textColor}
          primaryButtonColor={primaryButtonColor}
          handleDelete={handleDelete}
          loading={loading}
        />
      );
    }
    if (formType === 'logOut') {
      return <ConfirmLogOut />;
    }
    if (formType === 'taskDetails') {
      console.log('rendering taskDetails form');
      const task = find(tasks, (task) => {
        return task._id.$oid === highlightButton;
      });
      return (
        <TaskDetailsForm
          task={task}
          theme={theme}
          backgroundColor={backgroundColor}
          textColor={textColor}
          primaryButtonColor={primaryButtonColor}
          handleEdit={handleEdit}
          handleComplete={handleComplete}
          confirmDelete={confirmDelete}
        />
      );
    }
    if (formType === 'editEvent') {
      const event = find(events, ['_id.$oid', highlightButton]);
      const dateTimePickerStyles = generateDateTimePickerStyles(completionDate);
      return (
        <EditEventForm
          textColor={textColor}
          event={event}
          completionDate={completionDate}
          handleChangeDate={handleChangeDate}
          setCompletionDate={setCompletionDate}
          dateTimePickerStyles={dateTimePickerStyles}
          primaryButtonColor={primaryButtonColor}
          saveEvent={saveEvent}
          loading={loading}
          confirmDelete={confirmDelete}
        />
      );
    }
    if (formType === 'editTag') {
      return (
        <EditTagForm
          tags={tags}
          textColor={textColor}
          highlightButton={highlightButton}
          name={name}
          handleChangeField={handleChangeField}
          setName={setName}
          secondaryBackgroundColor={secondaryBackgroundColor}
          description={description}
          setDescription={setDescription}
          parentTag={parentTag}
          setParentTag={setParentTag}
          primaryButtonColor={primaryButtonColor}
          handleSaveTag={handleSaveTag}
          loading={loading}
          confirmDelete={confirmDelete}
        />
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
