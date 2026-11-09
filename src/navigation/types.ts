import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Menu: { selectedCategoryId?: number } | undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Auth: { screen?: string } | undefined;
  Login: undefined;
  Otp: { phone: string };
  Checkout: undefined;
  OrderTracking: { orderId: number };
  AddressManager: undefined;
};

