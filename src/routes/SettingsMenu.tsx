import React from 'react';
import { Pressable, Text, View } from 'react-native';

import appStyles from 'src/appStyles.ts';
import { UserProfile } from 'src/types/types.ts';

interface SettingsMenuProps {
  backgroundColor: {
    backgroundColor: string;
  };
  textColor: {
    color: string;
  };
  userProfile: UserProfile;
  primaryButtonColor: {
    backgroundColor: string;
  };
  handleViewThemeSettings: () => void;
  appleUserId: string;
  adminAppleUserId: string;
  debugAddAdminTasks: () => void;
  debugDeleteAllAdminTasks: () => void;
  debugAddAdminEvents: () => void;
  debugDeleteAllAdminEvents: () => void;
  debugAddAdminTags: () => void;
  debugDeleteAllAdminTags: () => void;
}

function SettingsMenu({
  backgroundColor,
  textColor,
  userProfile,
  primaryButtonColor,
  handleViewThemeSettings,
  appleUserId,
  adminAppleUserId,
  debugAddAdminTasks,
  debugDeleteAllAdminTasks,
  debugAddAdminEvents,
  debugDeleteAllAdminEvents,
  debugAddAdminTags,
  debugDeleteAllAdminTags,
}: SettingsMenuProps) {
  return (
    <>
      <View style={{ ...appStyles.taskDetailsWrapper, ...backgroundColor }}>
        <Text style={{ ...appStyles.modalTitle, ...textColor }}>Settings</Text>
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
      {appleUserId === adminAppleUserId && (
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

export default SettingsMenu;
