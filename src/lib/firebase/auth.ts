import { 
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  deleteUser as deleteAuthUser
} from "firebase/auth";
import { auth } from "./config";
import { updateUserDocument } from "./firestore";

// パスワードリセットメールの送信
export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

// 表示名の更新
export const updateUserProfile = async (user: User, displayName: string, photoURL?: string) => {
  const profileData: { displayName?: string; photoURL?: string } = {};
  if (displayName) profileData.displayName = displayName;
  if (photoURL) profileData.photoURL = photoURL;
  
  await updateProfile(user, profileData);
  await updateUserDocument(user.uid, profileData);
};

// 再認証
export const reauthenticate = async (user: User, currentPassword: string) => {
  if (!user.email) throw new Error("No email found for user");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  return reauthenticateWithCredential(user, credential);
};

// メールアドレスの更新
export const updateUserEmail = async (user: User, newEmail: string) => {
  return updateEmail(user, newEmail);
};

// パスワードの更新
export const updateUserPassword = async (user: User, newPassword: string) => {
  return updatePassword(user, newPassword);
};

// アカウントの削除
export const deleteAccount = async (user: User) => {
  return deleteAuthUser(user);
};
