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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen = ({ navigation }: any) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { requestOtp } = useAuth();

  const handleSendOtp = async (inputPhone?: string) => {
    const targetPhone = (inputPhone || phone).trim();
    if (!targetPhone || targetPhone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await requestOtp(targetPhone);
      if (res.success) {
        navigation.navigate('Otp', {
          phone: targetPhone,
          isRegister: authMode === 'register',
          devMessage: res.message,
        });
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
    setPhone('9876543210');
    await handleSendOtp('9876543210');
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header with Back & Skip */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          activeOpacity={0.7}
        >
          <Text style={styles.skipBtnText}>Explore Menu</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.bannerContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🍲</Text>
          </View>
          <Text style={styles.brandTitle}>DHILLON DHABA</Text>
          <Text style={styles.brandTagline}>Grand Trunk Road's Legendary Flavours</Text>
        </View>

        <View style={styles.card}>
          {/* Mode Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.tabItem, authMode === 'login' && styles.tabItemActive]}
              onPress={() => setAuthMode('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabItemText, authMode === 'login' && styles.tabItemTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, authMode === 'register' && styles.tabItemActive]}
              onPress={() => setAuthMode('register')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabItemText,
                  authMode === 'register' && styles.tabItemTextActive,
                ]}
              >
                New Registration
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.loginTitle}>
            {authMode === 'login' ? 'Welcome Back!' : 'Join Dhillon Dhaba'}
          </Text>
          <Text style={styles.loginSubtitle}>
            {authMode === 'login'
              ? 'Enter your mobile number to sign in with OTP'
              : 'Enter your mobile number to register and start ordering'}
          </Text>

          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.codeText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
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
              <Text style={styles.btnText}>
                {authMode === 'login' ? 'Sign In with OTP' : 'Register with OTP'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>QUICK DEMO / TEST</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.demoLoginBtn}
            onPress={handleDemoQuickLogin}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={18} color={Colors.primary} />
            <Text style={styles.demoLoginText}>Quick Test Login (9876543210)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: Spacing.sm,
  },
  iconBtn: {
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
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  skipBtnText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.md,
    paddingBottom: 40,
  },
  bannerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
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
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabItemTextActive: {
    color: Colors.primary,
    fontWeight: '800',
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
    marginTop: Spacing.md,
  },
});
