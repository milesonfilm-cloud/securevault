import type { Document, FamilyMember, VaultPermissions, VaultRole } from '@/lib/storage';

/** True when admins should not see or manage this document. */
export function isDocumentHiddenFromAdmin(doc: Document, allMembers: FamilyMember[]): boolean {
  if (doc.isPrivate) return true;
  const owner = allMembers.find((m) => m.id === doc.memberId);
  const privateIds = owner?.permissions?.privateDocumentIds ?? [];
  return privateIds.includes(doc.id);
}

export function canViewDocument(
  doc: Document,
  activeMemberId: string,
  role: VaultRole,
  permissions: VaultPermissions,
  allMembers: FamilyMember[]
): boolean {
  if (role === 'admin') {
    return !isDocumentHiddenFromAdmin(doc, allMembers);
  }
  if (doc.memberId === activeMemberId) return true;
  if (permissions.sharedDocumentIds.includes(doc.id)) return true;
  if (doc.sharedWithMemberIds?.includes(activeMemberId)) return true;
  return false;
}

export function canEditDocument(
  doc: Document,
  activeMemberId: string,
  role: VaultRole,
  permissions: VaultPermissions,
  allMembers: FamilyMember[],
  emergencyReadOnly: boolean
): boolean {
  if (emergencyReadOnly) return false;
  if (role === 'viewer') return false;
  if (role === 'admin') {
    return !isDocumentHiddenFromAdmin(doc, allMembers);
  }
  return doc.memberId === activeMemberId;
}

export function canDeleteDocument(
  doc: Document,
  activeMemberId: string,
  role: VaultRole,
  permissions: VaultPermissions,
  allMembers: FamilyMember[],
  emergencyReadOnly: boolean
): boolean {
  return canEditDocument(doc, activeMemberId, role, permissions, allMembers, emergencyReadOnly);
}

export function canShareDocument(
  doc: Document,
  activeMemberId: string,
  role: VaultRole,
  permissions: VaultPermissions,
  allMembers: FamilyMember[],
  emergencyReadOnly: boolean
): boolean {
  if (emergencyReadOnly) return false;
  if (!permissions.canShare) return false;
  if (role === 'admin') {
    return !isDocumentHiddenFromAdmin(doc, allMembers);
  }
  return doc.memberId === activeMemberId;
}

export function getVisibleDocuments(
  allDocs: Document[],
  activeMemberId: string,
  role: VaultRole,
  permissions: VaultPermissions,
  allMembers: FamilyMember[]
): Document[] {
  return allDocs.filter((d) =>
    canViewDocument(d, activeMemberId, role, permissions, allMembers)
  );
}
