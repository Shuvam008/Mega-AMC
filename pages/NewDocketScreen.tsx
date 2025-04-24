import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, {useCallback, useState} from 'react';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

import Autocomplete from 'react-native-autocomplete-input';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {Picker} from '@react-native-picker/picker';
import { RootStackParamList } from './types';
import axios from 'axios';

const problems = [
    'PRINTER PROBLEM',
    'OUT OF ORDER',
    'TICKET CUTTING PROBLEM',
    'DISPLAY PROBLEM',
    'CARD READER PROBLEM',
    'POWER PROBLEM',
    'LOGIN PROBLEM',
    'OTHER',
  ];

type NewDocketProp = NativeStackNavigationProp<
  RootStackParamList,
  'CorrectiveList'
>;
type NewDocketRouteProp = RouteProp<RootStackParamList, 'CorrectiveList'>;
const NewDocketScreen = () => {
  const route = useRoute<NewDocketRouteProp>();
  const navigation = useNavigation<NewDocketProp>();
  const [serialNo, setSerialNo] = useState('');
  const sheet = route.params?.sheet?.toString() || '1';

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showPicker, setShowPicker] = useState(false);

  const [selectedTime, setSelectedTime] = useState<string>('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [query, setQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState(['']);

  const [selectedProblem, setSelectedProblem] = useState('');
  const [otherText, setOtherText] = useState('');

  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [stations, setStations] = useState(['']);
  
  const handleSubmit = async () => {
    if (
      !query ||
      !selectedProblem ||
      !serialNo ||
      !selectedDate ||
      !selectedTime
    ) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);

    const sheetIdMap: Record<string, string> = {
      '1': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
      '2': '1qB7Ee0-VOV8pUSYVnhX1qeggnGg_c9ymO2zTqKRa7uQ',
      '3': '1RQQUlGEvNbE94SSudvaQx5PvS3c3ObgCsbTfqyEd69w',
    };

    let sheetId = sheetIdMap[sheet];

    try {
      const values = JSON.stringify([
        query,
        selectedProblem == 'OTHER' ? otherText : selectedProblem,
        serialNo,
        selectedDate,
        selectedTime,
      ]);
      console.log(values);
      const res = await axios.post(
        'https://script.google.com/macros/s/AKfycbxGdqdvK5jkGPIurOQIoHkI6U5AzVNYXkwjF51fH4Kkcn5WuIgmfetTDNsi9j7fCSu97w/exec',
        values, // this is the JSON body
        {
          params: {
            sheetId: sheetId,
            action: 'appendRow',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      setQuery('');
      setSelectedProblem('');
      setSerialNo('');
      setSelectedDate('');
      setSelectedTime('');
      setOtherText('');
    } catch (err) {
      Alert.alert('Error', 'Failed to submit docket');
      console.log(err);
    } finally {
      Alert.alert('Success', 'Docket submitted successfully');
      setLoading(false); // 👉 hide loader
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'set' && selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();

      const formattedDate = `${day}/${month}/${year}`;
      setSelectedDate(formattedDate); // assuming you're using one date state
    }
    setShowPicker(false);
  };
  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedTimeParam?: Date,
  ) => {
    if (event.type === 'set' && selectedTimeParam) {
      const hours = selectedTimeParam.getHours().toString().padStart(2, '0');
      const minutes = selectedTimeParam.getMinutes().toString().padStart(2, '0');
      setSelectedTime(`${hours}:${minutes}`);
    }
    setShowTimePicker(false);
  };
  const handleSearch = (text: string) => {
    setQuery(text);
    const filtered = stations.filter(station =>
      station.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredStations(filtered);
  };

  const handleSelect = (station: string) => {
    setQuery(station);
    setFilteredStations([]);
  };

  const fetchData = async () => {
    try {
      setLoading1(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const sheetIdMap: Record<string, string> = {
        '1': '1YjI3yILyl_4oPcSY1cUQwobdm4TTgrEf84qTT7GXKHQ',
        '2': '153ll-RPxGW4hKbwKrQR3kFkB8EujHOrljYHfvwezaQA ',
        '3': '1_83jCyTNUCsOBENKFIC367y5l-CPG40vKZraX1hu7gc',
      };

      let sheetId = sheetIdMap[sheet];

      const response = await axios.get(
        `https://script.google.com/macros/s/AKfycbz8XVVJBi6ZBHPe_9-muGM9pJkJIAOCGaFjjwsrs5n38WymPEtGR4JQoh8edWaDYf93cA/exec?sheet=${sheetId}`,
      );
      const sheetData = response.data;
      console.log(sheetData);
      
      setStations(sheetData.slice(1).map((row: String[]) => row[1]));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading1(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchData(); // Refresh data every time the screen is focused
    }, []),
  );
  return (
    <View style={styles.container}>
      {/* <Text style={styles.heading}>New Docket Entry</Text> */}
      <Modal transparent={true} visible={loading}>
        <View style={styles.loadingContainer}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Submitting...</Text>
          </View>
        </View>
      </Modal>
      {loading1 ? (
        <View style={styles.spinnerWrapper}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text>Loading data...</Text>
        </View>
      ) : (
        <>
          {sheet == '1' ? (
            <Text style={styles.locationTitle}>HOWRAH DIVISION</Text>
          ) : sheet == '2' ? (
            <Text style={styles.locationTitle}>SEALDAH DIVISION</Text>
          ) : (
            <Text style={styles.locationTitle}>METRO DIVISION</Text>
          )}
          <View style={styles.autocompleteContainer}>
            <Autocomplete
              data={filteredStations}
              defaultValue={query}
              onChangeText={handleSearch}
              placeholder="Station (e.g. HOWRAH)"
              placeholderTextColor="#333"
              hideResults={filteredStations.length === 0 || query.trim() === ''}
              flatListProps={{
                keyExtractor: (_, idx) => idx.toString(),
                renderItem: ({item}) => (
                  <TouchableOpacity onPress={() => handleSelect(item)}>
                    <Text style={styles.itemText}>{item}</Text>
                  </TouchableOpacity>
                ),
                style: styles.list,
              }}
              inputContainerStyle={styles.inputContainer}
              listContainerStyle={styles.listContainer}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Serial Number"
            placeholderTextColor="#333"
            value={serialNo}
            onChangeText={setSerialNo}
          />

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedProblem}
              onValueChange={itemValue => setSelectedProblem(itemValue)}
              style={styles.picker}>
              <Picker.Item label="Select a fault" value="" color="#333" />
              {problems.map((problem, idx) => (
                <Picker.Item
                  label={problem}
                  value={problem}
                  key={idx}
                  color="#333"
                />
              ))}
              {/* <Picker.Item label="Other" value="OTHER" color="#333" /> */}
            </Picker>
          </View>

          {selectedProblem === 'OTHER' && (
            <TextInput
              style={styles.input}
              placeholder="Describe your issue"
              placeholderTextColor="#333"
              value={otherText}
              onChangeText={setOtherText}
            />
          )}

          {/* <TextInput
        style={styles.input}
        placeholder="Date (e.g. 30.01.2025)"
        value={date}
        onChangeText={setDate}
      /> */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowPicker(true)}>
            <Text style={styles.dateButtonText}>
              {selectedDate || 'Select a date'}
            </Text>
          </TouchableOpacity>

          {showPicker && (
            <DateTimePicker
              value={selectedDate ? new Date(selectedDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
            />
          )}

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowTimePicker(true)}>
            <Text style={styles.dateButtonText}>
              {selectedTime || 'Select time'}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={false} // change to true if you want 24-hour format
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}
          <View style={{flex: 1}}></View>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Docket</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default NewDocketScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  spinnerWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2c3e50',
    textAlign: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  dateButton: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  autocompleteContainer: {
    borderColor: '#ccc',
    borderRadius: 10,
    height: 60,
    marginBottom: 10,
    position: 'relative',
    zIndex: 10,
  },

  inputContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    // padding: 10,
    // paddingLeft:2,
    // paddingRight:0,
    // marginBottom: 40,
    // fontSize: 16,
    // height:30
  },

  listContainer: {
    position: 'absolute',
    top: 42, // position below the input
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 20,
    borderWidth: 0,
  },

  list: {
    maxHeight: 150,
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ccc',
  },

  itemText: {
    padding: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 10,
    overflow: 'hidden', // Important for borderRadius to apply
  },

  picker: {
    color: '#333',
    height: 50,
    width: '100%',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
});
