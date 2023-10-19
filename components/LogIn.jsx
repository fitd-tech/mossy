import { useState, useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { randomUUID } from 'expo-crypto';
import { keys } from 'lodash';
import * as SecureStore from 'expo-secure-store';
import { Buffer } from 'buffer';

import { UserContext } from '../appContext';

const mossyBackendDevUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const authenticationState = 'Apple user sign-in';

export default function LogIn() {
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [credential, setCredential] = useState(null);
  const [nonce, setNonce] = useState(null);

  const {
    isAuthenticated,
    setIsAuthenticated,
    storedAppleUserId,
    setStoredAppleUserId,
    userProfile,
    setUserProfile,
    setStoredToken,
  } = useContext(UserContext);

  useEffect(() => {
    async function checkAvailability() {
      try {
        const availability = await AppleAuthentication.isAvailableAsync();
        setAppleAuthAvailable(true);
      } catch (err) {
        console.log('AppleAuthentication availability error', err);
      }
    }
    checkAvailability();
  }, []);

  useEffect(() => {
    async function getCredentialState() {
      const credentialState =
        await AppleAuthentication.getCredentialStateAsync(storedAppleUserId);
      if (credentialState === 1) {
        setIsAuthenticated(true);
      }
    }
    if (storedAppleUserId) {
      getCredentialState();
    }
  }, [storedAppleUserId]);

  useEffect(() => {
    async function verifyCredential() {
      const credentialValues = {
        authorization_code: credential.authorizationCode,
        identity_token: credential.identityToken,
        nonce,
        user: credential.user,
      };
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialValues),
      };
      const response = await fetch(`${mossyBackendDevUrl}api/log-in`, config);
      if (response.ok) {
        const serializedResponse = await response.json();
        SecureStore.setItemAsync(
          'mossyAppleUserId',
          serializedResponse.apple_user_id,
        );
        SecureStore.setItemAsync('mossyToken', serializedResponse.token);
        setUserProfile(serializedResponse);
        setIsAuthenticated(true);
      } else {
        const error = await response.text();
        console.log('Login error', error);
      }
    }
    // We can verify state here without decoding the JWT
    if (credential && credential.state === authenticationState) {
      verifyCredential();
    }
  }, [credential]);

  return (
    appleAuthAvailable && (
      <View style={styles.container}>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={styles.button}
          onPress={async () => {
            try {
              const _nonce = randomUUID();
              setNonce(_nonce);
              const credential = await AppleAuthentication.signInAsync({
                nonce: _nonce,
                state: authenticationState,
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              });
              setCredential(credential);
              // signed in
            } catch (e) {
              console.log('AppleAuthentication sign in error', e);
              if (e.code === 'ERR_REQUEST_CANCELED') {
                // handle that the user canceled the sign-in flow
              } else {
                // handle other errors
              }
            }
          }}
        />
      </View>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  button: {
    width: 200,
    height: 50,
  },
});
