/** One day of GitHub contributions. */
export type Activity = {
  date: string;
  count: number;
  /** 0 (none) to 4 (most), as GitHub buckets it. */
  level: number;
};
