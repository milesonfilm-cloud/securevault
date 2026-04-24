'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useVaultData } from '@/context/VaultDataContext';
import {
  defaultPermissions,
  type Document,
  type FamilyMember,
  type VaultPermissions,
  type VaultRole,
} from '@/lib/storage';
import {
  canDeleteDocument,
  canEditDocument,
  canShareDocument,
  canViewDocument,
  getVisibleDocuments,
} from '@/lib/permissions/vaultPermissions';
import { verifyMemberPin } from '@/lib/permissions/memberPin';

const ACTIVE_MEMBER_STORAGE_KEY = 'sv_active_member';

export type VaultPermissionAction = 'export' | 'share' | 'edit' | 'delete';

type VaultPermissionsContextValue = {
  activeMemberId: string | null;
  activeMember: FamilyMember | null;
  activeRole: VaultRole;
  permissions: VaultPermissions;
  visibleDocuments: Document[];
  emergencyReadOnly: boolean;
  setActiveMemberId: (id: string) => void;
  switchMember: (memberId: string, pin?: string) => Promise<boolean>;
  hasPermission: (action: VaultPermissionAction, docId?: string) => boolean;
  canViewDocumentForActive: (doc: Document) => boolean;
  canEditDocumentForActive: (doc: Document) => boolean;
  canDeleteDocumentForActive: (doc: Document) => boolean;
  canShareDocumentForActive: (doc: Document) => boolean;
};

const VaultPermissionsContext = createContext<VaultPermissionsContextValue | null>(null);

function readStoredActiveMemberId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_MEMBER_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredActiveMemberId(id: string) {
  try {
    localStorage.setItem(ACTIVE_MEMBER_STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function VaultPermissionsProvider({ children }: { children: React.ReactNode }) {
  const { vaultData, loading } = useVaultData();
  const [activeMemberId, setActiveMemberIdState] = useState<string | null>(null);

  const emergencyReadOnly = vaultData.settings.emergencyModeEnabled;

  useEffect(() => {
    if (loading) return;
    const members = vaultData.members;
    if (members.length === 0) {
      setActiveMemberIdState(null);
      return;
    }

    const stored = readStoredActiveMemberId();
    const storedValid = stored && members.some((m) => m.id === stored);
    if (storedValid) {
      setActiveMemberIdState(stored);
      return;
    }

    const adminFirst = members.find((m) => m.permissions?.role === 'admin');
    const fallback = adminFirst?.id ?? members[0].id;
    setActiveMemberIdState(fallback);
    writeStoredActiveMemberId(fallback);
  }, [loading, vaultData.members]);

  const setActiveMemberId = useCallback((id: string) => {
    setActiveMemberIdState(id);
    writeStoredActiveMemberId(id);
  }, []);

  const activeMember = useMemo(
    () => vaultData.members.find((m) => m.id === activeMemberId) ?? null,
    [vaultData.members, activeMemberId]
  );

  const permissions: VaultPermissions = useMemo(
    () => activeMember?.permissions ?? defaultPermissions('admin'),
    [activeMember]
  );

  const activeRole = permissions.role;

  const visibleDocuments = useMemo(() => {
    if (!activeMemberId) return [];
    return getVisibleDocuments(
      vaultData.documents,
      activeMemberId,
      activeRole,
      permissions,
      vaultData.members
    );
  }, [vaultData.documents, vaultData.members, activeMemberId, activeRole, permissions]);

  const switchMember = useCallback(
    async (memberId: string, pin?: string): Promise<boolean> => {
      const target = vaultData.members.find((m) => m.id === memberId);
      if (!target) return false;
      if (target.pinHash) {
        if (pin == null || pin === '') return false;
        const ok = await verifyMemberPin(pin, target.pinHash);
        if (!ok) return false;
      }
      setActiveMemberId(memberId);
      return true;
    },
    [vaultData.members, setActiveMemberId]
  );

  const canViewDocumentForActive = useCallback(
    (doc: Document) => {
      if (!activeMemberId) return false;
      return canViewDocument(doc, activeMemberId, activeRole, permissions, vaultData.members);
    },
    [activeMemberId, activeRole, permissions, vaultData.members]
  );

  const canEditDocumentForActive = useCallback(
    (doc: Document) => {
      if (!activeMemberId) return false;
      return canEditDocument(
        doc,
        activeMemberId,
        activeRole,
        permissions,
        vaultData.members,
        emergencyReadOnly
      );
    },
    [activeMemberId, activeRole, permissions, vaultData.members, emergencyReadOnly]
  );

  const canDeleteDocumentForActive = useCallback(
    (doc: Document) => {
      if (!activeMemberId) return false;
      return canDeleteDocument(
        doc,
        activeMemberId,
        activeRole,
        permissions,
        vaultData.members,
        emergencyReadOnly
      );
    },
    [activeMemberId, activeRole, permissions, vaultData.members, emergencyReadOnly]
  );

  const canShareDocumentForActive = useCallback(
    (doc: Document) => {
      if (!activeMemberId) return false;
      return canShareDocument(
        doc,
        activeMemberId,
        activeRole,
        permissions,
        vaultData.members,
        emergencyReadOnly
      );
    },
    [activeMemberId, activeRole, permissions, vaultData.members, emergencyReadOnly]
  );

  const hasPermission = useCallback(
    (action: VaultPermissionAction, docId?: string): boolean => {
      if (emergencyReadOnly) return false;
      const doc = docId ? vaultData.documents.find((d) => d.id === docId) : undefined;
      switch (action) {
        case 'export':
          return permissions.canExport;
        case 'share':
          return !!doc && canShareDocumentForActive(doc);
        case 'edit':
          return !!doc && canEditDocumentForActive(doc);
        case 'delete':
          return !!doc && canDeleteDocumentForActive(doc);
        default:
          return false;
      }
    },
    [
      emergencyReadOnly,
      permissions.canExport,
      vaultData.documents,
      canShareDocumentForActive,
      canEditDocumentForActive,
      canDeleteDocumentForActive,
    ]
  );

  const value: VaultPermissionsContextValue = useMemo(
    () => ({
      activeMemberId,
      activeMember,
      activeRole,
      permissions,
      visibleDocuments,
      emergencyReadOnly,
      setActiveMemberId,
      switchMember,
      hasPermission,
      canViewDocumentForActive,
      canEditDocumentForActive,
      canDeleteDocumentForActive,
      canShareDocumentForActive,
    }),
    [
      activeMemberId,
      activeMember,
      activeRole,
      permissions,
      visibleDocuments,
      emergencyReadOnly,
      setActiveMemberId,
      switchMember,
      hasPermission,
      canViewDocumentForActive,
      canEditDocumentForActive,
      canDeleteDocumentForActive,
      canShareDocumentForActive,
    ]
  );

  return (
    <VaultPermissionsContext.Provider value={value}>{children}</VaultPermissionsContext.Provider>
  );
}

export function useVaultPermissions(): VaultPermissionsContextValue {
  const ctx = useContext(VaultPermissionsContext);
  if (!ctx) {
    throw new Error('useVaultPermissions must be used within VaultPermissionsProvider');
  }
  return ctx;
}
