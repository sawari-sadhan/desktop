export interface ColumnDetail {
  column_name: string;
  data_type: string;
  is_nullable: boolean;
}

export interface TableOverview {
  table_schema: string;
  table_name: string;
  columns?: ColumnDetail[];
}

export interface TypeDefinition {
  code: string;
  name: string;
  schema: any;
}

export interface LinkRule {
  source_type: string;
  target_type: string;
  link_type: string;
}

export interface OntologyIndex {
  types: Record<string, TypeDefinition>;
  link_rules: LinkRule[];
  tables: TableOverview[];
}

export interface OntologyResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}
