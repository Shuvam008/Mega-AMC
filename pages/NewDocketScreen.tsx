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

import AsyncStorage from '@react-native-async-storage/async-storage';
import Autocomplete from 'react-native-autocomplete-input';
import DeviceInfo from 'react-native-device-info';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import NetInfo from '@react-native-community/netinfo';
import {Picker} from '@react-native-picker/picker';
import { RootStackParamList } from './types';
import axios from 'axios';

const problems = [
    'PRINTING PROBLEM',
    'OUT OF ORDER',
    'TICKET CUTTING PROBLEM',
    'NO DISPLAY',
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

  const [showRectificationDatePicker, setShowRectificationDatePicker] =
    useState(false);
  const [showRectificationTimePicker, setShowRectificationTimePicker] =
    useState(false);

  const [serialNo, setSerialNo] = useState('');
  const [serialWarning, setSerialWarning] = useState('');
  const [selectedCreationDate, setSelectedCreationDate] = useState<string>('');
  const [selectedCreationTime, setSelectedCreationTime] = useState<string>('');
  const [selectedProblem, setSelectedProblem] = useState('');
  const [otherText, setOtherText] = useState('');
  const [otherWarning, setOtherWarning] = useState('');
  const [docketNumber, setDocketNumber] = useState('NO');
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
  const [canEnableRectificationSwitch, setCanEnableRectificationSwitch] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [stations, setStations] = useState(['']);

  const [submitStation, setSubmitStation] = useState('');
  const [creationDateObj, setCreationDateObj] = useState<Date | null>(null);
  const [attendDateObj, setAttendDateObj] = useState<Date | null>(null);
  const isDropdownOpen = filteredStations.length > 0 && query.trim() !== '';

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

  const calculateDateSplit = (
    dateStr1: string,
    dateStr2: string,
  ): [number, number] => {
    // SAFETY GUARD: If a date is missing entirely, return 0 and 0
    if (!dateStr1 || !dateStr2) {
      return [0, 0];
    }

    // 1. Helper function to parse dates and fix the 100-year bug
    const parseDateString = (dateStr: string) => {
      let [day, month, year] = dateStr.split('/');

      let yearNum = parseInt(year, 10);
      // If the year is just '26', convert it to 2026
      if (yearNum < 100) {
        yearNum += 2000;
      }

      return new Date(yearNum, parseInt(month, 10) - 1, parseInt(day, 10));
    };

    const dateObj1 = parseDateString(dateStr1);
    const dateObj2 = parseDateString(dateStr2);

    // 2. Get the absolute difference in milliseconds
    const diffInMilliseconds = Math.abs(
      dateObj2.getTime() - dateObj1.getTime(),
    );

    // 3. Convert to total days (e.g., 01/04 to 02/04 = 1)
    const totalDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    // 4. First value is now strictly the total difference in days
    const firstValue = totalDays;

    // 5. Second value extracts 7 and returns the remainder (0 if under 7)
    const secondValue = Math.max(0, totalDays - 7);

    return [firstValue, secondValue];
  };
  const handleSubmit = async () => {
    // 1. Check Internet FIRST before doing anything
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      Alert.alert(
        'No Internet',
        'Please connect to the internet before submitting.',
      );
      return;
    }

    // 2. Validation
    if (
      !submitStation ||
      !selectedProblem ||
      !serialNo ||
      !selectedCreationDate ||
      !selectedCreationTime
    ) {
      Alert.alert('Error', 'Please fill all fields');
      if (!submitStation) Alert.alert('Error', 'Please fill Station Name');
      return;
    }

    if (showAttend && (!attendDate || !attendTime)) {
      Alert.alert('Error', 'Please fill Attend Date and Time');
      return;
    }

    if (
      showRectification &&
      (!rectificationDate || !rectificationTime || !remarks)
    ) {
      Alert.alert('Error', 'Please fill Rectification fields completely');
      return;
    }

    setLoading(true);

    const sheetIdMap: Record<string, string> = {
      '1': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
      '2': '1qB7Ee0-VOV8pUSYVnhX1qeggnGg_c9ymO2zTqKRa7uQ',
      '3': '1RQQUlGEvNbE94SSudvaQx5PvS3c3ObgCsbTfqyEd69w',
    };

    let sheetId = sheetIdMap[sheet];
    const [val1, val2] = calculateDateSplit(
      selectedCreationDate,
      rectificationDate,
    );
    try {
      const values = JSON.stringify([
        submitStation,
        docketNumber == '' ? 'NO' : 'NO',
        selectedProblem == 'OTHER' ? otherText : selectedProblem,
        serialNo,
        selectedCreationDate,
        selectedCreationTime,
        attendDate,
        attendTime,
        rectificationDate,
        rectificationTime,
        remarks,
        val1,
        val2,
        await DeviceInfo.getDeviceName(),
      ]);

      const res = await axios.post(
        'https://script.google.com/macros/s/AKfycbw6bwgkmty9wed_gDThv2C7uw9H2YKe7TvOoP6tMcbozmrZhqwUau3OvthvhlOh35mQOw/exec',
        values,
        {
          params: {sheetId: sheetId, action: 'appendRow'},
          headers: {'Content-Type': 'application/json'},
        },
      );

      // 3. Catch Duplicate Responses from Apps Script
      if (res.data === 'Duplicate') {
        Alert.alert(
          'Duplicate Entry',
          'This exact docket was already submitted recently.',
        );
        // Clear form
        setQuery('');
        setSubmitStation('');
        setDocketNumber('NO');
        setSelectedProblem('');
        setSerialNo('');
        setSelectedCreationDate('');
        setSelectedCreationTime('');
        setOtherText('');
        return; // Stop here, don't clear the form
      }

      // 4. If we made it here, it was truly successful!
      Alert.alert('Success', 'Docket submitted successfully');

      // Clear form
      setQuery('');
      setSubmitStation('');
      setDocketNumber('NO');
      setSelectedProblem('');
      setSerialNo('');
      setSelectedCreationDate('');
      setSelectedCreationTime('');
      setOtherText('');
    } catch (err) {
      Alert.alert('Error', 'Docket Submit failed');
      console.log(err);
    } finally {
      setLoading(false); // Hide loader regardless of success or failure
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

  // 1. Create a dynamic key based on the current sheet (1, 2, or 3)
  const getStorageKey = () => `@stations_sheet_${sheet}`;

  // 2. Load local data when the screen opens or the sheet changes
  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const key = getStorageKey();
        const storedStations = await AsyncStorage.getItem(key);

        if (storedStations !== null) {
          // Local data found! Parse it and set it to state
          setStations(JSON.parse(storedStations));
        } else {
          // First time ever opening the app? Fetch it automatically once.
          fetchData();
        }
      } catch (error) {
        console.error('Error loading local stations:', error);
      }
    };

    loadLocalData();
  }, [sheet]);
  const fetchData = async () => {
    try {
      setLoading1(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const sheetIdMap: Record<string, string> = {
        '1': '1YjI3yILyl_4oPcSY1cUQwobdm4TTgrEf84qTT7GXKHQ',
        '2': '153ll-RPxGW4hKbwKrQR3kFkB8EujHOrljYHfvwezaQA',
        '3': '1_83jCyTNUCsOBENKFIC367y5l-CPG40vKZraX1hu7gc',
      };

      let sheetId = sheetIdMap[sheet];

      // const response = await axios.get(
      //   `https://script.google.com/macros/s/AKfycbz8XVVJBi6ZBHPe_9-muGM9pJkJIAOCGaFjjwsrs5n38WymPEtGR4JQoh8edWaDYf93cA/exec?sheet=${sheetId}`,
      // );
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;

      const response = await axios.get<string>(csvUrl);
      const csvText = response.data;
      // const sheetData = response.data;
      const sheetData = csvText.split('\n').map(row => row.split(','));
      console.log(sheetData);

      // setStations(sheetData.slice(1).map((row: String[]) => row[1]));
      // Change (row: String[]) to (row: string[])
      // setStations(sheetData.slice(1).map((row: string[]) => row[1]));
      const extractedStations = sheetData
        .slice(1)
        .map((row: string[]) => row[1]);

      // Update the UI state
      setStations(extractedStations);

      // SAVE TO LOCAL STORAGE
      const key = getStorageKey();
      await AsyncStorage.setItem(key, JSON.stringify(extractedStations));

      // alert('Station list updated successfully!');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading1(false);
    }
  };
  // useFocusEffect(
  //   useCallback(() => {
  //     fetchData(); // Refresh data every time the screen is focused
  //   }, []),
  // );
  const handleSerialChange = (text: string) => {
    // This regex means: "Allow only letters (a-z, A-Z), numbers (0-9), and spaces."
    const regex = /^[a-zA-Z0-9 ]*$/;

    if (regex.test(text)) {
      // Input is clean! Save it and clear any existing warnings.
      setSerialNo(text.toUpperCase());
      setSerialWarning('');
    } else {
      // Input contains a special character! Reject it and show warning.
      setSerialWarning('Special characters are not allowed.');
    }
  };
  const handleOtherTextChange = (text: string) => {
    // Allows only letters, numbers, and spaces
    const regex = /^[a-zA-Z0-9 ]*$/;

    if (regex.test(text)) {
      // Input is clean! Save it and clear the warning.
      setOtherText(text);
      setOtherWarning('');
    } else {
      // Special character detected! Reject and warn.
      setOtherWarning('Special characters are not allowed.');
    }
  };


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
              <View
                style={[
                  styles.autocompleteContainer,
                  {
                    zIndex: 1000,
                    elevation: 1000,
                    display: 'flex',
                    flexDirection: 'row',
                  },
                ]}>
                <Autocomplete
                  data={filteredStations}
                  defaultValue={query}
                  onChangeText={handleSearch}
                  placeholder={`Station (e.g. ${
                    sheet === '1'
                      ? 'HOWRAH'
                      : sheet === '2'
                      ? 'SEALDAH'
                      : 'Esplanade'
                  })`}
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
                <TouchableOpacity
                  style={[
                    styles.smallSyncButton,
                    loading1 && styles.syncButtonDisabled,
                  ]}
                  onPress={fetchData}
                  disabled={loading1}>
                  {/* Using a simple text icon for the square button */}
                  <Text style={styles.smallSyncButtonText}>
                    {loading1 ? '...' : '↻'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.input,
                  serialWarning ? {borderColor: 'red', color: 'black'} : null,
                ]} // Optional: Turn border red on error
                placeholder="Serial Number"
                placeholderTextColor="#333"
                value={serialNo}
                onChangeText={handleSerialChange}
              />
              {/* Show the warning text only if there is a warning */}
              {serialWarning ? (
                <Text style={styles.warningText}>{serialWarning}</Text>
              ) : null}
              <View style={styles.pickerWrapper}>
                <Picker
                  enabled={!isDropdownOpen}
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
              <Text
                style={{
                  color: !isDropdownOpen ? 'white' : 'red',
                  marginBottom: 5,
                }}>
                please select the station first
              </Text>
              {selectedProblem === 'OTHER' && (
                <View>
                  <TextInput
                    style={[
                      styles.input,
                      otherWarning
                        ? {borderColor: 'red', color: 'black'}
                        : null,
                    ]}
                    placeholder="Describe your issue"
                    placeholderTextColor="#333"
                    value={otherText}
                    onChangeText={handleOtherTextChange}
                  />
                  {/* Show warning if special characters are typed */}
                  {otherWarning ? (
                    <Text style={styles.warningText}>{otherWarning}</Text>
                  ) : null}
                </View>
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
    marginBottom: 2,
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
  warningText: {
    color: 'red',
    fontSize: 12,
    marginTop: -15, // Pulls it up closer to the input box
    marginBottom: 15,
    marginLeft: 5,
  },
  disabledInput: {
    backgroundColor: '#e0e0e0', // A nice, visually logical gray
    color: '#888', // Dims the text slightly so it looks inactive
    borderColor: '#ccc', // Softens the border
  },
  smallSyncButton: {
    backgroundColor: '#0066cc',
    width: 48, // Fixed width to make it a square
    height: 48, // Match this to the height of your input box!
    borderRadius: 8,
    alignItems: 'center',
    // justifyContent: 'flex-start',
    marginLeft: 8, // Adds a little gap between the input and the button
  },
  syncButtonDisabled: {
    backgroundColor: '#A0CFFF',
  },
  smallSyncButtonText: {
    color: '#FFFFFF',
    fontSize: 35, // Big enough to look like an icon
    fontWeight: 'bold',
    
  },
});
