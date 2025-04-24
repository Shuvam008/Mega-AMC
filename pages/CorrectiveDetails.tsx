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
import {RouteProp, useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';

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


const handleDateChange = (event: { type: any; nativeEvent?: { timestamp: number; utcOffset: number; }; }, selected: Date | undefined) => {
  if (event.type === 'set' && selected) {
    const formattedDate = selected.toLocaleDateString('en-GB'); // 21/04/2025
    setSelectedDate(formattedDate);
  }
  setShowPicker(false);
};

const handleTimePicked = (event: { type: any; nativeEvent?: { timestamp: number; utcOffset: number; }; }, selected: Date | undefined) => {
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
  const handleDoubleUpdate = async (
    rowIndex: number,
    dateIndex: number,
    timeIndex: number,
    date:string,
    time:string
  ) => {
    setLoading(true);
    if (date && time) {
      await updateCell(rowIndex, dateIndex, date);
      await updateCell(rowIndex, timeIndex, time);
      if (dateIndex>=8) {
        await updateCell(rowIndex, timeIndex + 1, ProblemNature);
      }
      // Clear inputs
     setSelectedDate('');
     setSelectedTime('');
     setLoading(false);
     navigation.replace('CorrectiveList', {sheet});
    }
  };

  if (!locationData) {
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

      <Text style={styles.locationTitle}>{locationData[1]}</Text>

      <View style={styles.detailItem}>
        <Text style={styles.headerText}>
          {headers[1]} : <Text style={styles.cellText}>{locationData[1]}</Text>
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.headerText}>
          {headers[2]} : <Text style={styles.cellText}>{locationData[2]}</Text>
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.headerText}>
          {headers[3]} : <Text style={styles.cellText}>{locationData[3]}</Text>
        </Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.headerText}>
          Rectification Date & Time :{' '}
          <Text style={styles.cellText}>
            {locationData[4]
              ? isISODate(locationData[4])
                ? dayjs(locationData[4]).format('DD/MM/YYYY')
                : locationData[4]
              : 'N/A'}
            {' - '}
            {locationData[5]
              ? isISOTime(locationData[5])
                ? dayjs(locationData[5]).format('HH:mm')
                : locationData[5]
              : 'N/A'}
          </Text>
        </Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.headerText}>Attend Date & Time: </Text>

        {!locationData[6] && !locationData[7] ? (
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
                handleDoubleUpdate(Index, 6, 7, selectedDate, selectedTime)
              }
              disabled={!(selectedDate && selectedTime)}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // If data exists, show existing date/time
          <Text style={styles.cellText}>
            {locationData[6]
              ? isISODate(locationData[6])
                ? dayjs(locationData[6]).format('DD/MM/YYYY')
                : locationData[6]
              : 'N/A'}
            {' - '}
            {locationData[7]
              ? isISOTime(locationData[7])
                ? dayjs(locationData[7]).format('HH:mm')
                : locationData[7]
              : 'N/A'}
          </Text>
        )}
      </View>

      {locationData[6] && locationData[7] && (
        <View style={styles.detailItem}>
          <Text style={styles.headerText}>Rectification Date & Time: </Text>

          {!locationData[8] && !locationData[9] ? (
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
              <TextInput
                style={styles.input}
                placeholder="Nature of Problem"
                value={ProblemNature}
                onChangeText={text => {
                  // console.log('ProblemNature input:', text); // <-- Check what's actually typed
                  setProblemNature(text);
                }}
              />
              {/* Update Button */}
              <TouchableOpacity
                style={[
                  styles.updateButton,
                  !(selectedDate && selectedTime && ProblemNature) &&
                    styles.disabledButton,
                ]}
                onPress={() =>
                  handleDoubleUpdate(Index, 8, 9, selectedDate, selectedTime)
                }
                disabled={!(selectedDate && selectedTime && ProblemNature)}>
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // If data exists, show existing date/time
            <Text style={styles.cellText}>
              {locationData[8]
                ? isISODate(locationData[8])
                  ? dayjs(locationData[8]).format('DD/MM/YYYY')
                  : locationData[8]
                : 'N/A'}
              {' - '}
              {locationData[9]
                ? isISOTime(locationData[9])
                  ? dayjs(locationData[9]).format('HH:mm')
                  : locationData[9]
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
    fontWeight: 'normal',
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
});

export default CorrectiveDetails;
