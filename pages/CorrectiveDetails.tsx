import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';

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

  const [selectedDates, setSelectedDates] = useState<Record<number, string>>(
    {},
  );
   const [selectedTimes, setSelectedTimes] = useState<Record<number, string>>(
     {},
   );
  const [showPicker, setShowPicker] = useState<Record<number, boolean>>({});
  const [showTimePicker, setShowTimePicker] = useState<Record<number, boolean>>({});

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
    cellIndex: number,
  ) => {
    if (event.type === 'set' && selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      setSelectedDates(prev => ({...prev, [cellIndex]: isoDate}));
    }
    setShowPicker(prev => ({...prev, [cellIndex]: false}));
  };

const handleTimePicked = (
  event: DateTimePickerEvent,
  time: Date | undefined,
  cellIndex: number,
) => {
  if (event.type === 'set' && time) {
    const formattedTime = dayjs(time).format('HH:mm'); // Just extract time
    setSelectedTimes(prev => ({...prev, [cellIndex]: formattedTime}));
  }
  setShowTimePicker(prev => ({...prev, [cellIndex]: false}));
};

  const updateCell = async (
    rowIndex: number,
    colIndex: number,
    newValue: string,
  ) => {
    const row = rowIndex + 1;
    const colLetter = getColumnLetter(colIndex);
    const range = `${colLetter}${row}`;
    // const sheetId =
    //   sheet === '2'
    //     ? '1YjI3yILyl_4oPcSY1cUQwobdm4TTgrEf84qTT7GXKHQ'
    //     : '153ll-RPxGW4hKbwKrQR3kFkB8EujHOrljYHfvwezaQA';

    const sheetIdMap: Record<string, string> = {
      '1': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
      '2': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
      '3': '1hNpWRqVNx7QuyBp20gj9L7f_rgYnQF8XM7euevBxr7Q',
    };

    let sheetId = sheetIdMap[sheet];

    await axios.post(
      'https://script.google.com/macros/s/AKfycbyOvGrV0yspKQYtJm1ROuI1OQCJmBvpNaSTzCE3nTzp7wXftjupEWd0TV5gYeOyqWGBEA/exec',
      null,
      {
        params: {
          sheetId,
          range,
          value: newValue,
        },
      },
    );
  };

  const handleUpdate = (rowIndex: number, colIndex: number) => {
    const selectedDate = selectedDates[colIndex];
    if (selectedDate) {
      updateCell(rowIndex, colIndex, selectedDate);
      setSelectedDates(prev => ({...prev, [colIndex]: ''}));
      navigation.replace('CorrectiveList', {sheet});
    }
  };

  const handleDoubleUpdate = async (
    rowIndex: number,
    dateIndex: number,
    timeIndex: number,
    date:string,
    time:string
  ) => {
    // const dateVal = selectedDates[dateIndex];
    // const timeVal = selectedTimes[timeIndex];
    console.error('Date : ', date);
    console.error('Time : ', time);
    if (date && time) {
      await updateCell(rowIndex, dateIndex, date);
      await updateCell(rowIndex, timeIndex, time);

      // Clear inputs
      setSelectedDates(prev => ({...prev, [dateIndex]: ''}));
      setSelectedTimes(prev => ({...prev, [timeIndex]: ''}));

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.locationTitle}>{locationData[1]}</Text>
      {locationData.map((cell, cellIndex) =>
        cellIndex !== 0 ? (
          <View style={styles.detailItem} key={cellIndex}>
            <Text style={styles.headerText}>
              {headers[cellIndex]}:{' '}
              {/* <Text style={styles.cellText}>{cell || 'N/A'}</Text> */}
              <Text style={styles.cellText}>
                {cell
                  ? isISODate(cell)
                    ? dayjs(cell).format('DD/MM/YYYY')
                    : cell
                  : 'N/A'}
              </Text>
            </Text>
            {cellIndex >= 2 && !cell && (
              <View style={styles.inputSection}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() =>
                    setShowPicker(prev => ({...prev, [cellIndex]: true}))
                  }>
                  <Text style={styles.dateButtonText}>
                    {selectedDates[cellIndex] || 'Select a date'}
                  </Text>
                </TouchableOpacity>
                {showPicker[cellIndex] && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'default' : 'default'}
                    onChange={(event, date) =>
                      handleDateChange(event, date, cellIndex)
                    }
                  />
                )}
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() =>
                    setShowTimePicker(prev => ({...prev, [cellIndex]: true}))
                  }>
                  <Text style={styles.dateButtonText}>
                    {selectedTimes[cellIndex] || 'Select a date'}
                  </Text>
                </TouchableOpacity>
                {showTimePicker[cellIndex] && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'default' : 'default'}
                    onChange={(event, date) =>
                      handleTimePicked(event, date, cellIndex)
                    }
                  />
                )}
                {/* <TouchableOpacity
                  style={[
                    styles.updateButton,
                    !selectedDates[cellIndex] && styles.disabledButton,
                  ]}
                  onPress={() => handleUpdate(Index, cellIndex)}
                  disabled={!selectedDates[cellIndex]}>
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    !(
                      selectedDates[cellIndex] && selectedTimes[cellIndex]
                    ) && styles.disabledButton,
                  ]}
                  onPress={() => {
                   handleDoubleUpdate(
                     Index,
                     cellIndex,
                     cellIndex + 1,
                     selectedDates[cellIndex],
                     selectedTimes[cellIndex],
                   );
                  }}
                  disabled={
                    !(selectedDates[cellIndex] && selectedTimes[cellIndex])
                  }>
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null,
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
  detailItem: {
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
});

export default CorrectiveDetails;
