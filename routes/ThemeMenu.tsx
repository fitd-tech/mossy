import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { map, noop } from 'lodash';

import appStyles from '../appStyles';

function ThemeMenu({
  backgroundColor,
  textColor,
  useSystemDarkMode,
  colorScheme,
  storedAppleUserId,
  darkMode,
  theme,
  saveUserTheme,
  setUseSystemDarkMode,
  savingUserTheme,
  setDarkMode,
  themes,
  setTheme,
}) {
  return (
    <>
      <View style={{ ...appStyles.taskDetailsWrapper, ...backgroundColor }}>
        <Text style={{ ...appStyles.modalTitle, ...textColor }}>Theme</Text>
        <Text style={{ ...appStyles.themeSettingsHeading, ...textColor }}>
          Dark Mode
        </Text>
        <View style={appStyles.switchAndLabelWrapper}>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={useSystemDarkMode ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(e) => {
              const isSystemDarkMode = colorScheme === 'dark';
              const data = {
                storedAppleUserId,
                useSystemDarkMode: e,
                darkMode: e ? isSystemDarkMode : darkMode,
                theme: theme.id,
              };
              saveUserTheme(data);
              setUseSystemDarkMode(e);
            }}
            value={useSystemDarkMode}
            disabled={savingUserTheme}
          />
          <Text style={{ ...appStyles.switchLabel, ...textColor }}>
            Use system setting
          </Text>
        </View>
        <View style={appStyles.switchAndLabelWrapper}>
          <Switch
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={darkMode ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(e) => {
              const data = {
                storedAppleUserId,
                useSystemDarkMode,
                darkMode: e,
                theme: theme.id,
              };
              saveUserTheme(data);
              setDarkMode(e);
            }}
            value={darkMode}
            disabled={useSystemDarkMode || savingUserTheme}
          />
          <Text style={{ ...appStyles.switchLabel, ...textColor }}>
            Dark Mode
          </Text>
        </View>
        <Text style={{ ...appStyles.themeSettingsHeading, ...textColor }}>
          Color Theme
        </Text>
        <View style={appStyles.colorThemeWrapper}>
          {map(themes, (themeChoice) => {
            const selectedItemBorder = {
              borderWidth: 2,
              borderRadius: 5,
              borderColor: textColor,
            };
            let rowStyles;
            if (theme.id === themeChoice.id) {
              rowStyles = {
                ...appStyles.colorThemeRow,
                ...selectedItemBorder,
              };
            } else {
              rowStyles = appStyles.colorThemeRow;
            }
            return (
              <Pressable
                key={themeChoice.id}
                style={rowStyles}
                onPress={
                  savingUserTheme
                    ? noop
                    : () => {
                        const data = {
                          storedAppleUserId,
                          useSystemDarkMode,
                          darkMode,
                          theme: themeChoice.id,
                        };
                        saveUserTheme(data);
                        setTheme(themeChoice);
                      }
                }
              >
                <View
                  style={{
                    ...appStyles.colorThemeColor,
                    backgroundColor: themeChoice.color1,
                  }}
                />
                <View
                  style={{
                    ...appStyles.colorThemeColor,
                    backgroundColor: themeChoice.color2,
                  }}
                />
                <View
                  style={{
                    ...appStyles.colorThemeColor,
                    backgroundColor: themeChoice.color3,
                  }}
                />
                <View
                  style={{
                    ...appStyles.colorThemeColor,
                    backgroundColor: themeChoice.color4,
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}

export default ThemeMenu;
