import type { DeadSiteReason, RoastCategoryKey } from "@/features/roast/types";

/** Bump when lines or their order change, so cached roasts are rebuilt. */
export const ROAST_CONTENT_VERSION = 1;

export const ROAST_CATEGORIES: { key: RoastCategoryKey; label: string }[] = [
  { key: "speed", label: "Load speed" },
  { key: "seo", label: "SEO" },
  { key: "copy", label: "Copywriting" },
  { key: "social", label: "Social previews" },
  { key: "trust", label: "Trust" },
  { key: "mobile", label: "Mobile & a11y" },
];

/**
 * One roast per failing check. `{value}` is replaced with what was measured.
 * The worst issue in a category picks the line.
 */
export const ISSUE_ROASTS: Record<string, string[]> = {
  response_time: [
    "Your server took {value} to say hello. I've had faster replies from government offices.",
    "{value} before the first byte. Somewhere a hamster is pedalling your backend.",
  ],
  html_weight: [
    "{value} of HTML. That's not a homepage, that's a novella.",
    "Your HTML alone weighs {value}. The CSS hasn't even entered the chat.",
  ],
  performance_score: [
    "Lighthouse gave you {value}. Lighthouse is being polite.",
    "Performance {value}. Visitors are leaving before the spinner finishes spinning.",
  ],
  lcp: [
    "Main content shows up after {value}. Most visitors have already bounced to a competitor.",
    "Largest Contentful Paint: {value}. Largest, yes. Contentful, eventually.",
  ],
  fcp: [
    "{value} of white screen before anything appears. Very minimalist. Very empty.",
    "First paint at {value}. Your site makes a strong first impression of nothing.",
  ],
  tbt: [
    "The main thread is blocked for {value}. Your JavaScript is holding the page hostage.",
    "{value} of blocking time. Every tap feels like pressing an elevator button twice.",
  ],
  cls: [
    "Layout shift {value}. I went to click a link and ended up somewhere else entirely.",
    "CLS of {value}. The page moves more than my landlord's deadlines.",
  ],
  title_tag: [
    "Your title tag: {value}. Google is guessing what you do. So am I.",
    "Title says {value}. Search results deserve better, and so do you.",
  ],
  heading_hierarchy: [
    "Heading order: {value}. That's not a structure, that's a ransom note.",
  ],
  canonical: [
    "No canonical tag. Google has to guess which copy of you is the real one.",
  ],
  noindex: [
    "Your page literally tells Google not to index it. Mission accomplished, I guess.",
  ],
  robots_txt: ["No robots.txt. Crawlers knock, nobody answers."],
  sitemap_xml: ["No sitemap. You're making Google find your pages by vibes."],
  structured_data: [
    "Zero structured data. To search engines you're just a wall of text with a logo.",
  ],
  duplicate_meta: [
    "Duplicate title or description tags ({value}). Pick a personality.",
  ],
  lighthouse_seo: ["Lighthouse SEO {value}. Even the robot is disappointed."],
  h1: [
    "H1 situation: {value}. Either you have nothing to say or you're saying it all at once.",
    "{value}. Your page has no clear headline. Neither do your visitors.",
  ],
  meta_description: [
    "Meta description: {value}. Google is writing your sales pitch for you. Badly.",
    "Meta description length: {value}. That's your one shot in the search results and you fumbled it.",
  ],
  word_count: [
    "{value} on the whole homepage. I've seen longer error messages.",
    "Only {value}. Visitors still don't know what you sell, and neither does Google.",
  ],
  internal_links: [
    "{value} from the homepage. It's a dead end with a logo on it.",
  ],
  og_title: [
    "No og:title. Share your link on WhatsApp and it shows up as a shrug.",
  ],
  og_description: [
    "No og:description. Your link previews have nothing to say. Fitting.",
  ],
  og_image: [
    "No og:image. Every share of your site is a sad grey rectangle.",
    "Missing og:image. Your link previews look like a placeholder someone forgot to replace.",
  ],
  twitter_card: [
    "No twitter:card. On X your link is just a blue string of regret.",
  ],
  twitter_text: ["X preview text: {value}. Nobody is clicking that."],
  https: ["No HTTPS. Browsers are literally warning people about you. In red."],
  favicon: ["No favicon. In a row of tabs you're the blank one nobody trusts."],
  broken_links: [
    "{value} links are broken. Your site is giving people directions to places that don't exist.",
  ],
  charset: ["No charset declared. One emoji away from mojibake."],
  best_practices_score: [
    "Best practices {value}. Lighthouse found habits your future self will hate.",
  ],
  viewport: [
    "No viewport tag. On a phone your site is a desktop page viewed through a keyhole.",
  ],
  html_lang: [
    "No lang attribute. Screen readers are guessing your language. Rudely.",
  ],
  image_alt: [
    "Alt text on {value}. Screen reader users get a guided tour of 'image, image, image'.",
  ],
  inline_styles: [
    "{value} use inline styles. Your CSS lives in the HTML like an unwanted roommate.",
  ],
  accessibility_score: [
    "Accessibility {value}. A chunk of your visitors can't actually use this.",
  ],
};

/** For a category with nothing wrong: a backhanded compliment. */
export const CLEAN_CATEGORY_ROASTS: Record<RoastCategoryKey, string> = {
  speed: "Fast. Suspiciously fast. Who did you hire?",
  seo: "SEO is clean. Annoying, I had jokes ready.",
  copy: "The copy actually says something. Rare. Unsettling.",
  social: "Link previews look great. You must share your own link a lot.",
  trust: "Secure, tidy, no broken links. Boring in the best way.",
  mobile: "Works on a phone. The bar is low, but you cleared it.",
};

export const ROAST_GRADES = [
  { min: 0, label: "Certified disaster", note: "We need to talk. Today." },
  { min: 45, label: "Rough", note: "It's trying. That's the sad part." },
  {
    min: 62,
    label: "Aggressively mid",
    note: "Nobody hates it. Nobody remembers it.",
  },
  {
    min: 78,
    label: "Actually decent",
    note: "Annoyingly fine. Still room to sharpen.",
  },
  {
    min: 90,
    label: "OK, you're good",
    note: "Rare. Suspicious. Let's collaborate.",
  },
] as const;

/** Indexed the same as ROAST_GRADES. */
export const ROAST_VERDICTS: string[][] = [
  [
    "This isn't a website, it's a cry for help with a domain name attached.",
    "Every visitor this site loses is someone your competitor says thank you to.",
  ],
  [
    "The bones are there. The skin is on fire. Good news: fire is fixable.",
    "There's a real business buried under this. It deserves a site that isn't working against it.",
  ],
  [
    "Not bad. Worse: forgettable. That's the one thing I refuse to build.",
    "Ten good decisions away from great. You've made about four of them.",
  ],
  [
    "Solid work. The remaining issues are the ones that separate good from memorable.",
  ],
  ["Honestly? I'm mostly here to steal ideas now."],
];

export const DEAD_SITE_ROASTS: Record<
  DeadSiteReason,
  { headline: string; lines: string[]; verdict: string; fixes: string[] }
> = {
  not_a_domain: {
    headline: "That's not even a website.",
    lines: [
      "Zero load time though. Technically the fastest site I've seen.",
      "No SEO problems either, because there is no SEO.",
      "I can't roast copy that exists only in your imagination.",
      "Social previews: a void. A clean, honest void.",
      "Can't be hacked if it was never built. Bold security strategy.",
      "Perfectly responsive on every device. It shows nothing everywhere.",
    ],
    verdict:
      "You don't need a redesign. You need a website. I happen to build those.",
    fixes: [
      "Register a domain (Cloudflare, Namecheap, Porkbun)",
      "Get a fast, simple site live before anything fancy",
    ],
  },
  dns_not_found: {
    headline: "This domain doesn't exist.",
    lines: [
      "DNS looked everywhere. Nobody's home. Not even a parking page.",
      "Google can't rank what the internet can't find.",
      "Your copy is so good nobody will ever read it.",
      "Share the link and watch your friends get an error page.",
      "The most secure site on the internet: it has no server.",
      "Mobile-first, desktop-first, existence-last.",
    ],
    verdict:
      "Step one of having a great website is having a website. Let's start there.",
    fixes: [
      "Check the domain is registered and not expired",
      "Point its DNS A/AAAA or CNAME record at your host",
      "Wait for DNS to propagate, then test again",
    ],
  },
  timeout: {
    headline: "It didn't even load.",
    lines: [
      "I waited 10 seconds. Your visitors waited 3 and left.",
      "Search crawlers have a timeout too, and you just hit it.",
      "Maybe the copy is brilliant. Nobody will ever find out.",
      "Shared links are spinning in a hundred group chats right now.",
      "A site that never responds can't be trusted to do anything else either.",
      "On mobile data this isn't slow, it's a rumour.",
    ],
    verdict:
      "Your server is the bottleneck, and every second costs you customers. Fixable.",
    fixes: [
      "Check the server is up and not overloaded",
      "Put a CDN in front and cache the homepage",
      "Look for slow database queries or cold starts",
    ],
  },
  unreachable: {
    headline: "The server hung up on me.",
    lines: [
      "Connection refused. Your server won't even talk to me, never mind customers.",
      "Search engines can't index a closed door.",
      "No copy to roast. Somehow that's still an improvement.",
      "Your link previews are a browser error. Very avant-garde.",
      "Broken TLS or a dead server: browsers show a scary warning either way.",
      "Phones get the same error, just smaller.",
    ],
    verdict:
      "Down sites lose money by the minute. Let's get it back up and keep it there.",
    fixes: [
      "Make sure the server is running and port 443 is open",
      "Renew or reinstall the TLS certificate",
      "Check firewall rules are not blocking visitors",
    ],
  },
  http_error: {
    headline: "Your homepage is an error page.",
    lines: [
      "The homepage returns an error. The one page that can never break, broke.",
      "Google sees an error and quietly drops you from results.",
      "The only copy here is an error message. Riveting.",
      "Every shared link lands on an error. Great word of mouth.",
      "Nothing says 'trust us with your money' like a server error.",
      "Equally broken on every screen size. Consistent, at least.",
    ],
    verdict:
      "A broken homepage is the most expensive bug a business can have. Let's fix it.",
    fixes: [
      "Check the server logs for the error behind the homepage",
      "Make sure / is routed and deployed",
      "Add uptime monitoring so you hear about it first",
    ],
  },
};

/** Opening log lines while the real checks run. `{domain}` is replaced. */
export const SCAN_QUIPS = {
  start: "> resolving dns for {domain} ...",
  resolved: "> found it, unfortunately",
  fetching: "> fetching the homepage ... judging silently",
  fetched: "> got {kb} KB in {ms} ms ... {mood}",
  checks: "> counting headings, tags, links and life choices ...",
  pagespeed: "> asking Google Lighthouse for a second opinion (up to 80 s) ...",
  pagespeedDone: "> Lighthouse is back ... it has notes too",
  pagespeedSkipped:
    "> Lighthouse couldn't test it ... roasting from the HTML alone",
  compiling: "> compiling roast ...",
  cached: "> roasted {domain} recently ... serving the leftovers",
};
