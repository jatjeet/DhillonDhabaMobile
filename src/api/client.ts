// Axios API Client with JWT Bearer Token Injection & Refresh Rotation
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@dhillon_access_token',
  REFRESH_TOKEN: '@dhillon_refresh_token',
  DEVICE_ID: '@dhillon_device_id',
  BASE_URL: '@dhillon_api_base_url',
  DEMO_MODE: '@dhillon_demo_mode',
};

// Default Backend URL based on platform
// Android Emulator accesses host loopback via 10.0.2.2; iOS / Web uses localhost
export const DEFAULT_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5088',
  default: 'http://localhost:5088',
});

export const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Helper: Get or create persistent unique device id
export async function getDeviceId(): Promise<string> {
  let deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!deviceId) {
    deviceId = `dev_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, deviceId);
  }
  return deviceId;
}

export async function getStoredTokens() {
  const [accessToken, refreshToken] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
  return { accessToken, refreshToken };
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
    AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
    AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
  ]);
}

export async function getBaseUrl(): Promise<string> {
  const custom = await AsyncStorage.getItem(STORAGE_KEYS.BASE_URL);
  return custom || DEFAULT_BASE_URL;
}

export async function setBaseUrl(url: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.BASE_URL, url);
  apiClient.defaults.baseURL = url;
}

export async function getDemoMode(): Promise<boolean> {
  const val = await AsyncStorage.getItem(STORAGE_KEYS.DEMO_MODE);
  // Default to true on initial launch so the user has an instant working demo out of the box!
  return val === null ? true : val === 'true';
}

export async function setDemoMode(enabled: boolean) {
  await AsyncStorage.setItem(STORAGE_KEYS.DEMO_MODE, enabled ? 'true' : 'false');
}

// Request Interceptor: Attach JWT Token & Current Base URL
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const currentUrl = await getBaseUrl();
  if (config.baseURL !== currentUrl) {
    config.baseURL = currentUrl;
  }

  const { accessToken } = await getStoredTokens();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response Interceptor: Handle Token Refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = await getStoredTokens();
      const deviceId = await getDeviceId();

      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${originalRequest.baseURL || DEFAULT_BASE_URL}/v1/auth/refresh`, {
          refreshToken,
          deviceId,
        });

        const newAccessToken = refreshResponse.data.accessToken;
        const newRefreshToken = refreshResponse.data.refreshToken;

        await saveTokens(newAccessToken, newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        await clearTokens();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

