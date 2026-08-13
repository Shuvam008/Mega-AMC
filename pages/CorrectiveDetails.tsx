import {
  ActivityIndicator,
  BackHandler,
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
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import axios from 'axios';
import dayjs from 'dayjs';

// Type definitions
interface RouteParams {
  location: string[];
  headers: string[];
  index: number;
  sheet: string | number;
}

type ParamList = {
  CorrectiveDetails: RouteParams;
};

const getColumnLetter = (index: number): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[index] || '';
};

const CorrectiveDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'CorrectiveDetails'>>();

  const locationData = route.params?.location;
  const headers = route.params?.headers;
  const Index = route.params?.index;
  const sheet = route.params?.sheet?.toString() || '1';
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [ProblemNature, setProblemNature] = useState('');
  const [ProblemWarning, setProblemWarning] = useState('');
  // 2. Put it into local state so we can update it later
  const [currentLocationData, setCurrentLocationData] = useState<string[]>(
    locationData || [],
  );

  const handleDateChange = (
    event: {type: any; nativeEvent?: {timestamp: number; utcOffset: number}},
    selected: Date | undefined,
  ) => {
    if (event.type === 'set' && selected) {
      const formattedDate = selected.toLocaleDateString('en-GB'); // 21/04/2025
      setSelectedDate(formattedDate);
    }
    setShowPicker(false);
  };

  const handleTimePicked = (
    event: {type: any; nativeEvent?: {timestamp: number; utcOffset: number}},
    selected: Date | undefined,
  ) => {
    if (event.type === 'set' && selected) {
      const formattedTime = selected.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setSelectedTime(formattedTime);
    }
    setShowTimePicker(false);
  };

  const updateCell = async (
    rowIndex: number,
    colIndex: number,
    newValue: string,
  ) => {
    const row = rowIndex + 4;
    const colLetter = getColumnLetter(colIndex);
    const range = `${colLetter}${row}`;

    const sheetIdMap: Record<string, string> = {
      '1': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
      '2': '1qB7Ee0-VOV8pUSYVnhX1qeggnGg_c9ymO2zTqKRa7uQ',
      '3': '1RQQUlGEvNbE94SSudvaQx5PvS3c3ObgCsbTfqyEd69w',
    };

    let sheetId = sheetIdMap[sheet];

    await axios.post(
      'https://script.google.com/macros/s/AKfycbxGdqdvK5jkGPIurOQIoHkI6U5AzVNYXkwjF51fH4Kkcn5WuIgmfetTDNsi9j7fCSu97w/exec',
      [],
      {
        params: {
          action: 'updateCell',
          sheetId,
          range,
          value: newValue,
        },
      },
    );
  };

  const updateMultipleCells = async (
    rowIndex: number,
    startColIndex: number,
    newValues: string[],
  ) => {
    try {
      const row = rowIndex + 4;
      const startColLetter = getColumnLetter(startColIndex);
      const endColLetter = getColumnLetter(startColIndex + newValues.length - 1);
      const range = `${startColLetter}${row}:${endColLetter}${row}`;

      const sheetIdMap: Record<string, string> = {
        '1': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
        '2': '1qB7Ee0-VOV8pUSYVnhX1qeggnGg_c9ymO2zTqKRa7uQ',
        '3': '1RQQUlGEvNbE94SSudvaQx5PvS3c3ObgCsbTfqyEd69w',
      };

      let sheetId = sheetIdMap[sheet];

      const payloadValues = JSON.stringify([newValues]);

      // DIAGNOSTIC LOG: See exactly what range and data we are sending
      console.log(
        `Attempting to update Sheet ${sheetId} at Range ${range} with values:`,
        payloadValues,
      );

      const response = await axios.post(
        'https://script.google.com/macros/s/AKfycbw6bwgkmty9wed_gDThv2C7uw9H2YKe7TvOoP6tMcbozmrZhqwUau3OvthvhlOh35mQOw/exec',
        [],
        {
          params: {
            action: 'updateMultipleCells',
            sheetId,
            range,
            values: payloadValues,
          },
        },
      );

      // DIAGNOSTIC LOG: See what Google says back
      console.log('Google Sheets Response:', response.data);
    } catch (error) {
      // DIAGNOSTIC LOG: Catch the exact error
      console.error('Update Multiple Cells Error:', error);
    }
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

  /**
   * Calculates the inclusive difference between two dates (DD/MM/YYYY).
   * Returns a tuple of two integers: [cappedAt7, remainder]
   */

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
    const diffInMilliseconds = Math.abs(dateObj2.getTime() - dateObj1.getTime());

    // 3. Convert to total days (e.g., 01/04 to 02/04 = 1)
    const totalDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    // 4. First value is now strictly the total difference in days
    const firstValue = totalDays;

    // 5. Second value extracts 7 and returns the remainder (0 if under 7)
    const secondValue = Math.max(0, totalDays - 7);

    return [firstValue, secondValue];
  };

  const handleDoubleUpdate = async (
    rowIndex: number,
    dateIndex: number,
    timeIndex: number,
    date: string,
    time: string,
  ) => {
    setLoading(true);
    try {
      if (date && time) {
        // 1. Update Google Sheets
        // await updateCell(rowIndex, dateIndex, date);
        // await updateCell(rowIndex, timeIndex, time);
        if (dateIndex >= 8) {
          // await updateCell(rowIndex, timeIndex + 1, ProblemNature);

          const [val1, val2] = calculateDateSplit(date, currentLocationData[5]);
          await updateMultipleCells(rowIndex, dateIndex, [
            date,
            time,
            ProblemNature,
            val1.toString(),
            val2.toString(),
          ]);
          console.log('Value 1 : ', val1, 'Value2 : ', val2);
        }else{
          await updateMultipleCells(rowIndex, dateIndex, [date, time]);
        }

        // 2. Update Local State immediately to reflect changes on UI
        const updatedData = [...currentLocationData];
        updatedData[dateIndex] = date;
        updatedData[timeIndex] = time;
        if (dateIndex >= 8) {
          updatedData[timeIndex + 1] = ProblemNature;
        }
        setCurrentLocationData(updatedData);

        // 3. Clear inputs
        setSelectedDate('');
        setSelectedTime('');

        // REMOVED: navigation.replace('CorrectiveList', {sheet});
      }
    } catch (error) {
      console.error('Failed to update:', error);
      // Optional: Add an alert here so the user knows if it failed
    } finally {
      setLoading(false);
    }
  };

  if (!currentLocationData || currentLocationData.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Location not found</Text>
      </View>
    );
  }

  const isISODate = (value: string) => {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value);
  };

  const isISOTime = (value: string) => {
    return (
      typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
    );
  };

  const handleProblemNatureTextChange = (text: string) => {
    // Allows only letters, numbers, and spaces
    const regex = /^[a-zA-Z0-9 ]*$/;

    if (regex.test(text)) {
      // Input is clean! Save it and clear the warning.
      setProblemNature(text);
      setProblemWarning('');
    } else {
      // Special character detected! Reject and warn.
      setProblemWarning('Special characters are not allowed.');
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Modal transparent={true} visible={loading}>
        <View style={styles.loadingContainer}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Submitting...</Text>
          </View>
        </View>
      </Modal>

      <Text style={styles.locationTitle}>{currentLocationData[1]}</Text>

      <View style={styles.detailItem}>
        <Text style={styles.headerText}>
          {headers[1]} :{' '}
          <Text style={styles.cellText}>{currentLocationData[1]}</Text>
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.headerText}>
          {headers[2]} :{' '}
          <Text
            style={[
              styles.cellText,
              {fontSize: 20, fontWeight: 600, color: '#f36a30'},
            ]}>
            {currentLocationData[0]}
          </Text>
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.headerText}>
          {headers[3]} :{' '}
          <Text style={styles.cellText}>{currentLocationData[3]}</Text>
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.headerText}>
          {headers[4]} :{' '}
          <Text style={styles.cellText}>{currentLocationData[4]}</Text>
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.headerText}>
          Reporting Date & Time :{' '}
          <Text style={styles.cellText}>
            {currentLocationData[5]
              ? isISODate(currentLocationData[5])
                ? dayjs(currentLocationData[5]).format('DD/MM/YYYY')
                : currentLocationData[5]
              : 'N/A'}
            {' - '}
            {currentLocationData[6]
              ? isISOTime(currentLocationData[6])
                ? dayjs(currentLocationData[6]).format('HH:mm')
                : currentLocationData[6]
              : 'N/A'}
          </Text>
        </Text>
      </View>

      <View
        style={[
          styles.detailItem,
          {
            // Default to flex so we can use flexDirection
            display: 'flex',

            // Your conditional logic goes right here!
            flexDirection:
              !currentLocationData[7] && !currentLocationData[8]
                ? 'column'
                : 'row',
          },
        ]}>
        <Text style={styles.headerText}>Attend Date & Time: </Text>

        {!currentLocationData[7] && !currentLocationData[8] ? (
          <View style={styles.inputSection}>
            {/* Date Picker Button */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowPicker(true)}>
              <Text style={styles.dateButtonText}>
                {selectedDate || 'Select a date'}
              </Text>
            </TouchableOpacity>

            {/* Date Picker Modal */}
            {showPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'default' : 'default'}
                onChange={(event, date) => handleDateChange(event, date)}
              />
            )}

            {/* Time Picker Button */}
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}>
              <Text style={styles.dateButtonText}>
                {selectedTime || 'Select a time'}
              </Text>
            </TouchableOpacity>

            {/* Time Picker Modal */}
            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'default' : 'default'}
                onChange={(event, date) => handleTimePicked(event, date)}
              />
            )}

            {/* Update Button */}
            <TouchableOpacity
              style={[
                styles.updateButton,
                !(selectedDate && selectedTime) && styles.disabledButton,
              ]}
              onPress={() =>
                handleDoubleUpdate(Index, 7, 8, selectedDate, selectedTime)
              }
              disabled={!(selectedDate && selectedTime)}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // If data exists, show existing date/time
          <Text style={styles.cellText}>
            {currentLocationData[7]
              ? isISODate(currentLocationData[7])
                ? dayjs(currentLocationData[7]).format('DD/MM/YYYY')
                : currentLocationData[7]
              : 'N/A'}
            {' - '}
            {currentLocationData[8]
              ? isISOTime(currentLocationData[8])
                ? dayjs(currentLocationData[8]).format('HH:mm')
                : currentLocationData[8]
              : 'N/A'}
          </Text>
        )}
      </View>

      {currentLocationData[7] && currentLocationData[8] && (
        <View
          style={[
            styles.detailItem,
            {
              // Default to flex so we can use flexDirection
              display: 'flex',

              // Your conditional logic goes right here!
              flexDirection:
                !currentLocationData[9] && !currentLocationData[10]
                  ? 'column'
                  : 'row',
            },
          ]}>
          <Text style={styles.headerText}>Rectification Date & Time: </Text>

          {!currentLocationData[9] && !currentLocationData[10] ? (
            <View style={styles.inputSection}>
              {/* Date Picker Button */}
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowPicker(true)}>
                <Text style={styles.dateButtonText}>
                  {selectedDate || 'Select a date'}
                </Text>
              </TouchableOpacity>

              {/* Date Picker Modal */}
              {showPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'default' : 'default'}
                  onChange={(event, date) => handleDateChange(event, date)}
                />
              )}

              {/* Time Picker Button */}
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {selectedTime || 'Select a time'}
                </Text>
              </TouchableOpacity>

              {/* Time Picker Modal */}
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'default' : 'default'}
                  onChange={(event, date) => handleTimePicked(event, date)}
                />
              )}
              {/* <TextInput
                style={styles.input}
                placeholder="Nature of Problem"
                value={ProblemNature}
                onChangeText={text => {
                  // console.log('ProblemNature input:', text); // <-- Check what's actually typed
                  setProblemNature(text);
                }}
              /> */}
              <TextInput
                style={[
                  styles.input,
                  ProblemWarning ? {borderColor: 'red', color: 'black'} : null,
                ]} // Optional: Turn border red on error
                placeholder="Remarks"
                placeholderTextColor="#333"
                value={ProblemNature}
                onChangeText={handleProblemNatureTextChange}
              />
              {/* Show the warning text only if there is a warning */}
              {ProblemWarning ? (
                <Text style={styles.warningText}>{ProblemWarning}</Text>
              ) : null}
              {/* Update Button */}
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  !(selectedDate && selectedTime && ProblemNature) &&
                    styles.disabledButton,
                ]}
                onPress={() =>
                  handleDoubleUpdate(Index, 9, 10, selectedDate, selectedTime)
                }
                disabled={!(selectedDate && selectedTime && ProblemNature)}>
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // If data exists, show existing date/time
            <Text style={styles.cellText}>
              {currentLocationData[9]
                ? isISODate(currentLocationData[9])
                  ? dayjs(currentLocationData[9]).format('DD/MM/YYYY')
                  : currentLocationData[9]
                : 'N/A'}
              {' - '}
              {currentLocationData[10]
                ? isISOTime(currentLocationData[10])
                  ? dayjs(currentLocationData[10]).format('HH:mm')
                  : currentLocationData[10]
                : 'N/A'}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2c3e50',
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
  detailItem: {
    // display: 'flex',
    // flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cellText: {
    fontWeight: 'bold',
    color: '#0051ff',
  },
  inputSection: {
    marginTop: 10,
    gap: 10,
  },
  dateButton: {
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
  updateButton: {
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
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
});

export default CorrectiveDetails;
