import { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export interface UserProfile {
  email: string;
}

export interface Theme {
  id: number;
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

export interface Task {
  time_since_latest_event: number;
  moss: number;
  latest_event_date: string;
  frequency: number;
}

export interface Event {
  task: string;
}

export interface TagId {
  $oid: string;
}

export interface Tag {
  _id: TagId;
  name: string;
}

interface RequestConfig {
  method: string;
  headers: {
    'Content-Type': string;
    Authorization?: string;
  };
  body?: string;
}

export interface LogInPayloadBuilderParams {
  authorizationCode: string;
  identityToken: string;
  nonce: string;
  // userId: string;
  source?: string;
}

interface LogInPayload {
  authorization_code: string;
  identity_token: string;
  nonce: string;
  // user: string;
  source?: string;
}

interface LogInConfigBuilderParams {
  payload: LogInPayload;
}

export interface ReadUserPayloadBuilderParams {
  appleUserId: string;
}

interface ReadUserPayload {
  apple_user_id: string;
}

interface ReadUserConfigBuilderParams {
  token: string;
  payload: ReadUserPayload;
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
  payload: UpdateUserThemePayload;
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
  name: string;
  frequency: number;
  tagIds: Tag[];
}

interface CreateTaskPayload {
  name: string;
  frequency: number;
  tags: Tag[];
}

interface CreateTaskConfigBuilderParams {
  token: string;
  payload: CreateTaskPayload;
}

export interface CreateTagPayloadBuilderParams {
  name: string;
  description: string;
  parentTagId: string;
}

interface CreateTagPayload {
  name: string;
  description: string;
  parent_tag: string;
}

interface CreateTagConfigBuilderParams {
  token: string;
  payload: CreateTagPayload;
}

export interface DeleteTasksPayloadBuilderParams {
  taskIds: number[];
}

type DeleteTasksPayload = number[];

interface DeleteTasksConfigBuilderParams {
  token: string;
  payload: DeleteTasksPayload;
}

export interface DeleteEventsPayloadBuilderParams {
  eventIds: number[];
}

type DeleteEventsPayload = number[];

interface DeleteEventsConfigBuilderParams {
  token: string;
  payload: DeleteEventsPayload;
}

export interface DeleteTagsPayloadBuilderParams {
  tagIds: number[];
}

type DeleteTagsPayload = number[];

interface DeleteTagsConfigBuilderParams {
  token: string;
  payload: DeleteTagsPayload;
}

export interface UpdateTaskPayloadBuilderParams {
  id: string;
  name: string;
  frequency: number;
  tagIds: Tag[];
}

interface UpdateTaskPayload {
  _id: string;
  name: string;
  frequency: number;
  tags: Tag[];
}

interface UpdateTaskConfigBuilderParams {
  token: string;
  payload: UpdateTaskPayload;
}

export interface CompleteTaskPayloadBuilderParams {
  taskId: string;
  completionDate: Date;
}

interface CompleteTaskPayload {
  task: string;
  date: Date;
}

interface CompleteTaskConfigBuilderParams {
  token: string;
  payload: CompleteTaskPayload;
}

export interface UpdateEventPayloadBuilderParams {
  eventId: string;
  completionDate: Date;
}

interface UpdateEventPayload {
  _id: string;
  date: Date;
}

interface UpdateEventConfigBuilderParams {
  token: string;
  payload: UpdateEventPayload;
}

export interface UpdateTagPayloadBuilderParams {
  tagId: string;
  name: string;
  description: string;
  parentTagId: string;
}

interface UpdateTagPayload {
  _id: string;
  name: string;
  description: string;
  parent_tag: string;
}

interface UpdateTagConfigBuilderParams {
  token: string;
  payload: UpdateTagPayload;
}

export interface DebugCreateTasksPayloadBuilderParams {
  quantity: number;
}

interface DebugCreateTasksPayload {
  quantity: number;
}

interface DebugCreateTasksConfigBuilderParams {
  token: string;
  payload: DebugCreateTasksPayload;
}

interface DebugDeleteAllTasksConfigBuilderParams {
  token: string;
}

export interface DebugCreateEventsPayloadBuilderParams {
  quantity: number;
}

interface DebugCreateEventsPayload {
  quantity: number;
}

interface DebugCreateEventsConfigBuilderParams {
  token: string;
  payload: DebugCreateEventsPayload;
}

interface DebugDeleteAllEventsConfigBuilderParams {
  token: string;
}

export interface DebugCreateTagsPayloadBuilderParams {
  quantity: number;
}

interface DebugCreateTagsPayload {
  quantity: number;
}

interface DebugCreateTagsConfigBuilderParams {
  token: string;
  payload: DebugCreateTagsPayload;
}

interface DebugDeleteAllTagsConfigBuilderParams {
  token: string;
}

export type PayloadBuilderParams =
  | LogInPayloadBuilderParams
  | ReadUserPayloadBuilderParams
  | UpdateUserThemePayloadBuilderParams
  | CreateTaskPayloadBuilderParams
  | CreateTagPayloadBuilderParams
  | DeleteTasksPayloadBuilderParams
  | DeleteEventsPayloadBuilderParams
  | DeleteTagsPayloadBuilderParams
  | UpdateTaskPayloadBuilderParams
  | CompleteTaskPayloadBuilderParams
  | UpdateEventPayloadBuilderParams
  | UpdateTagPayloadBuilderParams
  | DebugCreateTasksPayloadBuilderParams
  | DebugCreateEventsPayloadBuilderParams
  | DebugCreateTagsPayloadBuilderParams;

export interface LogInApiConfig {
  endpoint: string;
  payloadBuilder: (params: LogInPayloadBuilderParams) => LogInPayload;
  configBuilder: (params: LogInConfigBuilderParams) => RequestConfig;
}
export interface ReadUserApiConfig {
  endpoint: string;
  payloadBuilder: (params: ReadUserPayloadBuilderParams) => ReadUserPayload;
  configBuilder: (params: ReadUserConfigBuilderParams) => RequestConfig;
}

export interface UpdateUserThemeApiConfig {
  endpoint: string;
  payloadBuilder: (
    params: UpdateUserThemePayloadBuilderParams,
  ) => UpdateUserThemePayload;
  configBuilder: (params: UpdateUserThemeConfigBuilderParams) => RequestConfig;
}

export interface ReadTasksApiConfig {
  endpoint: string;
  payloadBuilder?: never;
  configBuilder: (params: ReadTasksConfigBuilderParams) => RequestConfig;
}

export interface ReadEventsApiConfig {
  endpoint: string;
  payloadBuilder?: never;
  configBuilder: (params: ReadEventsConfigBuilderParams) => RequestConfig;
}

export interface ReadTagsApiConfig {
  endpoint: string;
  payloadBuilder?: never;
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
  payloadBuilder: (
    params: DeleteTasksPayloadBuilderParams,
  ) => DeleteTasksPayload;
  configBuilder: (params: DeleteTasksConfigBuilderParams) => RequestConfig;
}

export interface DeleteEventsApiConfig {
  endpoint: string;
  payloadBuilder: (
    params: DeleteEventsPayloadBuilderParams,
  ) => DeleteEventsPayload;
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
  payloadBuilder: (
    params: CompleteTaskPayloadBuilderParams,
  ) => CompleteTaskPayload;
  configBuilder: (params: CompleteTaskConfigBuilderParams) => RequestConfig;
}

export interface UpdateEventApiConfig {
  endpoint: string;
  payloadBuilder: (
    params: UpdateEventPayloadBuilderParams,
  ) => UpdateEventPayload;
  configBuilder: (params: UpdateEventConfigBuilderParams) => RequestConfig;
}

export interface UpdateTagApiConfig {
  endpoint: string;
  payloadBuilder: (params: UpdateTagPayloadBuilderParams) => UpdateTagPayload;
  configBuilder: (params: UpdateTagConfigBuilderParams) => RequestConfig;
}

export interface DebugCreateTasksApiConfig {
  endpoint: string;
  payloadBuilder: (
    params: DebugCreateTasksPayloadBuilderParams,
  ) => DebugCreateTasksPayload;
  configBuilder: (params: DebugCreateTasksConfigBuilderParams) => RequestConfig;
}

export interface DebugDeleteAllTasksApiConfig {
  endpoint: string;
  payloadBuilder?: never;
  configBuilder: (
    params: DebugDeleteAllTasksConfigBuilderParams,
  ) => RequestConfig;
}

export interface DebugCreateEventsApiConfig {
  endpoint: string;
  payloadBuilder: (
    params: DebugCreateEventsPayloadBuilderParams,
  ) => DebugCreateEventsPayload;
  configBuilder: (
    params: DebugCreateEventsConfigBuilderParams,
  ) => RequestConfig;
}

export interface DebugDeleteAllEventsApiConfig {
  endpoint: string;
  payloadBuilder?: never;
  configBuilder: (
    params: DebugDeleteAllEventsConfigBuilderParams,
  ) => RequestConfig;
}

export interface DebugCreateTagsApiConfig {
  endpoint: string;
  payloadBuilder: (
    params: DebugCreateTagsPayloadBuilderParams,
  ) => DebugCreateTagsPayload;
  configBuilder: (params: DebugCreateTagsConfigBuilderParams) => RequestConfig;
}

export interface DebugDeleteAllTagsApiConfig {
  endpoint: string;
  payloadBuilder?: never;
  configBuilder: (
    params: DebugDeleteAllTagsConfigBuilderParams,
  ) => RequestConfig;
}

export interface ApiConfigs {
  logIn: LogInApiConfig;
  readUser: ReadUserApiConfig;
  updateUserTheme: UpdateUserThemeApiConfig;
  readTasks: ReadTasksApiConfig;
  readEvents: ReadEventsApiConfig;
  readTags: ReadTagsApiConfig;
  createTask: CreateTaskApiConfig;
  createTag: CreateTagApiConfig;
  deleteTasks: DeleteTasksApiConfig;
  deleteEvents: DeleteEventsApiConfig;
  deleteTags: DeleteTagsApiConfig;
  updateTask: UpdateTaskApiConfig;
  completeTask: CompleteTaskApiConfig;
  updateEvent: UpdateEventApiConfig;
  updateTag: UpdateTagApiConfig;
  debugCreateTasks: DebugCreateTasksApiConfig;
  debugDeleteAllTasks: DebugDeleteAllTasksApiConfig;
  debugCreateEvents: DebugCreateEventsApiConfig;
  debugDeleteAllEvents: DebugDeleteAllEventsApiConfig;
  debugCreateTags: DebugCreateTagsApiConfig;
  debugDeleteAllTags: DebugDeleteAllTagsApiConfig;
}

export type SearchParams = Record<string, string>;

export interface RequestBuilderParams {
  apiConfig: ApiConfigs[keyof ApiConfigs];
  params?: PayloadBuilderParams;
  searchParams?: SearchParams;
  token?: string;
}

export type HandleChangeDate = (
  e: DateTimePickerEvent,
  date: Date,
  setFunc: React.Dispatch<React.SetStateAction<Date>>,
) => void;

export type HandleChangeField = (
  value: string,
  setFunc: React.Dispatch<React.SetStateAction<string>>,
) => void;

export type HandleTagSelectCardPress = (currentId: string) => void;
