// types.ts or navigation.ts
export type RootStackParamList = {
  Home: undefined;
  LocationList: { sheet: number };
  LocationDetails: {
    location: any;
    headers: string[];
    index: number;
    sheet: number;
  };
};
