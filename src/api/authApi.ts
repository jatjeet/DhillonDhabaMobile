import { apiClient, getDeviceId, getDemoMode, getStoredTokens, saveTokens, clearTokens } from './client';
import { OtpRequestResponseDto, OtpVerifyResponseDto, UserDto } from '../types';
import { mockUser } from './mockData';
import { Platform } from 'react-native';

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return phone.startsWith('+') ? phone : `+${phone}`;
}

export const authApi = {
  async requestOtp(phone: string): Promise<OtpRequestResponseDto> {
    const formattedPhone = formatPhone(phone);
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 400));
      return {
        success: true,
        message: 'OTP sent successfully (Demo Mode: use 123456)',
        expiresInSeconds: 300,
        retryAfterSeconds: 30,
      };
    }

    const deviceId = await getDeviceId();
    const res = await apiClient.post<OtpRequestResponseDto>('/v1/auth/otp/request', {
      phone: formattedPhone,
      deviceId,
    });
    return res.data;
  },

  async verifyOtp(phone: string, otp: string): Promise<OtpVerifyResponseDto> {
    const formattedPhone = formatPhone(phone);
    const isDemo = await getDemoMode();
    if (isDemo) {
      await new Promise(r => setTimeout(r, 400));
      const dummyRes: OtpVerifyResponseDto = {
        success: true,
        isNewUser: false,
        accessToken: 'demo_access_jwt_token',
        refreshToken: 'demo_refresh_token',
        expiresIn: 1800,
        user: { ...mockUser, phone: formattedPhone },
      };
      await saveTokens(dummyRes.accessToken, dummyRes.refreshToken);
      return dummyRes;
    }

    const deviceId = await getDeviceId();
    const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

    const res = await apiClient.post<OtpVerifyResponseDto>('/v1/auth/otp/verify', {
      phone: formattedPhone,
      otp,
      deviceId,
      platform,
    });

    await saveTokens(res.data.accessToken, res.data.refreshToken);
    return res.data;
  },

  async logout(): Promise<void> {
    const isDemo = await getDemoMode();
    if (!isDemo) {
      try {
        const deviceId = await getDeviceId();
        const { refreshToken } = await getStoredTokens();
        if (refreshToken) {
          await apiClient.post('/v1/auth/logout', { refreshToken, deviceId });
        }
      } catch (err) {
        // Logout should succeed locally even if server fails
        console.warn('Backend logout failed', err);
      }
    }
    await clearTokens();
  },
};

