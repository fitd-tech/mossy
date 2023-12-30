import React, { useState, useEffect, useContext } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { UserContext } from 'src/appContext.ts';
import { handleResponse } from 'src/common/utilities/requests.ts';
import apiConfigs from 'src/apis/mossyBehind/index.ts';
import { LogInPayloadBuilderParams } from 'src/types/types.ts';

const appleClientId = process.env.EXPO_PUBLIC_APPLE_CLIENT_ID;
const appleRedirectUri = process.env.EXPO_PUBLIC_APPLE_REDIRECT_URI;
const authenticationState = 'Mossy Apple user sign-in';

export default function LogIn() {
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [credential, setCredential] = useState(null);
  const [nonce, setNonce] = useState(null);
  const [loadedAppleIdScript, setLoadedAppleIdScript] = useState(false);
  console.log('appleAuthAvailable', appleAuthAvailable);
  console.log('window', window);
  console.log('appleClientId', appleClientId);

  const {
    setIsAuthenticated,
    appleUserId,
    setAppleUserId,
    setUserProfile,
    setToken,
  } = useContext(UserContext);

  function handleScriptLoaded() {
    setLoadedAppleIdScript(true);
  }

  useEffect(() => {
    async function checkAvailability() {
      try {
        const availability = await AppleAuthentication.isAvailableAsync();
        if (availability) {
          setAppleAuthAvailable(true);
        }
      } catch (err) {
        console.log('AppleAuthentication availability error', err);
      }
    }
    checkAvailability();
    // Load a script dynamically
    // https://stackoverflow.com/questions/34424845/adding-script-tag-to-react-jsx
    if (Platform.OS === 'web') {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src =
        'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      // Call a function when the script has finished loading
      // https://stackoverflow.com/a/74420159
      script.onload = handleScriptLoaded;

      document.body.appendChild(script);
      // setTimeout(() => {
      // setLoadedAppleIdScript(true)
      // }, 1000)

      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && loadedAppleIdScript) {
      const _nonce = randomUUID();
      // This seems to just use localhost in development, which isn't valid
      setNonce(_nonce);
      const initOptions = {
        clientId: appleClientId,
        scope: 'name email',
        redirectURI: appleRedirectUri,
        state: authenticationState,
        nonce: _nonce,
        usePopup: true,
      };
      console.log('initOptions', initOptions);
      console.log('calling init');
      window['AppleID'].auth.init(initOptions);
    }
  }, [loadedAppleIdScript]);

  useEffect(() => {
    async function getCredentialState() {
      const credentialState =
        await AppleAuthentication.getCredentialStateAsync(appleUserId);
      if (credentialState === 1) {
        setIsAuthenticated(true);
      }
    }
    if (appleUserId) {
      getCredentialState();
    }
  }, [appleUserId, setIsAuthenticated]);

  useEffect(() => {
    async function verifyCredential() {
      const params: LogInPayloadBuilderParams = {
        authorizationCode: credential.authorizationCode,
        identityToken: credential.identityToken,
        nonce,
        userId: credential.user,
      };
      const requestBuilderOptions = {
        apiConfig: apiConfigs.logIn,
        params,
      };
      async function onSuccess(userProfile) {
        if (Platform.OS === 'web') {
          localStorage.setItem('mossyAppleUserId', userProfile.apple_user_id);
          localStorage.setItem('mossyToken', userProfile.token);
        } else {
          SecureStore.setItemAsync(
            'mossyAppleUserId',
            userProfile.apple_user_id,
          );
          SecureStore.setItemAsync('mossyToken', userProfile.token);
        }
        setAppleUserId(userProfile.apple_user_id);
        setToken(userProfile.token);
        setUserProfile(userProfile);
        setIsAuthenticated(true);
      }
      handleResponse({ requestBuilderOptions, onSuccess });
    }
    // We can verify state here without decoding the JWT
    if (credential && credential.state === authenticationState && nonce) {
      verifyCredential();
    }
  }, [
    credential,
    nonce,
    setAppleUserId,
    setIsAuthenticated,
    setToken,
    setUserProfile,
  ]);

  function renderOptions() {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.container}>
          <Text>web login</Text>
          {/* <AppleLogin
            clientId={appleClientId}
            scope="name email"
            redirectURI=''
          /> */}
          {/* {window['AppleID'].auth.init({
            clientId : '[CLIENT_ID]',
            scope : '[SCOPES]',
            redirectURI : '[REDIRECT_URI]',
            state : '[STATE]',
            nonce : '[NONCE]',
            usePopup : true
          })} */}
          <div
            id="appleid-signin"
            className="signin-button"
            data-color="black"
            data-border="true"
            data-type="sign-in"
          ></div>
        </View>
      );
    }
    if (appleAuthAvailable) {
      return (
        <View style={styles.container}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
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
      );
    }
    return <Text>No login options available</Text>;
  }

  return <>{renderOptions()}</>;
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
