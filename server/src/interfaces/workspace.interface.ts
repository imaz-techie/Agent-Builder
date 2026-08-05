import { WorkspaceRole, ApiKeyPermission, InviteStatus } from "@prisma/client";

export interface CreateWorkspaceDTO {
  name: string;
  logoUrl?: string;
}

export interface UpdateWorkspaceDTO {
  name?: string;
  logoUrl?: string;
}

export interface InviteMemberDTO {
  email: string;
  role?: WorkspaceRole;
}

export interface UpdateMemberRoleDTO {
  role: WorkspaceRole;
}

export interface CreateApiKeyDTO {
  name: string;
  permissions?: ApiKeyPermission[];
  expiresInDays?: number;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  memberRole?: WorkspaceRole;
  memberCount?: number;
}

export interface WorkspaceMemberResponse {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface WorkspaceInviteResponse {
  id: string;
  email: string;
  role: WorkspaceRole;
  status: InviteStatus;
  expiresAt: Date;
  createdAt: Date;
}

export interface ApiKeyCreatedResponse {
  id: string;
  name: string;
  keyPrefix: string;
  secretKey: string; // Only returned once upon creation
  permissions: ApiKeyPermission[];
  createdAt: Date;
}

export interface ApiKeyListItemResponse {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: ApiKeyPermission[];
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}
