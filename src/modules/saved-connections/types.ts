export type SshAuthType = "key" | "password";

export type SshHost = {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  authType: SshAuthType;
  keyPath: string;
  password: string;
  favorite: boolean;
};

export type FavoriteCommand = {
  id: string;
  name: string;
  command: string;
  description: string;
  category: string;
  favorite: boolean;
};

export type SavedData = {
  sshHosts: SshHost[];
  favoriteCommands: FavoriteCommand[];
};
