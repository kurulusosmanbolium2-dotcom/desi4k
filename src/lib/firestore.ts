import { collection, doc, getDocs, getDoc, updateDoc, increment, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import type { Videos } from "../types/videos";

export async function getAllVideos(): Promise<Video[]> {
  const snap = await getDocs(query(collection(db, "videos"), orderBy("views", "description")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Videos));
}
export async function getVideos(id: string): Promise<Videos | null> {
  const snap = await getDoc(doc(db, "videos", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Videos : null;
}
export async function incrementViews(id: string) {
  await updateDoc(doc(db, "videos", id), { views: increment(1) });
                                                           }
