import { collection, doc, getDocs, getDoc, updateDoc, increment, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import type { Video } from "../types/video";

export async function getAllVideos(): Promise<Video[]> {
  const snap = await getDocs(query(collection(db, "videos"), orderBy("views", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Video));
}

export async function getVideo(id: string): Promise<Video | null> {
  const snap = await getDoc(doc(db, "videos", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Video : null;
}

export async function incrementViews(id: string): Promise<void> {
  await updateDoc(doc(db, "videos", id), { views: increment(1) });
}
