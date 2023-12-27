import React, { useState, useEffect, createContext, useMemo, useCallback } from 'react';
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
import { RootSiblingParent } from 'react-native-root-siblings';
import Toast from 'react-native-root-toast';

import FadeTransitionOverlay from 'components/FadeTransitionOverlay.jsx';
import { pluralize } from 'common/utilities/formatStrings.js';
import appStyles from 'appStyles.js';
import tasksListStyles from 'routes/tasksListStyles.js';
import TagsList from 'routes/TagsList.jsx';
import TagsSelectList from 'components/TagsSelectList.jsx';
import TasksList from 'routes/TasksList.jsx';
import EventsList from 'routes/EventsList.jsx';
import {
  StaticContext,
  DataContext,
  UserContext,
  ThemeContext,
} from 'appContext.js';
import { navigationRef, navigate } from 'RootNavigation.js';
import LogIn from 'routes/LogIn.jsx';
import getDaysFromMilliseconds from 'common/utilities/time.js';
import { responseStatus, colors } from 'common/constants.ts';
import { themes } from 'theme/colors.js';
import TaskDetailsForm from 'routes/TaskDetailsForm.tsx';
import SettingsMenu from 'routes/SettingsMenu.tsx';
import MainMenu from 'routes/MainMenu.tsx';
import ThemeMenu from 'routes/ThemeMenu.tsx';
import EditTaskForm from 'routes/EditTaskForm.tsx';
import CompleteEventForm from 'routes/CompleteEventForm.tsx';
import ConfirmDelete from 'routes/ConfirmDelete.tsx';
import ConfirmLogOut from 'routes/ConfirmLogOut.tsx';
import EditEventForm from 'routes/EditEventForm.tsx';
import EditTagForm from 'routes/EditTagForm.tsx';
import { fetchUser } from 'apis/mossyBehind/auth.js';
import requestBuilder from 'apis/requestBuilder.js';
import apiConfigs from 'apis/mossyBehind/index'
import { CreateTaskPayloadBuilderParams, ReadUserPayloadBuilderParams, SearchParams, UserApiConfig } from 'types/types.ts';

const { dark1 } = colors;

const defaultTheme = 'mossy';

const mossyBackendDevUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const adminAppleUserId = process.env.EXPO_PUBLIC_ADMIN_APPLE_USER_ID;

const Tab = createMaterialTopTabNavigator();

export default function App() {
  // System light/dark mode
  const colorScheme = useColorScheme();

  const [selectedId, setSelectedId] = useState(null);
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
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState('tasks');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appleUserId, setAppleUserId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [token, setToken] = useState(null);
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

  function clearUserData() {
    SecureStore.setItemAsync('mossyAppleUserId', '');
    SecureStore.setItemAsync('mossyToken', '');
    setAppleUserId(null);
    setToken(null);
    setIsModalVisible(false);
    setIsAuthenticated(false);
  }

  const getUserDetails = useCallback(async () => {
    const params: ReadUserPayloadBuilderParams = {
      appleUserId,
    }
    try {
      const {
        status,
        data: _userProfile,
        error,
      } = await requestBuilder({
        apiConfig: apiConfigs.readUser,
        params,
        token,
      });
      if (status === responseStatus.OK) {
        setUserProfile(_userProfile);
        setUseSystemDarkMode(_userProfile.should_color_scheme_use_system);
        setDarkMode(_userProfile.is_color_scheme_dark_mode);
        setTheme(find(themes, { id: _userProfile.color_theme }));
        return _userProfile
      } else {
        Toast.show(error)
        clearUserData();
        return null
      }
    } catch (err) {
      Toast.show(err.message)
      return null
    }
  }, [appleUserId, token])

  useEffect(() => {
    if (useSystemDarkMode) {
      if (colorScheme === 'dark') {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    }
  }, [colorScheme, useSystemDarkMode]);

  const getTasks = useCallback(async ({
    searchParams,
  }: { searchParams?: SearchParams } = {}) => {
    setLoadingTasks(true);
    if (!searchParams) {
      setTasksPage(1);
    }
    try {
      const {
        status,
        data: _tasks,
        error,
      } = await requestBuilder({
        apiConfig: apiConfigs.readTasks,
        token,
      })
      if (status === responseStatus.OK) {
        setTasks((tasksPrevious) => {
          if (searchParams?.offset) {
            const newTasks = [...tasksPrevious, ..._tasks];
            return newTasks;
          }
          return _tasks;
        });
        setLoadingTasks(false);
        return _tasks
      } else {
        Toast.show(error)
        setLoadingTasks(false);
        return null
      }
    } catch (err) {
      Toast.show(err.message)
      setLoadingTasks(false);
      return null
    }
  }, [token])

  const getEvents = useCallback(async ({
    searchParams,
  }: { searchParams?: SearchParams } = {}) => {
    setLoadingEvents(true);
    if (!searchParams) {
      setEventsPage(1);
    }
    try {
      const {
        status,
        data: _events,
        error,
      } = await requestBuilder({
        apiConfig: apiConfigs.readEvents,
        token,
      })
      if (status === responseStatus.OK) {
        setEvents((eventsPrevious) => {
          if (searchParams?.offset) {
            const newEvents = [...eventsPrevious, ..._events];
            return newEvents;
          }
          return _events;
        });
        setLoadingEvents(false);
        return _events
      } else {
        Toast.show(error)
        setLoadingEvents(false);
        return null
      }
    } catch (err) {
      Toast.show(err.message)
      setLoadingEvents(false);
      return null
    }
  }, [token])

  const getTags = useCallback(async ({
    searchParams,
  }: { searchParams?: SearchParams } = {}) => {
    setLoadingTags(true);
    if (!searchParams) {
      setTagsPage(1);
    }
    try {
      const {
        status,
        data: _tags,
        error,
      } = await requestBuilder({
        apiConfig: apiConfigs.readTags,
        token,
      })
      if (status === responseStatus.OK) {
        setTags((tagsPrevious) => {
          if (searchParams?.offset) {
            const newTags = [...tagsPrevious, ..._tags];
            return newTags;
          }
          return _tags;
        });
        setLoadingTags(false);
        return _tags
      } else {
        Toast.show(error)
        setLoadingTags(false);
        return null
      }
    } catch (err) {
      Toast.show(err.message)
      setLoadingTags(false);
      return null
    }
  }, [token])

  useEffect(() => {
    async function loadUser() {
      const _token = await SecureStore.getItemAsync('mossyToken');
      setToken(_token);
      const mossyAppleUserId =
        await SecureStore.getItemAsync('mossyAppleUserId');
      setAppleUserId(mossyAppleUserId);
    }
    loadUser();
  }, []);

  // TEST linter
  useEffect(() => {
    console.log('tasks', tasks)
    Toast.show('mmm toasty')
  }, [tasks])

  useEffect(() => {
    if (appleUserId && token && !userProfile) {
      getUserDetails();
    }
  }, [getUserDetails, appleUserId, token, userProfile]);

  useEffect(() => {
    async function loadData() {
      if (token) {
        getTasks();
        getEvents();
        getTags();
      }
    }
    loadData();
  }, [getEvents, getTags, getTasks, token]);

  const handleTaskCardPress = useCallback((id) => {
    getTags();
    setSelectedId(id)
    const task = find(tasks, ['_id.$oid', id]);
    setName(task.name);
    setFrequency(String(task.frequency));
    setSelectedTags(map(task.tags || [], (tag) => tag.$oid));
    setFormType('taskDetails');
    setIsModalVisible(true);
  }, [getTags, tasks])

  const handleEventCardPress = useCallback((id) => {
    setSelectedId(id)
    const event = find(events, ['_id.$oid', id]);
    setCompletionDate(new Date(Number(event.date.$date.$numberLong)));
    setFormType('editEvent');
    setIsModalVisible(true);
  }, [events])

  const handleTagCardPress = useCallback((id) => {
    setSelectedId(id)
    const tag = find(tags, ['_id.$oid', id]);
    setName(tag.name);
    setParentTag(tag.parent_tag?.$oid);
    setFormType('editTag');
    setIsModalVisible(true);
  }, [tags])

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
    setSelectedId(null);
    setFormType(null);
  }

  async function createTask() {
      setLoading(true);
      const params: CreateTaskPayloadBuilderParams = {
        name,
        frequency: frequency ? Number(frequency) : 0,
        tags: selectedTags,
      };
      try {
        const {
          status,
          data: _task,
          error,
        } = await requestBuilder({
          apiConfig: apiConfigs.createTask,
          params,
          token,
        });
        if (status === responseStatus.OK) {
          await getTasks();
          handleCloseModal();
          setLoading(false)
          return _task
        } else {
          Toast.show(error)
          setLoading(false)
          return null
        }
      } catch (err) {
        Toast.show(err.message)
        setLoading(false)
        return null
      }
  }

  async function createTag() {
      setLoading(true);
      const params = {
        name,
        parent_tag: parentTag === 'placeholder' ? null : parentTag,
      };
      try {
        const {
          status,
          data: _tag,
          error,
        } = await requestBuilder({
          apiConfig: apiConfigs.createTag,
          params,
          token,
        });
        if (status === responseStatus.OK) {
          await getTags();
          handleCloseModal();
          setLoading(false)
          return _tag
        } else {
          Toast.show(error)
          setLoading(false)
          return null
        }
      } catch (err) {
        Toast.show(err.message)
        setLoading(false)
        return null
      }
  }

  async function deleteTasks({taskIds}) {
      setLoading(true);
      const params = {
        taskIds,
      }
      try {
        const {
          status,
          error,
        } = await requestBuilder({
          apiConfig: apiConfigs.deleteTasks,
          params,
          token,
        });
        if (status === responseStatus.OK) {
          await getTasks();
          handleCloseModal();
          setLoading(false)
          return 0
        } else {
          Toast.show(error)
          setLoading(false)
          return null
        }
      } catch (err) {
        Toast.show(err.message)
        setLoading(false)
        return null
      }
  }

  async function deleteEvents({eventIds}) {
      setLoading(true);
      const params = {
        eventIds,
      }
      try {
        const {
          status,
          error,
        } = await requestBuilder({
          apiConfig: apiConfigs.deleteEvents,
          params,
          token,
        });
        if (status === responseStatus.OK) {
          await getEvents();
          getTasks();
          handleCloseModal();
          setLoading(false)
          return 0
        } else {
          Toast.show(error)
          setLoading(false)
          return null
        }
      } catch (err) {
        Toast.show(err.message)
        setLoading(false)
        return null
      }
  }

  async function deleteTags({tagIds}) {
      setLoading(true);
      const params = {
        tagIds,
      }
      try {
        const {
          status,
          error,
        } = await requestBuilder({
          apiConfig: apiConfigs.deleteTags,
          params,
          token,
        });
        if (status === responseStatus.OK) {
          await getTags();
          handleCloseModal();
          setLoading(false)
          return 0
        } else {
          Toast.show(error)
          setLoading(false)
          return null
        }
      } catch (err) {
        Toast.show(err.message)
        setLoading(false)
        return null
      }
  }

  async function saveTask() {
      setLoading(true);
      const params = {
        id: selectedId,
        name,
        frequency: frequency ? Number(frequency) : 0,
        tags: selectedTags,
      };
      try {
        const {
          status,
          data: _task,
          error,
        } = await requestBuilder({
          apiConfig: apiConfigs.updateTask,
          params,
          token,
        });
        if (status === responseStatus.OK) {
          await getTasks();
          handleCloseModal();
          setLoading(false)
          return _task
        } else {
          Toast.show(error)
          setLoading(false)
          return null
        }
      } catch (err) {
        Toast.show(err.message)
        setLoading(false)
        return null
      }
  }

  async function completeTask() {
      setLoading(true);
      const params = {
        task: selectedId,
        date: completionDate,
      };
      try {
        const {
          status,
          data: _event,
          error,
        } = await requestBuilder({
          apiConfig: apiConfigs.completeTask,
          params,
          token,
        });
        if (status === responseStatus.OK) {
          getTasks();
          getEvents();
          handleCloseModal();
          setLoading(false)
          return _event
        } else {
          Toast.show(error)
          setLoading(false)
          return null
        }
      } catch (err) {
        Toast.show(err.message)
        setLoading(false)
        return null
      }
  }

  async function saveEvent() {
      setLoading(true);
      const event = find(events, ['_id.$oid', selectedId]);
      const params = {
        eventId: event._id,
        taskId: event.task,
        completionDate,
      };
      try {
        const {
          status,
          data: _event,
          error,
        } = await requestBuilder({
          apiConfig: apiConfigs.updateEvent,
          params,
          token,
        });
        if (status === responseStatus.OK) {
          getEvents();
          getTasks();
          handleCloseModal();
          setLoading(false)
          return _event
        } else {
          Toast.show(error)
          setLoading(false)
          return null
        }
      } catch (err) {
        Toast.show(err.message)
        setLoading(false)
        return null
      }
  }

  async function saveTag() {
      setLoading(true);
      const params = {
        _id: selectedId,
        name,
        parent_tag: parentTag === 'placeholder' ? null : parentTag,
      };
      try {
        const {
          status,
          data: _tag,
          error,
        } = await requestBuilder({
          apiConfig: apiConfigs.updateTag,
          params,
          token,
        });
        if (status === responseStatus.OK) {
          getTags();
          handleCloseModal();
          setLoading(false)
          return _tag
        } else {
          Toast.show(error)
          setLoading(false)
          return null
        }
      } catch (err) {
        Toast.show(err.message)
        setLoading(false)
        return null
      }
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
          Authorization: `Bearer ${token}`,
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
        await getTasks();
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
          Authorization: `Bearer ${token}`,
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
        await getTasks();
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
          Authorization: `Bearer ${token}`,
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
        await getTasks();
        await getEvents();
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
          Authorization: `Bearer ${token}`,
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
        await getTasks();
        await getEvents();
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
          Authorization: `Bearer ${token}`,
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
        await getTags();
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
          Authorization: `Bearer ${token}`,
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
        await getTags();
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
      getTags();
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
    if (selectedId) {
      saveTask();
    } else {
      createTask();
    }
  }

  function handleSaveTag() {
    if (selectedId) {
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

  function handleDelete(_selectedId) {
    if (viewType === 'tasks') {
      deleteTasks({taskIds: [_selectedId]});
    } else if (viewType === 'events') {
      deleteEvents({eventIds: [_selectedId]});
    } else if (viewType === 'tags') {
      deleteTags({tagIds: [_selectedId]});
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
        await AppleAuthentication.signOutAsync({
          user: appleUserId,
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
          appleUserId={appleUserId}
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
          appleUserId={appleUserId}
          darkMode={darkMode}
          theme={theme}
          setUseSystemDarkMode={setUseSystemDarkMode}
          savingUserTheme={savingUserTheme}
          setSavingUserTheme={setSavingUserTheme}
          setDarkMode={setDarkMode}
          themes={themes}
          setTheme={setTheme}
          token={token}
        />
      );
    }
    if (formType === 'editTask') {
      return (
        <EditTaskForm
          textColor={textColor}
          selectedTaskId={selectedId}
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
          handleDelete={() => handleDelete(selectedId)}
          loading={loading}
        />
      );
    }
    if (formType === 'logOut') {
      return (
        <ConfirmLogOut 
          textColor={textColor}
          primaryButtonColor={primaryButtonColor}
          handleConfirmLogOut={handleConfirmLogOut}
          loading={loading}
        />
      )
    }
    if (formType === 'taskDetails') {
      console.log('rendering taskDetails form');
      const task = find(tasks, (task) => {
        return task._id.$oid === selectedId;
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
      const event = find(events, ['_id.$oid', selectedId]);
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
          selectedTagId={selectedId}
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
      appleUserId,
      setAppleUserId,
      userProfile,
      setUserProfile,
      setToken,
    }),
    [
      isAuthenticated,
      setIsAuthenticated,
      appleUserId,
      setAppleUserId,
      userProfile,
      setUserProfile,
      setToken,
    ],
  );

  const dataContext = useMemo(
    () => ({
      tasks,
      events,
      tags,
      loadingTasks,
      loadingEvents,
      loadingTags,
      selectedId,
      tasksPage,
      eventsPage,
      tagsPage,
    }),
    [
      tasks,
      events,
      tags,
      loadingTasks,
      loadingEvents,
      loadingTags,
      selectedId,
      tasksPage,
      eventsPage,
      tagsPage,
    ],
  );

  const staticContext = useMemo(
    () => ({
      getTasks,
      getEvents,
      getTags,
      onPressTaskCard: handleTaskCardPress,
      onPressEventCard: handleEventCardPress,
      onPressTagCard: handleTagCardPress,
      setViewType,
      setTasksPage,
      setEventsPage,
      setTagsPage,
    }),
    [
      getTasks,
      getEvents,
      getTags,
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
      <RootSiblingParent>
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
      </RootSiblingParent>
    </>
  );
}
