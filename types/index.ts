export interface UserCompany {
  id: string;
  name: string;
  role: "superadmin" | "admin" | "contador" | "viewer";
  features: string[];
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superadmin: boolean;
  companies: UserCompany[];
}

export interface Company {
  id: string;
  name: string;
  legal_name: string | null;
  tax_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: "active" | "inactive" | "suspended";
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface Plan {
  id: string;
  name: string;
  type: "basic" | "professional" | "enterprise";
  description: string | null;
  is_active: boolean;
}

export interface Feature {
  id: string;
  key: string;
  name: string;
  description: string | null;
  module: string | null;
  parent_key: string | null;
}

export type SubRole = "admin" | "contador" | "viewer";

export interface SubFeatureStatus {
  feature_id: string;
  key: string;
  name: string;
  module: string | null;
  is_enabled: boolean;
  allowed_roles: SubRole[];
}

export interface FeatureStatus {
  feature_id: string;
  key: string;
  name: string;
  module: string | null;
  is_enabled: boolean;
  children: SubFeatureStatus[];
}

export interface CompanyFeaturesResponse {
  company_id: string;
  features: FeatureStatus[];
}

export interface UserCompanyRole {
  user_id: string;
  company_id: string;
  role: "admin" | "contador" | "viewer";
  is_active: boolean;
  user: User;
  company?: { id: string; name: string };
}

export type Role = "superadmin" | "admin" | "contador" | "viewer";
