import { 
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from "firebase/auth";
import { auth } from "./config";

// パスワードリセットメールの送信
export const resetPassword = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

// 表示名の更新
export const updateUserProfile = async (user: User, displayName: string) => {
  return updateProfile(user, { displayName });
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
