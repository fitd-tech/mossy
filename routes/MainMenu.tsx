import React from 'react';
import { Pressable, Text, View } from 'react-native';

import appStyles from 'appStyles.ts';

interface MainMenuProps {
  viewType: string;
  primaryButtonColor: {
    backgroundColor: string;
  };
  secondaryButtonColor: {
    backgroundColor: string;
  };
  backgroundColor: {
    backgroundColor: string;
  };
  textColor: {
    color: string;
  };
  handleViewTasks: () => void;
  handleViewEvents: () => void;
  handleViewTags: () => void;
  handleViewSettings: () => void;
  handleLogOut: () => void;
}

function MainMenu({
  viewType,
  primaryButtonColor,
  secondaryButtonColor,
  backgroundColor,
  textColor,
  handleViewTasks,
  handleViewEvents,
  handleViewTags,
  handleViewSettings,
  handleLogOut,
}: MainMenuProps) {
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
      <Pressable style={generateButtonStyles('tags')} onPress={handleViewTags}>
        <Text style={appStyles.buttonText}>Tags</Text>
      </Pressable>
      <Pressable
        style={[appStyles.button, primaryButtonColor]}
        onPress={handleViewSettings}
      >
        <Text style={appStyles.buttonText}>Settings</Text>
      </Pressable>
      <Pressable
        style={[appStyles.button, secondaryButtonColor, { marginBottom: 30 }]}
        onPress={handleLogOut}
      >
        <Text style={appStyles.buttonText}>Log Out</Text>
      </Pressable>
    </>
  );
}

export default MainMenu;
