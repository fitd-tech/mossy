import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Text, View, Pressable, Modal, useColorScheme } from 'react-native';
import { map, find, noop, includes, reject } from 'lodash';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';
import { RootSiblingParent } from 'react-native-root-siblings';

import FadeTransitionOverlay from 'src/components/FadeTransitionOverlay.tsx';
import appStyles from 'src/appStyles.ts';
import TagsList from 'src/routes/TagsList.tsx';
import TasksList from 'src/routes/TasksList.tsx';
import EventsList from 'src/routes/EventsList.tsx';
import {
  StaticContext,
  DataContext,
  UserContext,
  ThemeContext,
} from 'src/appContext.ts';
import { navigationRef, navigate } from 'src/RootNavigation.ts';
import LogIn from 'src/routes/LogIn.tsx';
import { colors } from 'src/common/constants.ts';
import { themes } from 'src/theme/colors.ts';
import TaskDetailsForm from 'src/routes/TaskDetailsForm.tsx';
import SettingsMenu from 'src/routes/SettingsMenu.tsx';
import MainMenu from 'src/routes/MainMenu.tsx';
import ThemeMenu from 'src/routes/ThemeMenu.tsx';
import EditTaskForm from 'src/routes/EditTaskForm.tsx';
import CompleteEventForm from 'src/routes/CompleteEventForm.tsx';
import ConfirmDelete from 'src/routes/ConfirmDelete.tsx';
import ConfirmLogOut from 'src/routes/ConfirmLogOut.tsx';
import EditEventForm from 'src/routes/EditEventForm.tsx';
import EditTagForm from 'src/routes/EditTagForm.tsx';
import apiConfigs from 'src/apis/mossyBehind/index.ts';
import {
  CompleteTaskPayloadBuilderParams,
  CreateTagPayloadBuilderParams,
  CreateTaskPayloadBuilderParams,
  DebugCreateEventsPayloadBuilderParams,
  DebugCreateTagsPayloadBuilderParams,
  DebugCreateTasksPayloadBuilderParams,
  DeleteEventsPayloadBuilderParams,
  DeleteTagsPayloadBuilderParams,
  DeleteTasksPayloadBuilderParams,
  ReadUserPayloadBuilderParams,
  SearchParams,
  UpdateEventPayloadBuilderParams,
  UpdateTagPayloadBuilderParams,
  UpdateTaskPayloadBuilderParams,
} from 'src/types/types.ts';
import { handleResponse } from 'src/common/utilities/requests.ts';

const { dark1 } = colors;

const defaultTheme = 'mossy';

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
  const [selectedTagIds, setSelectedTagIds] = useState([]);
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
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.readUser,
      params,
      token,
    };
    async function onSuccess(_userProfile) {
      setUserProfile(_userProfile);
      setUseSystemDarkMode(_userProfile.should_color_scheme_use_system);
      setDarkMode(_userProfile.is_color_scheme_dark_mode);
      setTheme(find(themes, { id: _userProfile.color_theme }));
    }
    async function onFailure() {
      clearUserData();
    }
    handleResponse({
      requestBuilderOptions,
      onSuccess,
      onFailure,
      setLoading: noop,
    });
  }, [appleUserId, token]);

  useEffect(() => {
    if (useSystemDarkMode) {
      if (colorScheme === 'dark') {
        setDarkMode(true);
      } else {
        setDarkMode(false);
      }
    }
  }, [colorScheme, useSystemDarkMode]);

  const getTasks = useCallback(
    async ({ searchParams }: { searchParams?: SearchParams } = {}) => {
      setLoadingTasks(true);
      if (!searchParams) {
        setTasksPage(1);
      }
      const requestBuilderOptions = {
        apiConfig: apiConfigs.readTasks,
        searchParams,
        token,
      };
      async function onSuccess(_tasks) {
        setTasks((tasksPrevious) => {
          if (searchParams?.offset) {
            const newTasks = [...tasksPrevious, ..._tasks];
            return newTasks;
          }
          return _tasks;
        });
      }
      handleResponse({
        requestBuilderOptions,
        onSuccess,
        setLoading: setLoadingTasks,
      });
    },
    [token],
  );

  const getEvents = useCallback(
    async ({ searchParams }: { searchParams?: SearchParams } = {}) => {
      setLoadingEvents(true);
      if (!searchParams) {
        setEventsPage(1);
      }
      const requestBuilderOptions = {
        apiConfig: apiConfigs.readEvents,
        searchParams,
        token,
      };
      async function onSuccess(_events) {
        setEvents((eventsPrevious) => {
          if (searchParams?.offset) {
            const newEvents = [...eventsPrevious, ..._events];
            return newEvents;
          }
          return _events;
        });
      }
      handleResponse({
        requestBuilderOptions,
        onSuccess,
        setLoading: setLoadingEvents,
      });
    },
    [token],
  );

  const getTags = useCallback(
    async ({ searchParams }: { searchParams?: SearchParams } = {}) => {
      setLoadingTags(true);
      if (!searchParams) {
        setTagsPage(1);
      }
      const requestBuilderOptions = {
        apiConfig: apiConfigs.readTags,
        searchParams,
        token,
      };
      async function onSuccess(_tags) {
        setTags((tagsPrevious) => {
          if (searchParams?.offset) {
            const newTags = [...tagsPrevious, ..._tags];
            return newTags;
          }
          return _tags;
        });
      }
      handleResponse({
        requestBuilderOptions,
        onSuccess,
        setLoading: setLoadingTags,
      });
    },
    [token],
  );

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

  const handleTaskCardPress = useCallback(
    (id) => {
      getTags();
      setSelectedId(id);
      const task = find(tasks, ['_id.$oid', id]);
      setName(task.name);
      setFrequency(String(task.frequency));
      setSelectedTagIds(map(task.tags || [], (tagId) => tagId.$oid));
      setFormType('taskDetails');
      setIsModalVisible(true);
    },
    [getTags, tasks],
  );

  const handleEventCardPress = useCallback(
    (id) => {
      setSelectedId(id);
      const event = find(events, ['_id.$oid', id]);
      setCompletionDate(new Date(Number(event.date.$date.$numberLong)));
      setFormType('editEvent');
      setIsModalVisible(true);
    },
    [events],
  );

  const handleTagCardPress = useCallback(
    (id) => {
      setSelectedId(id);
      const tag = find(tags, ['_id.$oid', id]);
      setName(tag.name);
      setDescription(tag.description);
      setParentTag(tag.parent_tag?.$oid);
      setFormType('editTag');
      setIsModalVisible(true);
    },
    [tags],
  );

  function handleTagSelectCardPress(currentId) {
    setSelectedTagIds((selectedTagIdsPrevious) => {
      let newSelectedTagIds;
      if (includes(selectedTagIdsPrevious, currentId)) {
        newSelectedTagIds = reject(
          selectedTagIdsPrevious,
          (tagId) => tagId === currentId,
        );
      } else {
        newSelectedTagIds = [...selectedTagIdsPrevious, currentId];
      }
      return newSelectedTagIds;
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
      tagIds: selectedTagIds,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.createTask,
      params,
      token,
    };
    async function onSuccess() {
      await getTasks();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function createTag() {
    setLoading(true);
    const params: CreateTagPayloadBuilderParams = {
      name,
      description,
      parentTagId: parentTag === 'placeholder' ? null : parentTag,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.createTag,
      params,
      token,
    };
    async function onSuccess() {
      await getTags();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function deleteTasks({ taskIds }) {
    setLoading(true);
    const params: DeleteTasksPayloadBuilderParams = {
      taskIds,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.deleteTasks,
      params,
      token,
    };
    async function onSuccess() {
      await getTasks();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function deleteEvents({ eventIds }) {
    setLoading(true);
    const params: DeleteEventsPayloadBuilderParams = {
      eventIds,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.deleteEvents,
      params,
      token,
    };
    async function onSuccess() {
      await getEvents();
      getTasks();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function deleteTags({ tagIds }) {
    setLoading(true);
    const params: DeleteTagsPayloadBuilderParams = {
      tagIds,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.deleteTags,
      params,
      token,
    };
    async function onSuccess() {
      await getTags();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function saveTask() {
    setLoading(true);
    const params: UpdateTaskPayloadBuilderParams = {
      id: selectedId,
      name,
      frequency: frequency ? Number(frequency) : 0,
      tagIds: selectedTagIds,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.updateTask,
      params,
      token,
    };
    async function onSuccess() {
      await getTasks();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function completeTask() {
    setLoading(true);
    const params: CompleteTaskPayloadBuilderParams = {
      taskId: selectedId,
      completionDate,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.completeTask,
      params,
      token,
    };
    async function onSuccess() {
      getTasks();
      getEvents();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function saveEvent() {
    setLoading(true);
    const event = find(events, ['_id.$oid', selectedId]);
    const params: UpdateEventPayloadBuilderParams = {
      eventId: event._id,
      taskId: event.task,
      completionDate,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.updateEvent,
      params,
      token,
    };
    async function onSuccess() {
      getEvents();
      getTasks();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function saveTag() {
    setLoading(true);
    const params: UpdateTagPayloadBuilderParams = {
      tagId: selectedId,
      name,
      description,
      parentTagId: parentTag === 'placeholder' ? null : parentTag,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.updateTag,
      params,
      token,
    };
    async function onSuccess() {
      getTags();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function debugAddAdminTasks() {
    setLoading(true);
    const params: DebugCreateTasksPayloadBuilderParams = {
      quantity: 50,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.debugCreateTasks,
      params,
      token,
    };
    async function onSuccess() {
      await getTasks();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function debugDeleteAllAdminTasks() {
    setLoading(true);
    const requestBuilderOptions = {
      apiConfig: apiConfigs.debugDeleteAllTasks,
      token,
    };
    async function onSuccess() {
      await getTasks();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function debugAddAdminEvents() {
    setLoading(true);
    const params: DebugCreateEventsPayloadBuilderParams = {
      quantity: 50,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.debugCreateEvents,
      params,
      token,
    };
    async function onSuccess() {
      await getTasks();
      await getEvents();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function debugDeleteAllAdminEvents() {
    setLoading(true);
    const requestBuilderOptions = {
      apiConfig: apiConfigs.debugDeleteAllEvents,
      token,
    };
    async function onSuccess() {
      await getTasks();
      await getEvents();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function debugAddAdminTags() {
    setLoading(true);
    const params: DebugCreateTagsPayloadBuilderParams = {
      quantity: 50,
    };
    const requestBuilderOptions = {
      apiConfig: apiConfigs.debugCreateTags,
      params,
      token,
    };
    async function onSuccess() {
      await getTags();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  async function debugDeleteAllAdminTags() {
    setLoading(true);
    const requestBuilderOptions = {
      apiConfig: apiConfigs.debugDeleteAllTags,
      token,
    };
    async function onSuccess() {
      await getTags();
      handleCloseModal();
    }
    handleResponse({ requestBuilderOptions, onSuccess, setLoading });
  }

  function handleCreate() {
    if (viewType === 'tasks') {
      getTags();
      setName('');
      setFrequency('');
      setFormType('editTask');
      setSelectedTagIds([]);
    } else if (viewType === 'tags') {
      setName('');
      setDescription('');
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
      deleteTasks({ taskIds: [_selectedId] });
    } else if (viewType === 'events') {
      deleteEvents({ eventIds: [_selectedId] });
    } else if (viewType === 'tags') {
      deleteTags({ tagIds: [_selectedId] });
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
          selectedTagIds={selectedTagIds}
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
      );
    }
    if (formType === 'taskDetails') {
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
                                  style={[
                                    appStyles.button,
                                    secondaryButtonColor,
                                  ]}
                                  onPress={handleCloseModal}
                                >
                                  <Text style={appStyles.buttonText}>
                                    Close
                                  </Text>
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
