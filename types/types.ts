interface Tag {

}

interface RequestConfig {
  method: string;
  headers: {
    'Content-Type': string;
    Authorization: string;
  };
  body?: string
}

export interface ReadUserPayloadBuilderParams {
  appleUserId: string;
}

interface ReadUserPayload {
  apple_user_id: string;

}

interface ReadUserConfigBuilderParams {
  token: string;
  payload: ReadUserPayload
}

export interface UpdateUserThemePayloadBuilderParams {
  appleUserId: string;
  shouldColorSchemeUseSystem: boolean;
  isColorSchemeDarkMode: boolean;
  colorTheme: string;
}

interface UpdateUserThemePayload {
  apple_user_id: string;
  should_color_scheme_use_system: boolean;
  is_color_scheme_dark_mode: boolean;
  color_theme: string;
}

interface UpdateUserThemeConfigBuilderParams {
  token: string;
  payload: UpdateUserThemePayload
}

interface ReadTasksConfigBuilderParams {
  token: string;
}

interface ReadEventsConfigBuilderParams {
  token: string;
}

interface ReadTagsConfigBuilderParams {
  token: string;
}

export interface CreateTaskPayloadBuilderParams {
  name: string
  frequency: number
  tags: Tag[]
}

interface CreateTaskPayload {
  name: string
  frequency: number
  tags: Tag[]
}

interface CreateTaskConfigBuilderParams {
  token: string;
  payload: CreateTaskPayload
}

export interface CreateTagPayloadBuilderParams {
  name: string
  parentTagId: string
}

interface CreateTagPayload {
  name: string
  parent_tag: string
}

interface CreateTagConfigBuilderParams {
  token: string;
  payload: CreateTagPayload
}

export interface DeleteTasksPayloadBuilderParams {
  taskIds: number[]
}

type DeleteTasksPayload = number[]

interface DeleteTasksConfigBuilderParams {
  token: string;
  payload: DeleteTasksPayload
}

export interface DeleteEventsPayloadBuilderParams {
  eventIds: number[]
}

type DeleteEventsPayload = number[]

interface DeleteEventsConfigBuilderParams {
  token: string;
  payload: DeleteEventsPayload
}

export interface DeleteTagsPayloadBuilderParams {
  tagIds: number[]
}

type DeleteTagsPayload = number[]

interface DeleteTagsConfigBuilderParams {
  token: string;
  payload: DeleteTagsPayload
}

export interface UpdateTaskPayloadBuilderParams {
  id: string
  name: string
  frequency: number
  tags: Tag[]
}

interface UpdateTaskPayload {
  _id: string
  name: string
  frequency: number
  tags: Tag[]
}

interface UpdateTaskConfigBuilderParams {
  token: string;
  payload: UpdateTaskPayload
}

export interface CompleteTaskPayloadBuilderParams {
  taskId: string
  completionDate: string
}

interface CompleteTaskPayload {
  task: string
  date: string
}

interface CompleteTaskConfigBuilderParams {
  token: string;
  payload: CompleteTaskPayload
}

export interface UpdateEventPayloadBuilderParams {
  eventId: string
  taskId: string
  completionDate: string
}

interface UpdateEventPayload {
  _id: string
  task: string
  date: string
}

interface UpdateEventConfigBuilderParams {
  token: string;
  payload: UpdateEventPayload
}

export interface UpdateTagPayloadBuilderParams {
  tagId: string
  name: string
  parentTag: string
}

interface UpdateTagPayload {
  _id: string
  name: string
  parent_tag: string
}

interface UpdateTagConfigBuilderParams {
  token: string;
  payload: UpdateTagPayload
}

export interface ReadUserApiConfig {
  endpoint: string;
  payloadBuilder: (params: ReadUserPayloadBuilderParams) => ReadUserPayload;
  configBuilder: (params: ReadUserConfigBuilderParams) => RequestConfig;
}

export interface UpdateUserThemeApiConfig {
  endpoint: string;
  payloadBuilder: (params: UpdateUserThemePayloadBuilderParams) => UpdateUserThemePayload;
  configBuilder: (params: UpdateUserThemeConfigBuilderParams) => RequestConfig;
}

export interface ReadTasksApiConfig {
  endpoint: string;
  payloadBuilder?: never
  configBuilder: (params: ReadTasksConfigBuilderParams) => RequestConfig;
}

export interface ReadEventsApiConfig {
  endpoint: string;
  payloadBuilder?: never
  configBuilder: (params: ReadEventsConfigBuilderParams) => RequestConfig;
}

export interface ReadTagsApiConfig {
  endpoint: string;
  payloadBuilder?: never
  configBuilder: (params: ReadTagsConfigBuilderParams) => RequestConfig;
}

export interface CreateTaskApiConfig {
  endpoint: string;
  payloadBuilder: (params: CreateTaskPayloadBuilderParams) => CreateTaskPayload;
  configBuilder: (params: CreateTaskConfigBuilderParams) => RequestConfig;
}

export interface CreateTagApiConfig {
  endpoint: string;
  payloadBuilder: (params: CreateTagPayloadBuilderParams) => CreateTagPayload;
  configBuilder: (params: CreateTagConfigBuilderParams) => RequestConfig;
}

export interface DeleteTasksApiConfig {
  endpoint: string;
  payloadBuilder: (params: DeleteTasksPayloadBuilderParams) => DeleteTasksPayload;
  configBuilder: (params: DeleteTasksConfigBuilderParams) => RequestConfig;
}

export interface DeleteEventsApiConfig {
  endpoint: string;
  payloadBuilder: (params: DeleteEventsPayloadBuilderParams) => DeleteEventsPayload;
  configBuilder: (params: DeleteEventsConfigBuilderParams) => RequestConfig;
}

export interface DeleteTagsApiConfig {
  endpoint: string;
  payloadBuilder: (params: DeleteTagsPayloadBuilderParams) => DeleteTagsPayload;
  configBuilder: (params: DeleteTagsConfigBuilderParams) => RequestConfig;
}

export interface UpdateTaskApiConfig {
  endpoint: string;
  payloadBuilder: (params: UpdateTaskPayloadBuilderParams) => UpdateTaskPayload;
  configBuilder: (params: UpdateTaskConfigBuilderParams) => RequestConfig;
}

export interface CompleteTaskApiConfig {
  endpoint: string;
  payloadBuilder: (params: CompleteTaskPayloadBuilderParams) => CompleteTaskPayload;
  configBuilder: (params: CompleteTaskConfigBuilderParams) => RequestConfig;
}

export interface UpdateEventApiConfig {
  endpoint: string;
  payloadBuilder: (params: UpdateEventPayloadBuilderParams) => UpdateEventPayload;
  configBuilder: (params: UpdateEventConfigBuilderParams) => RequestConfig;
}

export interface UpdateTagApiConfig {
  endpoint: string;
  payloadBuilder: (params: UpdateTagPayloadBuilderParams) => UpdateTagPayload;
  configBuilder: (params: UpdateTagConfigBuilderParams) => RequestConfig;
}

export interface ApiConfigs {
  readUser: ReadUserApiConfig
  updateUserTheme: UpdateUserThemeApiConfig
  readTasks: ReadTasksApiConfig
  readEvents: ReadEventsApiConfig
  readTags: ReadTagsApiConfig
  createTask: CreateTaskApiConfig
  createTag: CreateTagApiConfig
  deleteTasks: DeleteTasksApiConfig
  deleteEvents: DeleteEventsApiConfig
  deleteTags: DeleteTagsApiConfig
  updateTask: UpdateTaskApiConfig
  completeTask: CompleteTaskApiConfig
  updateEvent: UpdateEventApiConfig
  updateTag: UpdateTagApiConfig
}

export interface SearchParams {
  limit?: string
  offset?: string
}