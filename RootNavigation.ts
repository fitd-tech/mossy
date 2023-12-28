import { createNavigationContainerRef } from '@react-navigation/native';

// This defines empty parameters for the routes - we can update using the below documentation
// https://reactnavigation.org/docs/typescript/#annotating-usenavigation
interface RootStackParamList {
  tasks: object;
  events: object;
  tags: object;
}
type NavigateParams = Record<string, string>;

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(
  name: 'tasks' | 'events' | 'tags',
  params?: NavigateParams,
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
