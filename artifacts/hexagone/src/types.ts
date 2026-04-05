export type LeadCategory = "usa" | "school" | "airbnb" | "youtube" | "urgent" | "general";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  rawText: string;
  category: LeadCategory;
  status: LeadStatus;
  priority: number;
  isVVIP: boolean;
  createdAt: string;
  notes: string;
  strategicHooks: string[];
  source: string;
}

export interface IntelPost {
  id: string;
  rawText: string;
  createdAt: string;
  tag: string;
  excerpt: string;
}

export type ActiveTab = "vvip" | "intelligence" | "ingestion" | "vision";
