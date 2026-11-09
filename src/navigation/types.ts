import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Menu: { selectedCategoryId?: number } | undefined;
  Cart: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Otp: { phone: string };
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | { screen?: string; params?: any } | undefined;
  Login: undefined;
  Otp: { phone: string };
  Checkout: undefined;
  OrderTracking: { orderId: number };
  AddressManager: undefined;
};

