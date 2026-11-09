export type ExperiencePosition = {
  id: string;
  title: string;
  /**
   * Employment period of the position.
   * Use "MM.YYYY" or "YYYY" format. Omit `end` for current roles.
   */
  employmentPeriod: {
    /** Start date (e.g., "10.2022" or "2020"). */
    start: string;
    /** End date; leave undefined for "Present". */
    end?: string;
  };
  /** Full-time | Part-time | Contract | Internship, etc. */
  employmentType?: string;
  description?: string;
  /** UI icon to represent the role type. */
  icon?: React.ReactElement;
  skills?: string[];
  /** Whether the position is expanded by default in the UI. */
  isExpanded?: boolean;
};

export type Experience = {
  id: string;
  companyName: string;
  /** URL to the company logo (absolute URL or path under /public). */
  companyLogo?: string;
  /** Render the company logo a bit larger than the default 24px tile. */
  largeLogo?: boolean;
  /** Invert a light-on-transparent logo so it stays visible in light mode. */
  invertLogoInLight?: boolean;
  /** UI icon to represent the company; used if `companyLogo` is not provided. */
  companyIcon?: React.ReactElement;
  /** Color for this company's selected state on the home page; defaults to the site accent. */
  accentColor?: string;
  /** URL to the company's website. */
  companyWebsite?: string;
  location?: string;
  locationType?: "On-site" | "Hybrid" | "Remote";
  /** Roles held at this company; keep newest first for display. */
  positions: ExperiencePosition[];
  /** Marks the company as the current employer for highlighting. */
  isCurrentEmployer?: boolean;
};
