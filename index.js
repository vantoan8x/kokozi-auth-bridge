import React from 'react';

import { useState, useEffect } from 'react';
import { /*Alert,*/ StyleSheet } from 'react-native';

import { WebView } from 'react-native-webview';
// import * as WebBrowser from 'expo-web-browser';
// import * as Linking from 'expo-linking';

const TR = (s) => (s.replace(/^\/|\/$/gmi, ''));
const UData = (data) => ((data?.user?.id || data?.id || data?.token?.access_token) ? `?data=${encodeURIComponent(JSON.stringify(data).trim())}` : '');
const URL = (url, originURL, userData) => (url.match(/^http[s]{0,1}[:]\/\//gmi) ? url : `${TR(originURL)}/${TR(url)}${UData(userData)}`);

const styles = StyleSheet.create({
  webview: {
    marginTop: 20,
    backgroundColor: "#fff",
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});


// For the WebView, used to load kokozi-auth-frontend
export const KAuth = (props) => {
  const { onLoginCallback, onBridgeHidden, originURL='', requireMode='signin', style } = props || {};

  const [state, setState] = useState({
    originURL: TR(originURL||"https://tom-dev.kokozi.co.kr"),
    userData: {},
    requireMode,
    requestURL: `signin/email`,
    showWebView: true,
    text: "",
  });

  // You must fill more event and page to open, every page should open /auth/{back|success|failed} to exit the browser
  const getRequestURL = (type) => `${({
    'signin': ``, // Home page
    'profile': `/auth/info`, // User information page

  }[`${type}` || 'login'])}`;

  useEffect(() => {
      const requestURL = getRequestURL(requireMode);
      //console.log("On Change requireMode: ", requireMode, requestURL);
      setState(prev => ({ ...prev, requireMode, requestURL }));
  }, [requireMode]);

  const onShouldLoadWithURL = (e) => {
    const url = e?.url || "";
    //console.log("onShouldLoadWithURL: ", url);

    //const regex = /[\/]auth\/(success|failed)/gmi;
    const regex = /[\/]auth\/(back|success|failed)/gmi;

    if(url.startsWith(state?.originURL) && url.match(regex)) {
      const paths = url.split("/");
      //console.log("On Handle URL: -------------------- ", paths, paths[4]);

      if((paths[4]||"").startsWith('success')) {
        try {
          let data = url.split("?data=");
          data = decodeURIComponent(data[1]);
          data = JSON.parse(data);
          //console.log("Callback Data: ", data);

          const text = JSON.stringify(data, null, 2);
          //Alert.alert(text);
          setState(prev => ({ ...prev, text, userData: data }));

          if(typeof onLoginCallback === 'function') {
            setTimeout(async () => {
              await onLoginCallback(data);
            }, 5);
          }

        } catch(e) {
          console.log("Error Data: ", e);
        }
      }

      if(typeof onBridgeHidden === 'function') {
        setTimeout(async () => {
          await onBridgeHidden();
        }, 5);
      }

      setState(prev => ({ ...prev, showWebView: false }));
      return false;
    }

    return true;
  };

  return (
    <>
    {(state?.showWebView) ? (
      <WebView
        style={style || styles.webview}
        source={{uri: URL(state.requestURL, state.originURL, state.userData)}}
        startInLoadingState
        onShouldStartLoadWithRequest={onShouldLoadWithURL}
      />
    ) : null }
    </>
  );
}
