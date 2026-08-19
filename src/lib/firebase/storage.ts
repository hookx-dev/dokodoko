import { storage } from "./config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * ユーザーのプロフィール画像をアップロードし、ダウンロードURLを返します。
 * @param file アップロードする画像ファイル
 * @param uid ユーザーID
 * @returns 画像の公開URL
 */
export const uploadProfileImage = async (file: File, uid: string): Promise<string> => {
  try {
    // ファイル名にタイムスタンプをつけてキャッシュを防ぐ（またはUIDのみにして上書きする）
    // Firebase AuthのphotoURLとして使うので、上書きで良いが、ブラウザキャッシュ対策にタイムスタンプを含める
    const extension = file.name.split('.').pop();
    const fileName = `profile_${uid}_${Date.now()}.${extension}`;
    const storageRef = ref(storage, `users/${uid}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile image: ", error);
    throw error;
  }
};
