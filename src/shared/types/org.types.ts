export type OrgNodeType = 'organization' | 'faculty' | 'department' | 'position';

export interface OrgNode {
  id: string;
  name: string;
  type: OrgNodeType;

  parentId?: string;

  meta?: {
    location?: string;
    director?: string;
    code?: string;
  };

  children?: OrgNode[];
}
