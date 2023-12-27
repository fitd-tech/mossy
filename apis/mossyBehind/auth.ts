import { find } from 'lodash';

const mossyBackendDevUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

export async function readUser({
  appleUserId,
  token,
  setUserProfile,
  setUseSystemDarkMode,
  setDarkMode,
  setTheme,
  themes,
  clearUserData,
}) {
  const data = {
    apple_user_id: appleUserId,
  };
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  };
  const response = await fetch(`${mossyBackendDevUrl}api/user`, config);
  if (response.ok) {
    const serializedUser = await response.json();
    setUserProfile(serializedUser);
    setUseSystemDarkMode(serializedUser.should_color_scheme_use_system);
    setDarkMode(serializedUser.is_color_scheme_dark_mode);
    setTheme(find(themes, { id: serializedUser.color_theme }));
  } else {
    clearUserData();
  }
}
