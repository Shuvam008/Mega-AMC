// types.ts or navigation.ts
export type RootStackParamList = {
  Home: undefined;
  LocationList: { sheet: string };
  LocationDetails: {
    location: any;
    headers: string[];
    index: number;
    sheet: string;
  };
  Corrective: undefined;
  CorrectiveList: { sheet: string };
  CorrectiveDetails: {
    location: any;
    headers: string[];
    index: number;
    sheet: string;
  };
};
