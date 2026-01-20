export interface PropertySuggestion {
  value: string;
  label: string;
}

export interface TypeSuggestion {
  value: string;
}

export interface PropertyFilter {
  property: string | null;
  compare: any;
}

export interface EventFilter {
  type: string | null;
  properties: PropertyFilter[];
}
