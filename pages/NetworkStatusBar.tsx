import {Platform, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';

import NetInfo from '@react-native-community/netinfo';

const NetworkStatusBar: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <View style={styles.bar}>
      <Text style={styles.text}>No Internet Connection</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'red',
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // status bar padding
    paddingBottom: 10,
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 9999,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NetworkStatusBar;
