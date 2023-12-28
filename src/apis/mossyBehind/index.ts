import { ApiConfigs } from 'src/types/types.ts';

const mossyBackendDevUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

const endpoints = {
  user: `${mossyBackendDevUrl}api/user`,
  userTheme: `${mossyBackendDevUrl}api/user/theme`,
  tasks: `${mossyBackendDevUrl}api/tasks`,
  eventsString: `${mossyBackendDevUrl}api/events-string`,
  tags: `${mossyBackendDevUrl}api/tags`,
  events: `${mossyBackendDevUrl}api/events`,
  debugTasks: `${mossyBackendDevUrl}api/debug/tasks`,
  debugEvents: `${mossyBackendDevUrl}api/debug/events`,
  debugTags: `${mossyBackendDevUrl}api/debug/tags`,
};

const apiConfigs: ApiConfigs = {
  readUser: {
    endpoint: endpoints.user,
    payloadBuilder: ({ appleUserId }) => ({
      apple_user_id: appleUserId,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  updateUserTheme: {
    endpoint: endpoints.userTheme,
    payloadBuilder: ({
      appleUserId,
      shouldColorSchemeUseSystem,
      isColorSchemeDarkMode,
      colorTheme,
    }) => ({
      apple_user_id: appleUserId,
      should_color_scheme_use_system: shouldColorSchemeUseSystem,
      is_color_scheme_dark_mode: isColorSchemeDarkMode,
      color_theme: colorTheme,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  readTasks: {
    endpoint: endpoints.tasks,
    configBuilder: ({ token }) => ({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),
  },
  readEvents: {
    endpoint: endpoints.eventsString,
    configBuilder: ({ token }) => ({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),
  },
  readTags: {
    endpoint: endpoints.tags,
    configBuilder: ({ token }) => ({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),
  },
  createTask: {
    endpoint: endpoints.tasks,
    payloadBuilder: ({ name, frequency, tagIds }) => ({
      name,
      frequency,
      tags: tagIds,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  createTag: {
    endpoint: endpoints.tags,
    payloadBuilder: ({ name, description, parentTagId }) => ({
      name,
      description,
      parent_tag: parentTagId,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  deleteTasks: {
    endpoint: endpoints.tasks,
    payloadBuilder: ({ taskIds }) => taskIds,
    configBuilder: ({ token, payload }) => ({
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  deleteEvents: {
    endpoint: endpoints.events,
    payloadBuilder: ({ eventIds }) => eventIds,
    configBuilder: ({ token, payload }) => ({
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  deleteTags: {
    endpoint: endpoints.tags,
    payloadBuilder: ({ tagIds }) => tagIds,
    configBuilder: ({ token, payload }) => ({
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  updateTask: {
    endpoint: endpoints.tasks,
    payloadBuilder: ({ id, name, frequency, tagIds }) => ({
      _id: id,
      name,
      frequency,
      tags: tagIds,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  completeTask: {
    endpoint: endpoints.events,
    payloadBuilder: ({ taskId, completionDate }) => ({
      task: taskId,
      date: completionDate,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  updateEvent: {
    endpoint: endpoints.events,
    payloadBuilder: ({
      eventId,
      // taskId,
      completionDate,
    }) => ({
      _id: eventId,
      // task: taskId,
      date: completionDate,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  updateTag: {
    endpoint: endpoints.tags,
    payloadBuilder: ({ tagId, name, description, parentTagId }) => ({
      _id: tagId,
      name,
      description,
      parent_tag: parentTagId,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  debugCreateTasks: {
    endpoint: endpoints.debugTasks,
    payloadBuilder: ({ quantity }) => ({
      quantity,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  debugDeleteAllTasks: {
    endpoint: endpoints.debugTasks,
    configBuilder: ({ token }) => ({
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),
  },
  debugCreateEvents: {
    endpoint: endpoints.debugEvents,
    payloadBuilder: ({ quantity }) => ({
      quantity,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  debugDeleteAllEvents: {
    endpoint: endpoints.debugEvents,
    configBuilder: ({ token }) => ({
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),
  },
  debugCreateTags: {
    endpoint: endpoints.debugTags,
    payloadBuilder: ({ quantity }) => ({
      quantity,
    }),
    configBuilder: ({ token, payload }) => ({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }),
  },
  debugDeleteAllTags: {
    endpoint: endpoints.debugTags,
    configBuilder: ({ token }) => ({
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }),
  },
};

export default apiConfigs;
