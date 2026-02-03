import type { LucideIcon } from 'lucide-react';

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
  textColor: string;
}

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary' | 'default';
}

export interface ContactMethod {
  type: string;
  title: string;
  description: string;
  buttonText: string;
  gradient: string;
  hoverBorder: string;
  hoverShadow: string;
  href: string;
  delay: string;
}
