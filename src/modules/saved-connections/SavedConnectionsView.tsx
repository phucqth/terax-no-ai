import {
  ServerStack03Icon,
  CommandIcon,
  Add01Icon,
  Edit02Icon,
  Delete02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSavedConnectionsStore } from "./lib/useSavedConnections";
import type { SshHost, FavoriteCommand } from "./types";

type TabId = "ssh" | "commands";

export function SavedConnectionsView() {
  const init = useSavedConnectionsStore((s) => s.init);
  const hydrated = useSavedConnectionsStore((s) => s.hydrated);

  useEffect(() => {
    void init();
  }, [init]);

  const [activeTab, setActiveTab] = useState<TabId>("ssh");

  if (!hydrated) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-8 shrink-0 items-center border-b border-border/60 px-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Saved
        </span>
      </div>

      <div className="flex shrink-0 gap-0 border-b border-border/60 px-2">
        <TabButton
          active={activeTab === "ssh"}
          onClick={() => setActiveTab("ssh")}
          icon={ServerStack03Icon}
          label="SSH"
        />
        <TabButton
          active={activeTab === "commands"}
          onClick={() => setActiveTab("commands")}
          icon={CommandIcon}
          label="Commands"
        />
      </div>

      <ScrollArea className="flex-1">
        {activeTab === "ssh" ? <SshHostsSection /> : <CommandsSection />}
      </ScrollArea>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"];
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-[11px] font-medium transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      <HugeiconsIcon icon={icon} size={14} strokeWidth={active ? 2 : 1.6} />
      {label}
    </button>
  );
}

function SshHostsSection() {
  const hosts = useSavedConnectionsStore((s) => s.sshHosts);
  const removeSshHost = useSavedConnectionsStore((s) => s.removeSshHost);
  const toggleSshFavorite = useSavedConnectionsStore(
    (s) => s.toggleSshFavorite,
  );
  const [editHost, setEditHost] = useState<SshHost | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const sorted = useMemo(
    () => [...hosts].sort((a, b) => (a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1)),
    [hosts],
  );

  return (
    <div className="flex flex-col gap-1 p-2">
      {sorted.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground">
            <HugeiconsIcon icon={ServerStack03Icon} size={20} strokeWidth={1.6} />
          </div>
          <div className="text-sm font-medium">No SSH hosts</div>
          <div className="max-w-48 text-[11px] leading-relaxed text-muted-foreground">
            Save your frequently used SSH connections for quick access.
          </div>
        </div>
      )}
      {sorted.map((host) => (
        <SshHostRow
          key={host.id}
          host={host}
          onEdit={setEditHost}
          onRemove={removeSshHost}
          onToggleFavorite={toggleSshFavorite}
        />
      ))}
      <Button
        variant="outline"
        size="sm"
        className="mt-1 gap-1.5"
        onClick={() => setShowAdd(true)}
      >
        <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
        Add SSH Host
      </Button>

      <SshHostDialog
        open={showAdd || editHost !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAdd(false);
            setEditHost(null);
          }
        }}
        initial={editHost}
      />
    </div>
  );
}

function SshHostRow({
  host,
  onEdit,
  onRemove,
  onToggleFavorite,
}: {
  host: SshHost;
  onEdit: (h: SshHost) => void;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border/60 hover:bg-accent/40">
      <button
        type="button"
        onClick={() => onToggleFavorite(host.id)}
        className={cn(
          "shrink-0 transition-colors",
          host.favorite
            ? "text-amber-400"
            : "text-muted-foreground/40 opacity-0 group-hover:opacity-100",
        )}
      >
        <HugeiconsIcon
          icon={StarIcon}
          size={13}
          strokeWidth={host.favorite ? 2.5 : 1.6}
        />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-medium">{host.name}</div>
        <div className="truncate text-[10.5px] text-muted-foreground">
          {host.username}@{host.host}:{host.port}
        </div>
      </div>
      <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onEdit(host)}
        >
          <HugeiconsIcon icon={Edit02Icon} size={12} strokeWidth={2} />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemove(host.id)}
        >
          <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

function SshHostDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: SshHost | null;
}) {
  const addSshHost = useSavedConnectionsStore((s) => s.addSshHost);
  const updateSshHost = useSavedConnectionsStore((s) => s.updateSshHost);

  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("22");
  const [username, setUsername] = useState("");
  const [authType, setAuthType] = useState<"key" | "password">("key");
  const [keyPath, setKeyPath] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setHost(initial?.host ?? "");
      setPort(String(initial?.port ?? 22));
      setUsername(initial?.username ?? "");
      setAuthType(initial?.authType ?? "key");
      setKeyPath(initial?.keyPath ?? "");
    }
  }, [open, initial]);

  const handleSave = useCallback(() => {
    if (!name.trim() || !host.trim() || !username.trim()) return;
    const data = {
      name: name.trim(),
      host: host.trim(),
      port: Math.max(1, Math.min(65535, Number(port) || 22)),
      username: username.trim(),
      authType,
      keyPath: keyPath.trim(),
      favorite: initial?.favorite ?? false,
    };
    if (initial) {
      updateSshHost(initial.id, data);
    } else {
      addSshHost(data);
    }
    onOpenChange(false);
  }, [name, host, port, username, authType, keyPath, initial, addSshHost, updateSshHost, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit SSH Host" : "Add SSH Host"}</DialogTitle>
          <DialogDescription>
            Save an SSH connection for quick access.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Display Name</Label>
            <Input
              placeholder="My Server"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Host</Label>
            <Input
              placeholder="example.com or 192.168.1.1"
              value={host}
              onChange={(e) => setHost(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Port</Label>
              <Input
                type="number"
                placeholder="22"
                value={port}
                onChange={(e) => setPort(e.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Username</Label>
              <Input
                placeholder="root"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Auth Type</Label>
            <Select
              value={authType}
              onValueChange={(v) => setAuthType(v as "key" | "password")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="key">SSH Key</SelectItem>
                <SelectItem value="password">Password</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {authType === "key" && (
            <div className="flex flex-col gap-1.5">
              <Label>Key Path</Label>
              <Input
                placeholder="~/.ssh/id_ed25519"
                value={keyPath}
                onChange={(e) => setKeyPath(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {initial ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CommandsSection() {
  const cmds = useSavedConnectionsStore((s) => s.favoriteCommands);
  const removeCommand = useSavedConnectionsStore((s) => s.removeCommand);
  const toggleCommandFavorite = useSavedConnectionsStore(
    (s) => s.toggleCommandFavorite,
  );
  const [editCmd, setEditCmd] = useState<FavoriteCommand | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const sorted = useMemo(
    () => [...cmds].sort((a, b) => (a.favorite === b.favorite ? 0 : a.favorite ? -1 : 1)),
    [cmds],
  );

  return (
    <div className="flex flex-col gap-1 p-2">
      {sorted.length === 0 && (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <div className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground">
            <HugeiconsIcon icon={CommandIcon} size={20} strokeWidth={1.6} />
          </div>
          <div className="text-sm font-medium">No saved commands</div>
          <div className="max-w-48 text-[11px] leading-relaxed text-muted-foreground">
            Save your frequently used shell commands for quick reuse.
          </div>
        </div>
      )}
      {sorted.map((cmd) => (
        <CommandRow
          key={cmd.id}
          cmd={cmd}
          onEdit={setEditCmd}
          onRemove={removeCommand}
          onToggleFavorite={toggleCommandFavorite}
        />
      ))}
      <Button
        variant="outline"
        size="sm"
        className="mt-1 gap-1.5"
        onClick={() => setShowAdd(true)}
      >
        <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2} />
        Add Command
      </Button>

      <CommandDialog
        open={showAdd || editCmd !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAdd(false);
            setEditCmd(null);
          }
        }}
        initial={editCmd}
      />
    </div>
  );
}

function CommandRow({
  cmd,
  onEdit,
  onRemove,
  onToggleFavorite,
}: {
  cmd: FavoriteCommand;
  onEdit: (c: FavoriteCommand) => void;
  onRemove: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="group flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border/60 hover:bg-accent/40">
      <button
        type="button"
        onClick={() => onToggleFavorite(cmd.id)}
        className={cn(
          "shrink-0 transition-colors",
          cmd.favorite
            ? "text-amber-400"
            : "text-muted-foreground/40 opacity-0 group-hover:opacity-100",
        )}
      >
        <HugeiconsIcon
          icon={StarIcon}
          size={13}
          strokeWidth={cmd.favorite ? 2.5 : 1.6}
        />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-medium">{cmd.name}</div>
        <div className="truncate text-[10.5px] text-muted-foreground">
          {cmd.command}
        </div>
      </div>
      <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onEdit(cmd)}
        >
          <HugeiconsIcon icon={Edit02Icon} size={12} strokeWidth={2} />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemove(cmd.id)}
        >
          <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
}

function CommandDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: FavoriteCommand | null;
}) {
  const addCommand = useSavedConnectionsStore((s) => s.addCommand);
  const updateCommand = useSavedConnectionsStore((s) => s.updateCommand);

  const [name, setName] = useState("");
  const [command, setCommand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setCommand(initial?.command ?? "");
      setCategory(initial?.category ?? "");
      setDescription(initial?.description ?? "");
    }
  }, [open, initial]);

  const handleSave = useCallback(() => {
    if (!name.trim() || !command.trim()) return;
    const data = {
      name: name.trim(),
      command: command.trim(),
      category: category.trim(),
      description: description.trim(),
      favorite: initial?.favorite ?? false,
    };
    if (initial) {
      updateCommand(initial.id, data);
    } else {
      addCommand(data);
    }
    onOpenChange(false);
  }, [name, command, category, description, initial, addCommand, updateCommand, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Command" : "Add Command"}</DialogTitle>
          <DialogDescription>
            Save a shell command for quick reuse.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Name</Label>
            <Input
              placeholder="Docker ps"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Command</Label>
            <Input
              placeholder="docker ps -a --format 'table {{.Names}}\t{{.Status}}'"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label>Category</Label>
              <Input
                placeholder="Docker"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Description (optional)</Label>
            <Input
              placeholder="List all containers"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {initial ? "Save" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
