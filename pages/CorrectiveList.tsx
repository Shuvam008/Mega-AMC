import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useState} from 'react';
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
  const sheet = route.params?.sheet?.toString() || '1';
  // const [headers, setHeaders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // const [data, setData] = useState<string[][]>([]);
  // const [filteredData, setFilteredData] = useState<string[][]>([]);

  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [filteredData, setFilteredData] = useState<string[][]>([]);


  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [currentSort, setCurrentSort] = useState('');
 
  const fetchData = async () => {
    try {
      // THE FIX: Only trigger the loading spinner if the list is completely empty.
      // If they are just coming back from the details page, data.length will be > 0,
      // so the spinner won't interrupt their experience!
      if (data.length === 0) {
        setLoading(true);
      }

      const sheetIdMap: Record<string, string> = {
        '1': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
        '2': '1qB7Ee0-VOV8pUSYVnhX1qeggnGg_c9ymO2zTqKRa7uQ',
        '3': '1RQQUlGEvNbE94SSudvaQx5PvS3c3ObgCsbTfqyEd69w',
      };

      let sheetId = sheetIdMap[sheet];

      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

      const response = await axios.get<string>(csvUrl);
      const csvText = response.data;

      const sheetData = csvText
        .split('\n')
        .map((row: string) => row.split(','));

      if (sheetData.length > 3) {
        setHeaders(sheetData[3]);
        setData(sheetData.slice(4));
        setFilteredData(
          [...sheetData.slice(4)].sort((a, b) => Number(b[0]) - Number(a[0])),
        );
        // [...filteredData].sort((a, b) => Number(b[0]) - Number(a[0]));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      // This will quietly turn off the loading state in the background
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const handleNavigateNewDocket = (sheetId: string) => {
    navigation.navigate('NewDocket',{sheet: sheetId});
  };

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

  //
  const handleSort = (type: string) => {
    setSortModalVisible(false); // Close modal
    setCurrentSort(type);

    const sortedData = [...filteredData].sort((a, b) => {
      if (type === 'newest') {
        // Assuming item[0] is Docket Number. Higher number = newer.
        return Number(b[0]) - Number(a[0]);
      } else if (type === 'oldest') {
        return Number(a[0]) - Number(b[0]);
      } else if (type === 'alpha') {
        // Assuming item[1] is the Location Name string
        // localeCompare alphabetizes strings safely
        return (a[1] || '').toString().localeCompare((b[1] || '').toString());
      }
      return 0;
    });

    setFilteredData(sortedData);
  };

  const isISODate = (value: string) => {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value);
  };

  const isISOTime = (value: string) => {
    return (
      typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
    );
  };

  const renderItem = ({item, index}: {item: string[]; index: number}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('CorrectiveDetails', {
          location: item,
          headers,
          index: Number(item[0]),
          sheet,
        })
      }>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Text style={styles.cardTitle}>
          {item[1].length > 20 ? item[1].substring(0, 17) + '...' : item[1]}
        </Text>
        <View
          style={{
            height: 20,
            width: 20,
            backgroundColor:
              item[2] &&
              item[3] &&
              item[4] &&
              item[5] &&
              item[6] &&
              item[7] &&
              item[8] &&
              item[9] &&
              item[10]
                ? 'green'
                : 'red',
            borderRadius: 50,
            // borderWidth: 1,
          }}></View>
      </View>
      <Text
        style={[
          styles.text,
          {fontSize: 20, fontWeight: 600, color: '#f36a30'},
        ]}>
        <Text style={[styles.label, {fontSize: 15}]}>Docket Number:</Text>{' '}
        {item[0]}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Problem:</Text> {item[3]}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Serial No:</Text> {item[4]}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Reported:</Text>{' '}
        {item[5]
          ? isISODate(item[5])
            ? dayjs(item[5]).format('DD/MM/YYYY')
            : item[5]
          : 'N/A'}
        {' - '}
        {item[6]
          ? isISOTime(item[6])
            ? dayjs(item[6]).format('HH:mm')
            : item[6]
          : 'N/A'}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Attended:</Text>{' '}
        {item[7]
          ? isISODate(item[7])
            ? dayjs(item[7]).format('DD/MM/YYYY')
            : item[7]
          : 'N/A'}
        {' - '}
        {item[8]
          ? isISOTime(item[8])
            ? dayjs(item[8]).format('HH:mm')
            : item[8]
          : 'N/A'}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Rectified:</Text>{' '}
        {item[9]
          ? isISODate(item[9])
            ? dayjs(item[9]).format('DD/MM/YYYY')
            : item[9]
          : 'N/A'}
        {' - '}
        {item[10]
          ? isISOTime(item[10])
            ? dayjs(item[10]).format('HH:mm')
            : item[10]
          : 'N/A'}
      </Text>
      <Text style={styles.text}>
        <Text style={styles.label}>Action:</Text> {item[11]}
      </Text>
    </TouchableOpacity>
  );
return (
  <View style={styles.container}>
   
      <View style={{flex: 1}}>
        {/* --- TOP BAR: SEARCH, SORT, AND ADD --- */}
        <View style={styles.addDocket}>
          <TextInput
            style={[styles.searchInput]} // flex: 1 ensures search bar shrinks to fit buttons
            placeholder="Search by location..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />

          {/* NEW SORT BUTTON */}
          <TouchableOpacity
            style={[
              styles.button,
              {marginLeft: 10, backgroundColor: '#f39c12'},
            ]} // Orange color to stand out
            onPress={() => setSortModalVisible(true)}>
            <Text style={[styles.buttonText, {color: 'white'}]}>⇅</Text>
          </TouchableOpacity>

          {/* YOUR EXISTING ADD BUTTON */}
          <TouchableOpacity
            style={[styles.button, {marginLeft: 10}]}
            onPress={() => handleNavigateNewDocket(sheet)}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* --- LIST DATA --- */}
        {loading ? (
          <View style={styles.spinnerWrapper}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text>Loading data...</Text>
          </View>
        ) : (
          <View>
            {filteredData.length > 0 ? (
              <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{paddingBottom: 50}}
              />
            ) : (
              <View style={{alignItems: 'center', marginTop: 50}}>
                <Text>No Data found</Text>
              </View>
            )}
          </View>
        )}
      </View>
    

    {/* --- NEW SORT MODAL --- */}
    <Modal
      visible={sortModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setSortModalVisible(false)}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={() => setSortModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sort By</Text>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSort('newest')}>
            <Text
              style={[
                styles.sortText,
                currentSort === 'newest' && styles.activeSortText,
              ]}>
              Newest First (Highest Docket)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSort('oldest')}>
            <Text
              style={[
                styles.sortText,
                currentSort === 'oldest' && styles.activeSortText,
              ]}>
              Oldest First (Lowest Docket)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => handleSort('alpha')}>
            <Text
              style={[
                styles.sortText,
                currentSort === 'alpha' && styles.activeSortText,
              ]}>
              Alphabetically (A - Z)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setSortModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  </View>
);
};

const styles = StyleSheet.create({
  addDocket: {
    display: 'flex',
    flexDirection: 'row',
    // paddingBottom: 160,
  },
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
    flex: 7,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    marginRight: 3,
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
  button: {
    flex: 1,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  //
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sortOption: {
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 16,
    color: '#555',
  },
  activeSortText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CorrectiveList;
