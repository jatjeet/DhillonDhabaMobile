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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { showAlert } from '../../utils/alert';

export const OtpScreen = ({ route, navigation }: any) => {
  const { phone, isRegister, devMessage } = route.params || {
    phone: '9876543210',
    isRegister: false,
    devMessage: undefined,
  };

  const [step, setStep] = useState<'otp' | 'register'>('otp');
  const [otp, setOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);

  // Registration step states
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  const { verifyOtp, requestOtp, updateProfile } = useAuth();

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const navigateToHome = () => {
    try {
      const parent = navigation.getParent();
      if (parent) {
        parent.reset({
          index: 0,
          routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
        });
        return;
      }
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
      });
    } catch {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      showAlert('Invalid OTP', 'Please enter a 6-digit verification code');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await verifyOtp(phone, otp);
      if (res.success) {
        // Navigate immediately to Home screen after OTP verification
        navigateToHome();
      } else {
        showAlert('Verification Failed', 'Incorrect OTP. Please check and try again.');
      }
    } catch (err: any) {
      showAlert('Error', err.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!name.trim()) {
      showAlert('Name Required', 'Please enter your name to complete registration');
      return;
    }

    try {
      setIsSavingProfile(true);
      await updateProfile(name.trim(), email.trim());
      navigateToHome();
    } catch (err: any) {
      showAlert('Error', err.response?.data?.message || 'Failed to complete registration');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSkipRegistration = () => {
    navigateToHome();
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      const res = await requestOtp(phone);
      setTimer(30);
      showAlert('OTP Resent', res.message || 'A new verification code has been dispatched.');
    } catch (err: any) {
      showAlert('Error', 'Failed to resend OTP');
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
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (step === 'register') {
              handleSkipRegistration();
            } else {
              navigation.goBack();
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'otp' ? (
          <View style={styles.card}>
            <View style={styles.badgeHeader}>
              <Text style={styles.stepBadge}>STEP 2 OF 2</Text>
            </View>

            <Text style={styles.title}>Verify Mobile OTP</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit verification code to{' '}
              <Text style={styles.phoneHighlight}>+91 {phone}</Text>
            </Text>

            {/* Hint / Dev Banner */}
            <View style={styles.hintBanner}>
              <Ionicons name="information-circle" size={18} color={Colors.primary} />
              <Text style={styles.hintText}>
                {devMessage || 'Enter the 6-digit OTP sent to your phone (or 123456 in dev/demo mode).'}
              </Text>
            </View>

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

            {/* Quick Fill Button */}
            <TouchableOpacity
              style={styles.quickFillBtn}
              onPress={handleQuickFill}
              activeOpacity={0.7}
            >
              <Ionicons name="flash" size={15} color={Colors.primary} />
              <Text style={styles.quickFillText}>Quick Fill Dev Code (123456)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.verifyBtn, otp.length < 6 && styles.btnDisabled]}
              onPress={handleVerify}
              disabled={isVerifying || otp.length < 6}
              activeOpacity={0.8}
            >
              {isVerifying ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyBtnText}>Verify & Proceed</Text>
              )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive OTP? </Text>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendAction}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          /* Step 2: Complete User Registration */
          <View style={styles.card}>
            <View style={styles.welcomeBadge}>
              <Text style={styles.welcomeEmoji}>🎉</Text>
            </View>

            <Text style={styles.title}>Complete Registration</Text>
            <Text style={styles.subtitle}>
              Phone <Text style={styles.phoneHighlight}>+91 {phone}</Text> verified! Please enter your
              name to complete your Dhillon Dhaba profile.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Gurpreet Singh"
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. gurpreet@example.com"
                placeholderTextColor={Colors.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyBtn, !name.trim() && styles.btnDisabled]}
              onPress={handleCompleteRegistration}
              disabled={isSavingProfile || !name.trim()}
              activeOpacity={0.8}
            >
              {isSavingProfile ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.verifyBtnText}>Finish & Start Ordering</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipRegisterBtn}
              onPress={handleSkipRegistration}
              activeOpacity={0.7}
            >
              <Text style={styles.skipRegisterText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: Spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.md,
    paddingBottom: 40,
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
  badgeHeader: {
    marginBottom: Spacing.xs,
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    backgroundColor: '#FFF8E1',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  welcomeBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    alignSelf: 'center',
  },
  welcomeEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 6,
    marginBottom: Spacing.md,
    lineHeight: 18,
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
    fontSize: 12,
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
    marginBottom: Spacing.sm,
  },
  quickFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    marginBottom: Spacing.md,
    gap: 6,
  },
  quickFillText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  verifyBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
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
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: '#FAFAFA',
  },
  skipRegisterBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: Spacing.xs,
  },
  skipRegisterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
