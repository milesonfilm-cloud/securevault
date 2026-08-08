export const MEMBER_RELATIONSHIP_VALUES = [
  'Self',
  'Spouse',
  'Son',
  'Daughter',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Grandfather',
  'Grandmother',
  'Other',
] as const;

export type MemberRelationshipValue = (typeof MEMBER_RELATIONSHIP_VALUES)[number];

export function isMemberRelationshipValue(v: string): v is MemberRelationshipValue {
  return (MEMBER_RELATIONSHIP_VALUES as readonly string[]).includes(v);
}
