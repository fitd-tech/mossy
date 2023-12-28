import React, { useCallback } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { map, noop } from 'lodash';

import appStyles from 'src/appStyles.ts';
import apiConfigs from 'src/apis/mossyBehind/index.ts';
import { Theme, UpdateUserThemePayloadBuilderParams } from 'src/types/types.ts';
import { handleResponse } from 'src/common/utilities/requests.ts';

interface ThemeMenuProps {
  backgroundColor: {
    backgroundColor: string;
  };
  textColor: {
    color: string;
  };
  useSystemDarkMode: boolean;
  colorScheme: string;
  appleUserId: string;
  darkMode: boolean;
  theme: Theme;
  setUseSystemDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  savingUserTheme: boolean;
  setSavingUserTheme: React.Dispatch<React.SetStateAction<boolean>>;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  themes: Theme[];
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  token: string;
}

function ThemeMenu({
  backgroundColor,
  textColor,
  useSystemDarkMode,
  colorScheme,
  appleUserId,
  darkMode,
  theme,
  setUseSystemDarkMode,
  savingUserTheme,
  setSavingUserTheme,
  setDarkMode,
  themes,
  setTheme,
  token,
}: ThemeMenuProps) {
  const saveUserTheme = useCallback(
    async (data) => {
      setSavingUserTheme(true);
      const params: UpdateUserThemePayloadBuilderParams = {
        appleUserId: data.appleUserId,
        shouldColorSchemeUseSystem: data.useSystemDarkMode,
        isColorSchemeDarkMode: data.darkMode,
        colorTheme: data.theme,
      };
      const requestBuilderOptions = {
        apiConfig: apiConfigs.updateUserTheme,
        params,
        token,
      };
      handleResponse({ requestBuilderOptions, setLoading: setSavingUserTheme });
    },
    [setSavingUserTheme, token],
  );

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
                appleUserId,
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
                appleUserId,
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
                          appleUserId,
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
