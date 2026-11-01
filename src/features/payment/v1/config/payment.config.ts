export type FinanceMetricTone = "indigo" | "emerald" | "violet" | "amber";

export interface FinanceMetricConfig {
  title: string;
  value: string;
  growth?: string;
  tone?: FinanceMetricTone;
}

export interface StudentProfileConfig {
  name: string;
  email: string;
  program: string;
  studentId: string;
  avatarUrl: string;
  mobile: string;
  status: string;
}

export interface FeeItemConfig {
  name: string;
  value: string;
  share: number;
  tone: "violet" | "emerald" | "amber" | "sky";
}

export interface PaymentTimelineItemConfig {
  label: string;
  amount: string;
  status: "Paid" | "Pending" | "Scheduled";
  tone: "success" | "warning" | "muted";
}

export const PAYMENT_OVERVIEW_METRICS: FinanceMetricConfig[] = [
  {
    title: "Today's Collection",
    value: "₹12.5L",
    growth: "+12.5%",
    tone: "emerald",
  },
  {
    title: "Outstanding Due",
    value: "₹2.1M",
    growth: "At Risk",
    tone: "amber",
  },
  {
    title: "Scholarships",
    value: "₹1.8M",
    growth: "850 Students",
    tone: "violet",
  },
  {
    title: "Refund Requests",
    value: "42",
    growth: "8 Active",
    tone: "indigo",
  },
];

export const PAYMENT_SUMMARY_METRICS: FinanceMetricConfig[] = [
  {
    title: "Collection",
    value: "5.9%",
    tone: "indigo",
  },
];

export const PAYMENT_STUDENT_PROFILE: StudentProfileConfig = {
  name: "Sanjeev Gupta",
  email: "sanjeevkumardumri@gmail.com",
  program: "Semester 1 • BCA",
  mobile: "+91 9876543210",
  studentId: "EDUVANTA_906953",
  avatarUrl: "https://i.pravatar.cc/240?img=12",
  status: "Active account",
};

export const PAYMENT_FEE_ITEMS: FeeItemConfig[] = [
  {
    name: "Tuition Fee",
    value: "₹100,000",
    share: 58,
    tone: "violet",
  },
  {
    name: "Hostel Fee",
    value: "₹40,000",
    share: 24,
    tone: "emerald",
  },
  {
    name: "Transport",
    value: "₹15,000",
    share: 10,
    tone: "amber",
  },
  {
    name: "Exam Fee",
    value: "₹15,000",
    share: 8,
    tone: "sky",
  },
];

export const PAYMENT_TIMELINE_ITEMS: PaymentTimelineItemConfig[] = [
  {
    label: "Jan 2025",
    amount: "₹5,000 Paid",
    status: "Paid",
    tone: "success",
  },
  {
    label: "Feb 2025",
    amount: "₹5,030 Paid",
    status: "Paid",
    tone: "success",
  },
  {
    label: "Mar 2025",
    amount: "Installment pending",
    status: "Pending",
    tone: "warning",
  },
  {
    label: "Apr 2025",
    amount: "Scheduled follow-up",
    status: "Scheduled",
    tone: "muted",
  },
];

export const PAYMENT_METHODS = [
  "UPI",
  "Card Payment",
  "Online Transfer",
  "Cash",
  "Cheque",
] as const;

export const FEE_TYPES = [
  "Semester Fee",
  "Admission Fee",
  "Exam Fee",
  "Farewell Fee",
  "Teacher Day Fee",
  "Other",
] as const;
