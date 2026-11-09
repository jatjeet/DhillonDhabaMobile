import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { requestOtp, isDemoMode, toggleDemoMode } = useAuth();

  const handleSendOtp = async (inputPhone?: string) => {
    const targetPhone = inputPhone || phone.trim();
    if (!targetPhone || targetPhone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await requestOtp(targetPhone);
      if (res.success) {
        navigation.navigate('Otp', { phone: targetPhone });
      } else {
        Alert.alert('Error', res.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoQuickLogin = async () => {
    await toggleDemoMode(true);
    setPhone('9876543210');
    handleSendOtp('9876543210');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.bannerContainer}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>🍲</Text>
        </View>
        <Text style={styles.brandTitle}>DHILLON DHABA</Text>
        <Text style={styles.brandTagline}>Grand Trunk Road's Legendary Flavours</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.loginTitle}>Login or Sign Up</Text>
        <Text style={styles.loginSubtitle}>
          Enter your phone number to receive a 6-digit OTP
        </Text>

        <View style={styles.phoneInputContainer}>
          <View style={styles.countryCode}>
            <Text style={styles.flag}>🇮🇳</Text>
            <Text style={styles.codeText}>+91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor={Colors.textLight}
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, phone.length < 10 && styles.btnDisabled]}
          onPress={() => handleSendOtp()}
          disabled={isSubmitting || phone.length < 10}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>Continue with OTP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR QUICK TEST</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.demoLoginBtn}
          onPress={handleDemoQuickLogin}
          activeOpacity={0.8}
        >
          <Ionicons name="flash" size={18} color={Colors.primary} />
          <Text style={styles.demoLoginText}>Instant Demo Login (9876543210)</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerNote}>
        By continuing, you agree to our Terms of Service & Privacy Policy.
      </Text>
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
  bannerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logoEmoji: {
    fontSize: 34,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
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
  loginTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.text,
  },
  loginSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    backgroundColor: '#FAFAFA',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    gap: 4,
  },
  flag: {
    fontSize: 18,
  },
  codeText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textLight,
    marginHorizontal: 8,
  },
  demoLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFF8E1',
    gap: 8,
  },
  demoLoginText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});

