export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  memberRole?: WorkspaceRole;
  memberCount: number;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface WorkspaceDetails extends Workspace {
  memberRole: WorkspaceRole;
  members: WorkspaceMember[];
}

export interface CreateWorkspaceDto {
  name: string;
  logoUrl?: string;
}

export interface UpdateWorkspaceDto {
  name?: string;
  logoUrl?: string;
}
