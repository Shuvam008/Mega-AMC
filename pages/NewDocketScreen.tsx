import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, {useCallback, useEffect, useState} from 'react';
import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

import Autocomplete from 'react-native-autocomplete-input';
import DeviceInfo from 'react-native-device-info';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
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
  const colorScheme = useColorScheme();
  const sheet = route.params?.sheet?.toString() || '1';

  // const [showPicker, setShowPicker] = useState(false);
  // const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCreationDatePicker, setShowCreationDatePicker] = useState(false);
  const [showCreationTimePicker, setShowCreationTimePicker] = useState(false);

  const [showAttendDatePicker, setShowAttendDatePicker] = useState(false);
  const [showAttendTimePicker, setShowAttendTimePicker] = useState(false);

  const [showRectificationDatePicker, setShowRectificationDatePicker] = useState(false);
  const [showRectificationTimePicker, setShowRectificationTimePicker] = useState(false);


  const [serialNo, setSerialNo] = useState('');
  const [selectedCreationDate, setSelectedCreationDate] = useState<string>('');
  const [selectedCreationTime, setSelectedCreationTime] = useState<string>('');
  const [selectedProblem, setSelectedProblem] = useState('');
  const [otherText, setOtherText] = useState('');
  const [docketNumber, setDocketNumber] = useState('');
  const [query, setQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState(['']);

  const [attendDate, setAttendDate] = useState('');
  const [attendTime, setAttendTime] = useState('');

  const [rectificationDate, setrectificationDate] = useState('');
  const [rectificationTime, setrectificationTime] = useState('');
  const [remarks, setRemarks] = useState('');

  // Toggle switches
  const [showAttend, setShowAttend] = useState(false);
  const [showRectification, setShowRectification] = useState(false);

   // Enable switch logic
  const [canEnableAttendSwitch, setCanEnableAttendSwitch] = useState(false);
  const [canEnableRectificationSwitch, setCanEnableRectificationSwitch] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [stations, setStations] = useState(['']);


  const [submitStation, setSubmitStation] = useState('');
  const [creationDateObj, setCreationDateObj] = useState<Date | null>(null);
  const [attendDateObj, setAttendDateObj] = useState<Date | null>(null);


  useEffect(() => {
      if (
        submitStation &&
        selectedProblem &&
        serialNo &&
        selectedCreationDate &&
        selectedCreationTime &&
        docketNumber
      ) {
        setCanEnableAttendSwitch(true);
      } else {
        setAttendDate('');
        setAttendTime('');
        setCanEnableAttendSwitch(false);
        setShowAttend(false);
      }
    }, [
      submitStation,
      docketNumber,
      selectedProblem,
      serialNo,
      selectedCreationDate,
      selectedCreationTime,
      ,
    ]);

  useEffect(() => {
    if (canEnableAttendSwitch && attendDate && attendTime) {
      setCanEnableRectificationSwitch(true);
    } else {
      setRemarks('');
      setrectificationDate('');
      setrectificationTime('');
      setCanEnableRectificationSwitch(false);
      setShowRectification(false);
    }
    
  }, [attendDate, attendTime]);


  useEffect(() => {
    if (false == showRectification) {
      setRemarks('');
      setrectificationDate('');
      setrectificationTime('');
    }
    if (false == showAttend) {
      setAttendDate('');
      setAttendTime('');
    }
  }, [showAttend, showRectification]);
    

  const handleSubmit = async () => {
    if (
      !submitStation ||
      !selectedProblem ||
      !serialNo ||
      !selectedCreationDate ||
      !selectedCreationTime
    ) {
      Alert.alert('Error', 'Please fill all fields');
      if (!submitStation) {
         Alert.alert('Error', 'Please fill Station Name');
      }
      return;
    }
    if (showAttend) {
      if (
          !attendDate ||
          !attendTime
        ) {
          Alert.alert('Error', 'Please fill all fields');
          return;
      }
    }

    if (showRectification) {
      if (!rectificationDate || !rectificationTime || !remarks) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }
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
        submitStation,
        docketNumber,
        selectedProblem == 'OTHER' ? otherText : selectedProblem,
        serialNo,
        selectedCreationDate,
        selectedCreationTime,
        attendDate,
        attendTime,
        rectificationDate,
        rectificationTime,
        remarks,
        await DeviceInfo.getDeviceName(),
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
      setSubmitStation('');
      setDocketNumber('');
      setSelectedProblem('');
      setSerialNo('');
      setSelectedCreationDate('');
      setSelectedCreationTime('');
      setOtherText('');
    } catch (err) {
      Alert.alert('Error', 'Docket Submit failed');
      console.log(err);
    } finally {
      const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
          Alert.alert(
            'No Internet',
            'Please connect to the internet before submitting.',
          );
        }else{
            Alert.alert('Success', 'Docket submitted successfully');
        }
      
      setLoading(false); // 👉 hide loader
    }
  };

const handleDateChange = (
  event: DateTimePickerEvent,
  selectedDate?: Date,
  setter?: (val: string) => void,
  closePicker?: () => void,
  type?: 'creation' | 'attend' | 'rectify',
) => {
  if (event.type === 'set' && selectedDate && setter) {
    const day = selectedDate.getDate().toString().padStart(2, '0');
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = selectedDate.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;

    if (type === 'creation') {
      setCreationDateObj(selectedDate);
      setAttendDate(''); // reset attend if creation changes
      setAttendDateObj(null);
      setrectificationDate('');
    }

    if (type === 'attend') {
      setAttendDateObj(selectedDate);
      setrectificationDate('');
    }

    setter(formattedDate);
  }
  if (closePicker) closePicker();
};

const handleTimeChange = (
  event: DateTimePickerEvent,
  selectedTime?: Date,
  setter?: (val: string) => void,
  closePicker?: () => void,
) => {
  if (event.type === 'set' && selectedTime && setter) {
    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');

    const formattedTime = `${hours}:${minutes}`;
    setter(formattedTime);
  }
  if (closePicker) closePicker();
};

  const handleSearch = (text: string) => {
    setQuery(text);
    setSubmitStation('');
    const filtered = stations.filter(station =>
      station.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredStations(filtered);
  };

  const handleSelect = (station: string) => {
    setQuery(station);
    setSubmitStation(station);
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
    <FlatList
      style={styles.container}
      ListHeaderComponent={
        <>
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
                  hideResults={
                    filteredStations.length === 0 || query.trim() === ''
                  }
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
                placeholder="Docket Number"
                placeholderTextColor="#333"
                value={docketNumber}
                onChangeText={setDocketNumber}
              />
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
                  <Picker.Item
                    label="Select a fault"
                    value=""
                    color={colorScheme === 'dark' ? '#fff' : '#333'}
                  />
                  {problems.map((problem, idx) => (
                    <Picker.Item
                      label={problem}
                      value={problem}
                      key={idx}
                      color={colorScheme === 'dark' ? '#fff' : '#333'}
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

              {/* Docket Creation Container */}
              <View>
                <Text
                  style={{marginBottom: 5, fontSize: 14, fontWeight: 'bold'}}>
                  Docket Creation Date / Time
                </Text>

                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowCreationDatePicker(true)}>
                  <Text style={styles.dateButtonText}>
                    {selectedCreationDate || 'Select a date'}
                  </Text>
                </TouchableOpacity>

                {showCreationDatePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={(event, date) =>
                      handleDateChange(
                        event,
                        date,
                        setSelectedCreationDate,
                        () => setShowCreationDatePicker(false),
                        'creation',
                      )
                    }
                  />
                )}

                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowCreationTimePicker(true)}>
                  <Text style={styles.dateButtonText}>
                    {selectedCreationTime || 'Select time'}
                  </Text>
                </TouchableOpacity>

                {showCreationTimePicker && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    is24Hour={false}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, time) =>
                      handleTimeChange(
                        event,
                        time,
                        setSelectedCreationTime,
                        () => setShowCreationTimePicker(false),
                      )
                    }
                  />
                )}
              </View>

              {/* Attend Toggle */}
              <View
                style={{
                  height: 50,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text>Same Day Attend</Text>
                <Switch
                  value={showAttend}
                  onValueChange={setShowAttend}
                  disabled={!canEnableAttendSwitch}
                  thumbColor={canEnableAttendSwitch ? 'green' : 'red'}
                  trackColor={{false: '#ff8080', true: '#80ff80'}}
                />
              </View>

              {/* Docket Attend Container */}
              {showAttend && (
                <View>
                  <Text
                    style={{marginBottom: 5, fontSize: 14, fontWeight: 'bold'}}>
                    Docket Attend Date / Time
                  </Text>

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowAttendDatePicker(true)}>
                    <Text style={styles.dateButtonText}>
                      {attendDate || 'Select a date'}
                    </Text>
                  </TouchableOpacity>

                  {showAttendDatePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      minimumDate={creationDateObj ?? undefined}
                      onChange={(event, date) =>
                        handleDateChange(
                          event,
                          date,
                          setAttendDate,
                          () => setShowAttendDatePicker(false),
                          'attend',
                        )
                      }
                    />
                  )}

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowAttendTimePicker(true)}>
                    <Text style={styles.dateButtonText}>
                      {attendTime || 'Select time'}
                    </Text>
                  </TouchableOpacity>

                  {showAttendTimePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      is24Hour={false}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, time) =>
                        handleTimeChange(event, time, setAttendTime, () =>
                          setShowAttendTimePicker(false),
                        )
                      }
                    />
                  )}
                </View>
              )}

              {/* Rectification Toggle */}
              <View
                style={{
                  height: 50,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Text>Same Day Rectification</Text>
                <Switch
                  value={showRectification}
                  onValueChange={setShowRectification}
                  disabled={!canEnableRectificationSwitch}
                  thumbColor={canEnableRectificationSwitch ? 'green' : 'red'}
                  trackColor={{false: '#ff8080', true: '#80ff80'}}
                />
              </View>
              {/* Docket Rectification Container */}
              {showRectification && (
                <View>
                  <Text
                    style={{marginBottom: 5, fontSize: 14, fontWeight: 'bold'}}>
                    Docket Rectification Date / Time
                  </Text>

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowRectificationDatePicker(true)}>
                    <Text style={styles.dateButtonText}>
                      {rectificationDate || 'Select a date'}
                    </Text>
                  </TouchableOpacity>

                  {showRectificationDatePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      minimumDate={attendDateObj ?? undefined}
                      onChange={(event, date) =>
                        handleDateChange(
                          event,
                          date,
                          setrectificationDate,
                          () => setShowRectificationDatePicker(false),
                          'rectify',
                        )
                      }
                    />
                  )}

                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowRectificationTimePicker(true)}>
                    <Text style={styles.dateButtonText}>
                      {rectificationTime || 'Select time'}
                    </Text>
                  </TouchableOpacity>

                  {showRectificationTimePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      is24Hour={false}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, time) =>
                        handleTimeChange(
                          event,
                          time,
                          setrectificationTime,
                          () => setShowRectificationTimePicker(false),
                        )
                      }
                    />
                  )}

                  <TextInput
                    style={styles.input}
                    placeholder="Nature of Problem"
                    placeholderTextColor="#333"
                    value={remarks}
                    onChangeText={setRemarks}
                  />
                </View>
              )}

              {/* <View style={{flex: 1}}></View> */}
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit Docket</Text>
              </TouchableOpacity>
              <View style={{height: 40}}></View>
            </>
          )}
        </>
      }
      data={[]} // No actual list data
      renderItem={null}
      keyExtractor={() => 'dummy'} // Required even if no list
    />
  );
};

export default NewDocketScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    // flexGrow: 1,
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
    top: 50, // position below the input
    left: 0,
    right: 0,
    backgroundColor: 'white',
    // zIndex: 2000,
    borderWidth: 0,
  },

  list: {
    maxHeight: 150,
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 10,
    zIndex: 2000,
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
