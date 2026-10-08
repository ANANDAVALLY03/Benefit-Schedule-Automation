import {
  LayoutDashboard,
  FileText,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  Layers3,
  DollarSign,
  FileCheck2,
} from "lucide-react";

export const menuConfig = {
  Admin: [
    {
      name: "Overview",
      route: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      route: "/admin/users",
      icon: LayoutDashboard,
    },
    {
      name: "Roles",
      route: "/admin/roles",
      icon: LayoutDashboard,
    },
  ],

  Underwriter: [
    {
      name: "Overview",
      route: "/underwriter",
      icon: LayoutDashboard,
    },
    {
      name: "Documents",
      route: "/underwriter/documents",
      icon: FileText,
    },
    {
      name: "Benefits",
      route: "/underwriter/benefits",
      icon: HeartPulse,
    },
    {
      name: "Validations",
      route: "/underwriter/validations",
      icon: CheckCircle2,
    },
    {
      name: "Exceptions",
      route: "/underwriter/exceptions",
      icon: AlertTriangle,
    },
    {
      name: "Underwriting",
      route: "/underwriter/work",
      icon: ClipboardCheck,
    },
    {
      name: "Options",
      route: "/underwriter/options",
      icon: Layers3,
    },
    {
      name: "Pricing",
      route: "/underwriter/pricing",
      icon: DollarSign,
    },
    {
      name: "Sales Approval",
      route: "/underwriter/sales-approval",
      icon: FileCheck2,
    },
  ],

  Sales: [
    {
      name: "Overview",
      route: "/sales",
      icon: LayoutDashboard,
    },
    {
      name: "Sales Approval",
      route: "/sales/approval",
      icon: CheckCircle2,
    },
    {
      name: "Client Documents",
      route: "/sales/documents",
      icon: FileText,
    },
  ],

  Tech: [
    {
      name: "Overview",
      route: "/tech",
      icon: LayoutDashboard,
    },
    {
      name: "BenefitSync",
      route: "/tech/benefitsync",
      icon: Layers3,
    },
    {
      name: "ProHealth Mapping",
      route: "/tech/mapping",
      icon: ClipboardCheck,
    },
    {
      name: "Validation",
      route: "/tech/validation",
      icon: CheckCircle2,
    },
    {
      name: "Staging",
      route: "/tech/staging",
      icon: FileCheck2,
    },
  ],
};