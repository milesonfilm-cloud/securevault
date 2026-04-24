export type HandoverPayload = {
  generatedAt: string;
  documents: {
    title: string;
    categoryId: string;
    memberName: string;
    fields: Record<string, string>;
    notes: string;
  }[];
};
