import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from './types';
import axios from 'axios';
import dayjs from 'dayjs';

type CorrectiveListScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  'CorrectiveList'
>;
type CorrectiveListRouteProp = RouteProp<RootStackParamList, 'CorrectiveList'>;
const CorrectiveList = () => {
  const route = useRoute<CorrectiveListRouteProp>();
  const navigation = useNavigation<CorrectiveListScreenProp>();
  const sheet = route.params?.sheet?.toString() || '0';
  const [headers, setHeaders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState<string[][]>([]);
  const [filteredData, setFilteredData] = useState<string[][]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const sheetIdMap: Record<string, string> = {
        '1': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
        '2': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
        '3': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
      };

      let sheetId = sheetIdMap[sheet];

      const response = await axios.get(
        `https://script.google.com/macros/s/AKfycbyOvGrV0yspKQYtJm1ROuI1OQCJmBvpNaSTzCE3nTzp7wXftjupEWd0TV5gYeOyqWGBEA/exec?sheet=${sheetId}`,
      );
      const sheetData = response.data;
      setHeaders(sheetData[3]);
      setData(sheetData.slice(4));
      setFilteredData(sheetData.slice(4));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData(); // Refresh data every time the screen is focused
    }, []),
  );

  const calculateProgress = (row: string[]) => {
    let filled = 0;
    if (row[2]) filled++;
    if (row[3]) filled++;
    if (row[4]) filled++;
    return Math.round((filled / 3) * 100);
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => {
        subscription.remove(); // ✅ correct way to remove
      };
    }, [navigation]),
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    const filtered = data.filter(row =>
      row.some(cell => String(cell).toLowerCase().includes(text.toLowerCase())),
    );
    setFilteredData(filtered);
  };

//   const renderItem = ({item, index}: {item: string[]; index: number}) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         navigation.navigate('LocationDetails', {
//           location: item,
//           headers,
//           index: Number(item[0]),
//           sheet,
//         })
//       }>
//       <View style={styles.cardHeader}>
//         <Text style={styles.cardTitle}>{item[1]}</Text>
//         {/* <View style={styles.progressBar}>
//           <View
//             style={[
//               styles.progressFill,
//               {width: `${calculateProgress(item)}%`},
//             ]}
//           />
//         </View> */}
//       </View>
//       <View style={styles.metrics}>
//         <Text>
//           <Text style={styles.bold}>M1:</Text>{' '}
//           {item[2] ? dayjs(item[2]).format('DD/MM/YYYY') : 'N/A'}
//         </Text>
//         <Text>
//           <Text style={styles.bold}>M2:</Text>{' '}
//           {item[3] ? dayjs(item[3]).format('DD/MM/YYYY') : 'N/A'}
//         </Text>
//         <Text>
//           <Text style={styles.bold}>M3:</Text>{' '}
//           {item[4] ? dayjs(item[4]).format('DD/MM/YYYY') : 'N/A'}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

const renderItem = ({item, index}: {item: string[]; index: number}) => (
  <TouchableOpacity
    // style={styles.card}
    onPress={() =>
      navigation.navigate('CorrectiveDetails', {
        location: item,
        headers,
        index: Number(item[0]),
        sheet,
      })
    }>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item[1]}</Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Problem:</Text> {item[2]}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Serial No:</Text> {item[3]}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Reported:</Text> {item[4]} - {item[5]}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Attended:</Text> {item[8]} - {item[9]}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Rectified:</Text> {item[6]} - {item[7]}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Action:</Text> {item[10]}
      </Text>
    </View>
  </TouchableOpacity>
);
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.spinnerWrapper}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading data...</Text>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  spinnerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  progressBar: {
    width: 100,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
  },
  metrics: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    gap: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default CorrectiveList;
