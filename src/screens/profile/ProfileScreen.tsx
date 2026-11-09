import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useDhaba } from '../../context/DhabaContext';
import { showAlert } from '../../utils/alert';

export const ProfileScreen = ({ navigation }: any) => {
  const {
    user,
    isAuthenticated,
    isDemoMode,
    baseUrl,
    toggleDemoMode,
    updateBaseUrl,
    updateProfile,
    logout,
  } = useAuth();
  const { outlet } = useDhaba();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>(user?.name || '');
  const [email, setEmail] = useState<string>(user?.email || '');

  const [isUrlModalOpen, setIsUrlModalOpen] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>(baseUrl);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const handleSaveProfile = async () => {
    try {
      await updateProfile(name, email);
      setIsEditProfileOpen(false);
      showAlert('Profile Updated', 'Your details have been saved.');
    } catch (err: any) {
      showAlert('Error', 'Failed to update profile');
    }
  };

  const handleSaveUrl = async () => {
    try {
      await updateBaseUrl(customUrl.trim());
      setIsUrlModalOpen(false);
      showAlert('Backend URL Updated', `API base URL set to: ${customUrl}`);
    } catch {
      showAlert('Error', 'Failed to update URL');
    }
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setIsLogoutModalOpen(false);
    } catch (err: any) {
      console.warn('Sign out error', err);
      showAlert('Sign Out', 'Signed out from your device.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Dhaba Account</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Dynamic User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarLetter}>
              {user?.name ? user.name.charAt(0).toUpperCase() : user ? 'U' : 'G'}
            </Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || (user ? 'Dhaba Patron' : 'Guest User')}</Text>
            <Text style={styles.profilePhone}>
              {user?.phone ? `+91 ${user.phone}` : 'Not signed in'}
            </Text>
            {user?.email ? <Text style={styles.profileEmail}>{user.email}</Text> : null}
          </View>

          {user ? (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => {
                setName(user?.name || '');
                setEmail(user?.email || '');
                setIsEditProfileOpen(true);
              }}
            >
              <Ionicons name="pencil" size={16} color={Colors.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginPill}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginPillText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Menu Options */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AddressManager')}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Saved Addresses</Text>
              <Text style={styles.menuSubtitle}>Manage home, office and delivery spots</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="receipt-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Past Orders & Receipts</Text>
              <Text style={styles.menuSubtitle}>View order history and leave reviews</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Developer & Environment Settings */}
        <View style={styles.menuCard}>
          <Text style={styles.sectionHeading}>ENVIRONMENT & DEVELOPER TOOLS</Text>

          {/* Demo Mode Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrap}>
              <View style={styles.demoTitleRow}>
                <Ionicons name="flash-outline" size={18} color={Colors.primary} />
                <Text style={styles.menuTitle}>Mock Demo Mode</Text>
              </View>
              <Text style={styles.menuSubtitle}>
                {isDemoMode
                  ? 'Active: App runs fully offline with rich Dhillon Dhaba menu'
                  : 'Inactive: Directly calls ASP.NET Core Web API'}
              </Text>
            </View>
            <Switch
              value={isDemoMode}
              onValueChange={toggleDemoMode}
              trackColor={{ false: '#767577', true: Colors.primaryLight }}
              thumbColor={isDemoMode ? Colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.divider} />

          {/* Backend Base URL */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setCustomUrl(baseUrl);
              setIsUrlModalOpen(true);
            }}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="server-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuTextWrap}>
              <Text style={styles.menuTitle}>Backend API URL</Text>
              <Text style={styles.menuSubtitle} numberOfLines={1}>
                {baseUrl || 'Tap to configure endpoint'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* Dhaba Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.dhabaName}>{outlet?.name || 'Dhillon Dhaba'}</Text>
          <Text style={styles.dhabaAddress}>
            {outlet?.address ? `${outlet.address}, ${outlet.city}` : 'National Highway 1'}
          </Text>
          <Text style={styles.dhabaHours}>
            Open Daily: {outlet?.opensAt || '1:00 PM'} - {outlet?.closesAt || '2:00 AM'}
          </Text>
          <Text style={styles.dhabaPhone}>Kitchen: {outlet?.phone || '+91 9319036136'}</Text>
        </View>

        {/* Dynamic Auth Action Button */}
        {user ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={Colors.badgeClosed} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
            <Text style={styles.signInBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>Dhillon Dhaba Mobile v1.0.0 (Expo SDK 58)</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditProfileOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update Your Profile</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.modalInput}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditProfileOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveProfile}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Backend URL Modal */}
      <Modal visible={isUrlModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Configure Backend API</Text>
            <Text style={styles.modalSubtitle}>
              For testing on physical phone via Expo Go, enter your PC's LAN IP (e.g. http://192.168.1.5:5088):
            </Text>

            <TextInput
              style={styles.modalInput}
              value={customUrl}
              onChangeText={setCustomUrl}
              placeholder="http://10.0.2.2:5088"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsUrlModalOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveUrl}>
                <Text style={styles.modalSaveText}>Save URL</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal visible={isLogoutModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.logoutIconWrap}>
              <Ionicons name="log-out-outline" size={32} color={Colors.badgeClosed} />
            </View>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalSubtitle}>
              Are you sure you want to sign out from Dhillon Dhaba? You can sign back in anytime with your mobile number.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsLogoutModalOpen(false)}
                disabled={isLoggingOut}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: Colors.badgeClosed }]}
                onPress={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Sign Out</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  scroll: {
    flex: 1,
    padding: Spacing.md,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  profilePhone: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 1,
  },
  profileEmail: {
    fontSize: 12,
    color: Colors.textLight,
  },
  editBtn: {
    padding: 8,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textLight,
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: 10,
  },
  demoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoCard: {
    backgroundColor: '#FFF8E1',
    borderColor: Colors.accent,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  dhabaName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  dhabaAddress: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 2,
  },
  dhabaHours: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  dhabaPhone: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  loginPill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  loginPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    gap: 8,
  },
  logoutText: {
    color: Colors.badgeClosed,
    fontWeight: '700',
    fontSize: 14,
  },
  versionText: {
    fontSize: 11,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 8,
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.sm,
    padding: 10,
    fontSize: 13,
    color: Colors.text,
    backgroundColor: '#FAFAFA',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: Spacing.lg,
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    color: Colors.textMuted,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: BorderRadius.sm,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logoutIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
});

