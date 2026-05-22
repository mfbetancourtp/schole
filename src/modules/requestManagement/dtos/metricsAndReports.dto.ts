export type RequestStatus = 'approved' | 'rejected' | 'pending' | 'in_review' | 'finalized';
export type TrendDirection = 'up' | 'down';
export type RequestType = 'grade_certificate' | 'enrollment_certificate' | 'peace_and_safe' | 'study_record' | 'graduate_certificate';

export interface SummaryCard {
  label: string;
  value: number;
  description: string;
  trendPercent: number;
  trendDirection: TrendDirection;
  icon: string;
  iconBgColor: string;
  iconColor: string;
}

export interface RequestsByType {
  type: string;
  count: number;
  color: string;
}

export interface RequestsByStatus {
  status: string;
  percentage: number;
  color: string;
}

export interface MonthlyTrend {
  month: string;
  total: number;
  approved: number;
  rejected: number;
}

export interface RequestTypeAnalysis {
  type: string;
  totalRequests: number;
  percentage: number;
  avgResponseTime: string;
  approvalRate: number;
  trend: TrendDirection;
}

export interface HighlightCard {
  icon: string;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: string;
  description: string;
}

export interface MetricsAndReportsData {
  summaryCards: SummaryCard[];
  requestsByType: RequestsByType[];
  requestsByStatus: RequestsByStatus[];
  monthlyTrends: MonthlyTrend[];
  typeAnalysis: RequestTypeAnalysis[];
  highlights: HighlightCard[];
}
