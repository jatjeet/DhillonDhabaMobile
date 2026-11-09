import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export const OtpScreen = ({ route, navigation }: any) => {
  const { phone } = route.params || { phone: '9876543210' };
  const [otp, setOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);
  const { verifyOtp, requestOtp, isDemoMode } = useAuth();

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit verification code');
      return;
    }

    try {
      setIsVerifying(true);
      const success = await verifyOtp(phone, otp);
      if (success) {
        // Auth state automatically mounts RootNavigator main flow
      } else {
        Alert.alert('Verification Failed', 'Incorrect OTP. Please check and try again.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await requestOtp(phone);
      setTimer(30);
      Alert.alert('OTP Resent', 'A new verification code has been dispatched.');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to resend OTP');
    }
  };

  const handleQuickFill = () => {
    setOtp('123456');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to <Text style={styles.phoneHighlight}>+91 {phone}</Text>
        </Text>

        {/* Dev / Demo Hint Banner */}
        <TouchableOpacity style={styles.hintBanner} onPress={handleQuickFill} activeOpacity={0.8}>
          <Ionicons name="information-circle" size={18} color={Colors.primary} />
          <Text style={styles.hintText}>
            {isDemoMode
              ? 'Demo Mode active — tap here to auto-fill OTP: 123456'
              : 'Local Dev backend prints OTP in console (or tap for 123456)'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.otpInput}
          placeholder="• • • • • •"
          placeholderTextColor={Colors.textLight}
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.verifyBtn, otp.length < 6 && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={isVerifying || otp.length < 6}
          activeOpacity={0.8}
        >
          {isVerifying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify & Continue</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive OTP? </Text>
          {timer > 0 ? (
            <Text style={styles.timerText}>Resend in {timer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendAction}>Resend Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
    marginBottom: Spacing.md,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: Colors.text,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: 8,
  },
  hintText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    color: Colors.text,
    backgroundColor: '#FAFAFA',
    marginBottom: Spacing.lg,
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  resendText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  resendAction: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});

