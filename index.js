import React from 'react';

import { useState, useEffect } from 'react';
import { Alert, StyleSheet } from 'react-native';

import { WebView } from 'react-native-webview';
// import * as WebBrowser from 'expo-web-browser';
// import * as Linking from 'expo-linking';

const TR = (s) => s.replace(/^\/|\/$/gmi, '');
const URL = (url) => url.match(/^http[s]{0,1}[:]\/\//gmi) ? url : `${state.originURL}/${TR(s)}`;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ccc",
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webview: {
    marginTop: 20,
    backgroundColor: "#0ff",
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export const KAuth = (props) => {
  const { onLoginCallback, onBridgeHidden, originURL='', requireMode='login' } = props || {};

  const [state, setState] = useState({
    originURL: TR(originURL||"https://tom-dev.kokozi.co.kr"),
    requireMode,
    requestURL: `signin/email`,
    showWebView: true,
    text: "",
  });

  const getRequestURL = (type) => `${({
    'signin': ``,
    'signup': `/auth/user`,

  }[`${type}` || 'login'])}`;

  useEffect(() => {
      const requestURL = getRequestURL(requireMode);
      console.log("On Change Mode display: ", state.requireMode, requestURL);
      setState(prev => ({ ...prev, requireMode, requestURL }));
  }, [requireMode]);

  const onShouldLoadWithURL = (e) => {
    const url = e.url || "";
    //console.log("onShouldLoadWithURL: ", url);

    //const regex = /[\/]auth\/(success|failed)/gmi;
    const regex = /[\/]auth\/(back|success|failed)/gmi;

    if(url.match(regex)) {
      const paths = url.split("/");
      console.log("On Handle URL: -------------------- ", paths, paths[4]);

      if((paths[4]||"").startsWith('success')) {
        try {
          let data = url.split("?data=");
          data = decodeURIComponent(data[1]);
          data = JSON.parse(data);
          console.log("Data: ", data);

          const text = JSON.stringify(data, null, 2);
          Alert.alert(text);
          setState(prev => ({ ...prev, text }));

          if(typeof onLoginCallback === 'function') {
            setTimeout(async () => {
              await onLoginCallback(data);
            }, 5);
          }

        } catch(e) {
          console.log("Error Data: ", e);
        }
      }

      setState(prev => ({ ...prev, showWebView: false }));
      if(typeof onBridgeHidden === 'function') {
        setTimeout(async () => {
          await onBridgeHidden();
        }, 5);
      }

      return false;
    }

    return true;
  };

  return (
    <WebView
      style={styles.webview}
      source={{uri: URL(state.requestURL)}}
      startInLoadingState
      onShouldStartLoadWithRequest={onShouldLoadWithURL}
    />
  );
}
