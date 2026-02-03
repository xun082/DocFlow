export interface GetTraceParams {
  days: number;
}

export type Metric = {
  current: number;
  change: number;
  trend: number;
};

export type AnalyticsData = {
  pageviews: Metric;
  visitors: Metric;
  visits: Metric;
  avgDuration: Metric;
  bounceRate: Metric;
};
