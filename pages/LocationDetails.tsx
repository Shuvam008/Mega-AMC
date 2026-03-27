import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
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
  LocationDetails: RouteParams;
};

const getColumnLetter = (index: number): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return letters[index] || '';
};

const LocationDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'LocationDetails'>>();

  const locationData = route.params?.location;
  const headers = route.params?.headers;
  const Index = route.params?.index;
  const sheet = route.params?.sheet?.toString() || '1';

  // 2. Set up LOCAL STATE to drive the UI and Loading spinner
  const [currentLocationData, setCurrentLocationData] = useState<string[]>(
    locationData || [],
  );
  const [loading, setLoading] = useState(false);

  const [selectedDates, setSelectedDates] = useState<Record<number, string>>(
    {},
  );
  const [showPicker, setShowPicker] = useState<Record<number, boolean>>({});

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
      '1': '153ll-RPxGW4hKbwKrQR3kFkB8EujHOrljYHfvwezaQA',
      '2': '1YjI3yILyl_4oPcSY1cUQwobdm4TTgrEf84qTT7GXKHQ',
      '3': '1_83jCyTNUCsOBENKFIC367y5l-CPG40vKZraX1hu7gc',
    };

    let sheetId = sheetIdMap[sheet];

    await axios.post(
      'https://script.google.com/macros/s/AKfycbz8XVVJBi6ZBHPe_9-muGM9pJkJIAOCGaFjjwsrs5n38WymPEtGR4JQoh8edWaDYf93cA/exec',
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

  // const handleUpdate = (rowIndex: number, colIndex: number) => {
  //   const selectedDate = selectedDates[colIndex];
  //   if (selectedDate) {
  //     updateCell(rowIndex, colIndex, selectedDate);
  //     setSelectedDates(prev => ({...prev, [colIndex]: ''}));
  //     navigation.replace('LocationList', {sheet});
  //   }
  // };
  // 3. Make handleUpdate async and update local state instead of navigating away
  const handleUpdate = async (rowIndex: number, colIndex: number) => {
    const selectedDate = selectedDates[colIndex];

    if (selectedDate) {
      setLoading(true);
      try {
        // 1. Update Google Sheet
        await updateCell(rowIndex, colIndex, selectedDate);

        // 2. Update Local State immediately to reflect changes on UI
        const updatedData = [...currentLocationData];
        updatedData[colIndex] = selectedDate;
        setCurrentLocationData(updatedData);

        // 3. Clear the selected date input for this cell
        setSelectedDates(prev => ({...prev, [colIndex]: ''}));

        // REMOVED: navigation.replace('LocationList', {sheet});
      } catch (error) {
        console.error('Failed to update cell:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // if (!locationData) {
  //   return (
  //     <View style={styles.container}>
  //       <Text>Location not found</Text>
  //     </View>
  //   );
  // }
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

  return (
    // <ScrollView contentContainerStyle={styles.container}>
    //   <Text style={styles.locationTitle}>{locationData[1]}</Text>
    //   {locationData.map((cell, cellIndex) =>
    //     cellIndex !== 0 ? (
    //       <View style={styles.detailItem} key={cellIndex}>
    //         <Text style={styles.headerText}>
    //           {headers[cellIndex]}:{' '}
    //           {/* <Text style={styles.cellText}>{cell || 'N/A'}</Text> */}
    //           <Text style={styles.cellText}>
    //             {cell
    //               ? isISODate(cell)
    //                 ? dayjs(cell).format('DD/MM/YYYY')
    //                 : cell
    //               : 'N/A'}
    //           </Text>
    //         </Text>
    //         {cellIndex >= 2 && !cell && (
    //           <View style={styles.inputSection}>
    //             <TouchableOpacity
    //               style={styles.dateButton}
    //               onPress={() =>
    //                 setShowPicker(prev => ({...prev, [cellIndex]: true}))
    //               }>
    //               <Text style={styles.dateButtonText}>
    //                 {selectedDates[cellIndex] || 'Select a date'}
    //               </Text>
    //             </TouchableOpacity>
    //             {showPicker[cellIndex] && (
    //               <DateTimePicker
    //                 value={new Date()}
    //                 mode="date"
    //                 display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    //                 onChange={(event, date) =>
    //                   handleDateChange(event, date, cellIndex)
    //                 }
    //               />
    //             )}
    //             <TouchableOpacity
    //               style={[
    //                 styles.updateButton,
    //                 !selectedDates[cellIndex] && styles.disabledButton,
    //               ]}
    //               onPress={() => handleUpdate(Index, cellIndex)}
    //               disabled={!selectedDates[cellIndex]}>
    //               <Text style={styles.updateButtonText}>Update</Text>
    //             </TouchableOpacity>
    //           </View>
    //         )}
    //       </View>
    //     ) : null,
    //   )}
    // </ScrollView>
    <ScrollView contentContainerStyle={styles.container}>
      {/* 4. Add the Loading Modal */}
      <Modal transparent={true} visible={loading}>
        <View style={styles.loadingContainer}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Submitting...</Text>
          </View>
        </View>
      </Modal>

      <Text style={styles.locationTitle}>{currentLocationData[1]}</Text>

      {currentLocationData.map((cell, cellIndex) =>
        cellIndex !== 0 ? (
          <View style={styles.detailItem} key={cellIndex}>
            <Text style={styles.headerText}>
              {headers[cellIndex]}:{' '}
              <Text style={styles.cellText}>
                {cell
                  ? isISODate(cell)
                    ? dayjs(cell).format('DD/MM/YYYY')
                    : cell
                  : 'N/A'}
              </Text>
            </Text>

            {/* If cellIndex >= 2 and there is NO data in this cell, show the inputs */}
            {cellIndex >= 2 && !cell && (
              <View style={styles.inputSection}>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() =>
                    setShowPicker(prev => ({...prev, [cellIndex]: true}))
                  }>
                  <Text style={styles.dateButtonText}>
                    {selectedDates[cellIndex]
                      ? dayjs(selectedDates[cellIndex]).format('DD/MM/YYYY')
                      : 'Select a date'}
                  </Text>
                </TouchableOpacity>

                {showPicker[cellIndex] && (
                  <DateTimePicker
                    value={new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) =>
                      handleDateChange(event, date, cellIndex)
                    }
                  />
                )}

                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    !selectedDates[cellIndex] && styles.disabledButton,
                  ]}
                  onPress={() => handleUpdate(Index, cellIndex)}
                  disabled={!selectedDates[cellIndex]}>
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
    color: '#0051ff',
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
  // Added Loading Styles
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

export default LocationDetails;
