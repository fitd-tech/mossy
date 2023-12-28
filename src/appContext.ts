import { createContext } from 'react';

const initialUserContext = {
  isAuthenticated: undefined,
  setIsAuthenticated: undefined,
  appleUserId: undefined,
  setAppleUserId: undefined,
  userProfile: undefined,
  setUserProfile: undefined,
  setToken: undefined,
};

const initialDataContext = {
  tasks: undefined,
  events: undefined,
  tags: undefined,
  loadingTasks: undefined,
  loadingEvents: undefined,
  loadingTags: undefined,
  selectedId: undefined,
  tasksPage: undefined,
  eventsPage: undefined,
  tagsPage: undefined,
};

const initialStaticContext = {
  getTasks: undefined,
  getEvents: undefined,
  getTags: undefined,
  onPressTaskCard: undefined,
  onPressEventCard: undefined,
  onPressTagCard: undefined,
  setViewType: undefined,
  setTasksPage: undefined,
  setEventsPage: undefined,
  setTagsPage: undefined,
};

const initialThemeContext = {
  darkMode: undefined,
  backgroundColor: undefined,
  textColor: undefined,
  theme: undefined,
};

export const UserContext = createContext(initialUserContext);
export const DataContext = createContext(initialDataContext);
export const StaticContext = createContext(initialStaticContext);
export const ThemeContext = createContext(initialThemeContext);
