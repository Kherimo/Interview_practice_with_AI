import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../context/AuthContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import BackgroundContainer from '../../../components/common/BackgroundContainer';
import ConfirmPopup from '../../../components/common/ConfirmPopup';
import InfoPopup from '../../../components/common/InfoPopup';
import { IconWrapper } from '../../../components/common/IconWrapper';


export default function SettingsScreen() {
  const router = useRouter();
  // const { signOut, isLoading: authLoading } = useAuth();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  
  /**
   * Xử lý quá trình đăng xuất:
   * 1. Cập nhật trạng thái local isSigningOut để hiển thị loading chỉ khi đăng xuất
   * 2. Gọi hàm signOut() từ AuthContext để:
   *    - Xóa dữ liệu người dùng khỏi AsyncStorage (USER_STORAGE_KEY, TOKEN_STORAGE_KEY)
   *    - Đặt lại trạng thái người dùng thành null
   *    - Điều hướng người dùng về màn hình đăng nhập (./auth/login)
   * 3. Đóng popup xác nhận đăng xuất
   * 4. Xử lý bất kỳ lỗi nào xảy ra trong quá trình đăng xuất
   * 5. Đặt lại trạng thái isSigningOut khi kết thúc
   */
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true); // Bắt đầu quá trình đăng xuất - hiển thị loading
      await signOut();
      setShowLogoutConfirm(false);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false); // Kết thúc quá trình đăng xuất - ẩn loading
    }
  };
  
  const handleDeleteAccount = () => {
    // Implement account deletion logic here
    setShowDeleteConfirm(false);
    console.log('Account deletion would happen here');
    // Show info popup after deletion to confirm
    setShowInfo(true);
    // After account deletion, you might want to sign out
    // signOut();
  };
  
  const handleEditProfile = () => {
    router.push('/settings/edit-profile');
  };

  return (
    <BackgroundContainer withOverlay={false}>
      <StatusBar barStyle="light-content" />
      
      {/* Confirm Logout Popup 
       * - Hiển thị khi người dùng nhấn nút đăng xuất
       * - Yêu cầu xác nhận trước khi đăng xuất khỏi tài khoản
       * - Khi người dùng xác nhận, gọi handleSignOut() để xử lý đăng xuất
       * - Khi người dùng hủy, đóng popup (setShowLogoutConfirm(false))
       */}
      <ConfirmPopup
        visible={showLogoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?"
        confirmText="Đăng xuất"
        onConfirm={handleSignOut}
        onCancel={() => setShowLogoutConfirm(false)}
        overlayOpacity={0.7}
      />

      {/* Confirm Delete Account Popup */}
      <ConfirmPopup
        visible={showDeleteConfirm}
        title="Xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn."
        confirmText="Xóa tài khoản"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        isDestructive={true}
      />
      
      {/* Info Popup - shown after account deletion */}
      <InfoPopup
        visible={showInfo}
        title="Tài khoản đã xóa"
        message="Tài khoản của bạn đã được xóa thành công. Cảm ơn bạn đã sử dụng ứng dụng của chúng tôi!"
        onClose={() => {
          setShowInfo(false);
          signOut(); // Sign out after showing the message
        }}
        type="success"
      />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{flexGrow: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cài đặt</Text>
        </View>
        
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Image source={require('../../../assets/images/default-avatar.png')} style={styles.avatarImage} />
            </View>
          </View>
          
          <Text style={styles.profileName}>
            Sarah Johnson
          </Text>
          
          <Text style={styles.profileEmail}>
            Sarah.Johnson@gmail.com
          </Text>
          
          <View style={styles.profileInfoRow}>
            <View style={styles.profileInfoItem}>
              <Text style={styles.profileInfoLabel}>Nghề nghiệp</Text>
              <Text style={styles.profileInfoValue}>Software Engineer</Text>
            </View>
            
            <View style={styles.profileInfoItem}>
              <Text style={styles.profileInfoLabel}>Kinh nghiệm</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Mid-Level</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Settings Options */}
        <View style={styles.optionsContainer}>
          {/* Edit Profile */}
          <TouchableOpacity style={styles.optionItem} onPress={handleEditProfile}>
            <View style={styles.optionIconContainer}>
              <IconWrapper Component={Ionicons} name="pencil" size={22} color="#fff" />
            </View>
            <Text style={styles.optionText}>Chỉnh sửa hồ sơ</Text>
            <IconWrapper Component={Ionicons} name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          
          {/* Change Language */}
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => router.push('/settings/change-language')}
          >
            <View style={[styles.optionIconContainer, {backgroundColor: 'rgba(255,255,255,0.25)'}]}>
              <IconWrapper Component={FontAwesome5} name="globe" size={22} color="#fff" />
            </View>
            <Text style={styles.optionText}>Thay đổi ngôn ngữ</Text>
            <IconWrapper Component={Ionicons} name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          
          {/* Change Password */}
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => router.push('/settings/reset-password')}
          >
            <View style={[styles.optionIconContainer, {backgroundColor: 'rgba(255,255,255,0.25)'}]}>
              <IconWrapper Component={FontAwesome5} name="lock" size={22} color="#fff" />
            </View>
            <Text style={styles.optionText}>Đổi mật khẩu</Text>
            <IconWrapper Component={Ionicons} name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          
          {/* Notifications */}
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => router.push('/settings/notification-settings')}
          >
            <View style={[styles.optionIconContainer, {backgroundColor: 'rgba(255,255,255,0.25)'}]}>
              <IconWrapper Component={FontAwesome5} name="bell" size={22} color="#fff" />
            </View>
            <Text style={styles.optionText}>Cài đặt thông báo</Text>
            <IconWrapper Component={Ionicons} name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          
          {/* About */}
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => router.push('/settings/information')}
          >
            <View style={[styles.optionIconContainer, {backgroundColor: 'rgba(255,255,255,0.25)'}]}>
              <IconWrapper Component={Ionicons} name="information-circle" size={22} color="#fff" />
            </View>
            <Text style={styles.optionText}>Thông tin</Text>
            <IconWrapper Component={Ionicons} name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        
        {/* Action buttons: Delete account & Logout */}
        <View style={styles.actionButtons}>
          {/* Delete Account button - hiển thị popup xác nhận trước khi xóa */}
          <TouchableOpacity 
            style={styles.deleteAccountButton}
            onPress={() => setShowDeleteConfirm(true)}
          >
            <Text style={styles.deleteAccountButtonText}>Xóa tài khoản</Text>
          </TouchableOpacity>
          
          {/* Logout button - hiển thị popup xác nhận trước khi đăng xuất
           * - Khi được nhấn, hiển thị popup xác nhận (showLogoutConfirm = true)
           * - Disable button khi đang trong quá trình xử lý (isSigningOut = true)
           * - Sử dụng ActivityIndicator để hiển thị trạng thái loading
           */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => setShowLogoutConfirm(true)}
            disabled={isSigningOut}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      
    </BackgroundContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    // backgroundColor: 'rgba(217, 217, 217, 0.15)',
    // borderBottomLeftRadius: 12,
    // borderBottomRightRadius: 12,
    // marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  profileCard: {
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    marginVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#5ee7d9',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    position: 'absolute',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  profileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  profileInfoItem: {
    alignItems: 'flex-start',
  },
  profileInfoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  profileInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  levelBadge: {
    backgroundColor: '#5ee7d9',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 16,
  },
  levelText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  optionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 24,
  },
  deleteAccountButton: {
    flex: 1,
    backgroundColor: 'rgba(222,143,74,0.3)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  deleteAccountButtonText: {
    color: '#FF5A5A',
    fontWeight: '600',
    fontSize: 15,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: 'rgba(74,222,222,0.4)',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  logoutButtonText: {
    color: '#FF5A5A',
    fontWeight: '600',
    fontSize: 15,
  },
  bottomPadding: {
    height: 90,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 10, 60, 0.9)',
    borderTopWidth: 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabMiddleItem: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: -15,
  },
  tabMiddleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5ee7d9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});
