// TypeScript type definitions for DemoFlow

export interface Customer {
  logourl: string;
  name: string;
}

export interface Persona {
  name: string;
  pictureurl: string;
  title: string;
  fakeText: string[];
}

export interface Product {
  logourl: string;
  name: string;
}

export interface Step {
  description: string;
  icon: string;
  tabColor: string;
  incognito: boolean;
  onlyShowUrls: boolean;
  persona: string;
  title: string;
  video?: string;
  urls: string[];
}

export interface Theme {
  'brand-color': string;
  'brand-font': string;
  'overlay-background': string;
  'overlay-color': string;
  'overlay-h': string;
  'overlay-scale': string;
  'overlay-v': string;
}

export interface DemoFlowTemplate {
  customer: Customer;
  personas: Record<string, Persona>;
  product: Product;
  steps: Step[];
  theme: Theme;
}

// Extension-specific types
export interface ExtensionMessage {
  type: string;
  payload?: any;
  action?: string;
  tabId?: number;
  code?: string;
  error?: string;
}

export interface UserTemplate {
  name: string;
  data: DemoFlowTemplate;
}

export interface StorageResult {
  [key: string]: any;
}

export interface AuthUser {
  email: string;
  paid: boolean;
  trialStartedAt?: Date;
}

// Utility types for component props
export interface PersonaFieldProps {
  key: string;
  persona: Persona;
}

export interface StepFieldProps {
  title: string;
  description: string;
  urls: string[];
  persona: string;
  icon: string;
  tabColor: string;
  incognito: boolean;
  onlyShowUrls: boolean;
  video?: string;
}

export interface IconData {
  name: string;
  category: string;
}

export interface FormattedIcon {
  [category: string]: IconData[];
}