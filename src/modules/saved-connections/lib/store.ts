import { LazyStore } from "@tauri-apps/plugin-store";
import type { SavedData } from "../types";

const STORE_PATH = "terax-saved.json";
const KEY_SAVED = "savedConnections";

export type { SavedData };

export const DEFAULT_SAVED: SavedData = {
  sshHosts: [],
  favoriteCommands: [],
};

const store = new LazyStore(STORE_PATH, { defaults: {}, autoSave: 200 });

export async function loadSaved(): Promise<SavedData> {
  const raw = await store.get<SavedData>(KEY_SAVED);
  if (!raw) return DEFAULT_SAVED;
  return {
    sshHosts: Array.isArray(raw.sshHosts) ? raw.sshHosts : [],
    favoriteCommands: Array.isArray(raw.favoriteCommands)
      ? raw.favoriteCommands
      : [],
  };
}

export async function saveSaved(data: SavedData): Promise<void> {
  await store.set(KEY_SAVED, data);
  await store.save();
}
