import { create } from "zustand";
import {
  DEFAULT_SAVED,
  loadSaved,
  saveSaved,
  type SavedData,
} from "./store";
import type { SshHost, FavoriteCommand } from "../types";

let nextId = 1;
function genId(): string {
  return `sc_${nextId++}_${Date.now()}`;
}

type State = SavedData & {
  hydrated: boolean;
  init: () => Promise<void>;
  addSshHost: (host: Omit<SshHost, "id">) => void;
  updateSshHost: (id: string, data: Partial<SshHost>) => void;
  removeSshHost: (id: string) => void;
  toggleSshFavorite: (id: string) => void;
  addCommand: (cmd: Omit<FavoriteCommand, "id">) => void;
  updateCommand: (id: string, data: Partial<FavoriteCommand>) => void;
  removeCommand: (id: string) => void;
  toggleCommandFavorite: (id: string) => void;
  reorderSshHosts: (hosts: SshHost[]) => void;
  reorderCommands: (cmds: FavoriteCommand[]) => void;
};

let initialized = false;

export const useSavedConnectionsStore = create<State>()((set, get) => ({
  ...DEFAULT_SAVED,
  hydrated: false,
  init: async () => {
    if (initialized) return;
    initialized = true;
    const data = await loadSaved();
    set({ ...data, hydrated: true });
  },
  addSshHost: (host: Omit<SshHost, "id">) => {
    const hosts = [...get().sshHosts, { ...host, id: genId() }];
    set({ sshHosts: hosts });
    void saveSaved({ sshHosts: hosts, favoriteCommands: get().favoriteCommands });
  },
  updateSshHost: (id: string, data: Partial<SshHost>) => {
    const hosts = get().sshHosts.map((h: SshHost) =>
      h.id === id ? { ...h, ...data } : h,
    );
    set({ sshHosts: hosts });
    void saveSaved({ sshHosts: hosts, favoriteCommands: get().favoriteCommands });
  },
  removeSshHost: (id: string) => {
    const hosts = get().sshHosts.filter((h: SshHost) => h.id !== id);
    set({ sshHosts: hosts });
    void saveSaved({ sshHosts: hosts, favoriteCommands: get().favoriteCommands });
  },
  toggleSshFavorite: (id: string) => {
    const hosts = get().sshHosts.map((h: SshHost) =>
      h.id === id ? { ...h, favorite: !h.favorite } : h,
    );
    set({ sshHosts: hosts });
    void saveSaved({ sshHosts: hosts, favoriteCommands: get().favoriteCommands });
  },
  addCommand: (cmd: Omit<FavoriteCommand, "id">) => {
    const cmds = [...get().favoriteCommands, { ...cmd, id: genId() }];
    set({ favoriteCommands: cmds });
    void saveSaved({ sshHosts: get().sshHosts, favoriteCommands: cmds });
  },
  updateCommand: (id: string, data: Partial<FavoriteCommand>) => {
    const cmds = get().favoriteCommands.map((c: FavoriteCommand) =>
      c.id === id ? { ...c, ...data } : c,
    );
    set({ favoriteCommands: cmds });
    void saveSaved({ sshHosts: get().sshHosts, favoriteCommands: cmds });
  },
  removeCommand: (id: string) => {
    const cmds = get().favoriteCommands.filter((c: FavoriteCommand) => c.id !== id);
    set({ favoriteCommands: cmds });
    void saveSaved({ sshHosts: get().sshHosts, favoriteCommands: cmds });
  },
  toggleCommandFavorite: (id: string) => {
    const cmds = get().favoriteCommands.map((c: FavoriteCommand) =>
      c.id === id ? { ...c, favorite: !c.favorite } : c,
    );
    set({ favoriteCommands: cmds });
    void saveSaved({ sshHosts: get().sshHosts, favoriteCommands: cmds });
  },
  reorderSshHosts: (hosts: SshHost[]) => {
    set({ sshHosts: hosts });
    void saveSaved({ sshHosts: hosts, favoriteCommands: get().favoriteCommands });
  },
  reorderCommands: (cmds: FavoriteCommand[]) => {
    set({ favoriteCommands: cmds });
    void saveSaved({ sshHosts: get().sshHosts, favoriteCommands: cmds });
  },
}));
