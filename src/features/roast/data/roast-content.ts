import type { DeadSiteReason, RoastCategoryKey } from "@/features/roast/types";

/** Bump when lines or their order change, so cached roasts are rebuilt. */
export const ROAST_CONTENT_VERSION = 5;

export const ROAST_CATEGORIES: { key: RoastCategoryKey; label: string }[] = [
  { key: "speed", label: "Load speed" },
  { key: "seo", label: "SEO" },
  { key: "copy", label: "Copywriting" },
  { key: "social", label: "Social previews" },
  { key: "trust", label: "Trust" },
  { key: "mobile", label: "Mobile & a11y" },
];

export type RoastTier = "brutal" | "harsh" | "mild";

/** Below 50 is brutal, below 80 harsh, anything short of perfect mild. */
export function roastTierFor(score: number): RoastTier {
  if (score < 50) return "brutal";
  return score < 80 ? "harsh" : "mild";
}

/**
 * Category lines by how badly it scored. Every tier is a roast: a high score
 * that still missed gets mocked for being so close. Jokes only, since the
 * measured numbers already live in the issue list under each category.
 */
export const CATEGORY_ROASTS: Record<
  RoastCategoryKey,
  Record<RoastTier, string[]>
> = {
  speed: {
    brutal: [
      "Even turtles use your site as a benchmark for taking things slow.",
      "A snail taking a power nap still has a faster response time than your server.",
      "Your server isn't hosting a website, it's staging a public cry for help.",
      "Visitors don't bounce off this page. They age, retire, and pass the tab down to their kids.",
    ],
    harsh: [
      "Your page loads like it's reading the terms and conditions first.",
      "Visitors could brew a coffee while this loads. Most go to a competitor to drink it.",
      "Your loading spinner gets more screen time than your actual content.",
    ],
    mild: [
      "So close to fast, and still the slowest part of your visitor's day.",
      "Almost quick. Like a sprinter who stops mid-race to tie a shoelace and check email.",
      "Fast enough to pass. Slow enough that a competitor already closed the sale.",
    ],
  },
  seo: {
    brutal: [
      "Google's web crawler doesn't rank your site; it files a missing person report.",
      "Your site is so hidden, page two of Google would be a promotion.",
      "Search engines walk past this site like it owes them money.",
    ],
    harsh: [
      "Google knows you exist. It just has no idea why anyone should care.",
      "You're findable the way a sock behind the dryer is findable: by accident.",
      "Search engines see you and politely pretend they don't.",
    ],
    mild: [
      "Almost optimised. Google still treats you like a plus-one nobody invited.",
      "Nearly clean SEO, which is like nearly locking the front door.",
    ],
  },
  copy: {
    brutal: [
      "Your writing is so bland, even a parrot reading it out loud would sound monotone.",
      "A toddler babbling for juice has a higher conversion rate than your hero section.",
      "Your content doesn't persuade; it aggressively begs visitors to leave.",
      "I read the whole homepage and still can't tell what you sell. I suspect you can't either.",
    ],
    harsh: [
      "The copy is there. So is wallpaper. Both are equally persuasive.",
      "Your headline whispers when it should be shouting, and nobody is leaning in.",
      "Visitors skim this and leave with exactly the opinion they arrived with: none.",
    ],
    mild: [
      "Decent words, zero spine. Your copy apologises for existing.",
      "The pitch almost lands, then trips over its own adjectives.",
    ],
  },
  social: {
    brutal: [
      "Your link previews have the charisma of a blank parking ticket.",
      "Every time someone shares your site, a group chat goes quiet out of pity.",
      "Your link shows up on social looking like it crawled out of a spam folder.",
    ],
    harsh: [
      "Your previews show up. That's the nicest thing anyone will say about them.",
      "Half dressed for the party. The other half is still in the dryer.",
      "People will click your link, but only to find out what went wrong.",
    ],
    mild: [
      "Nearly share-ready, which on social media means invisible.",
      "Your previews look fine. Fine is exactly what people scroll past.",
    ],
  },
  trust: {
    brutal: [
      "Browsers see your site and quietly reach for the pepper spray.",
      "Visitors would rather hand their card details to a fortune cookie.",
      "This site has the trust signals of a free-gift popup from 2009.",
    ],
    harsh: [
      "It doesn't look dangerous. It just looks like nobody has been home since 2019.",
      "Trustworthy the way gas station sushi is technically food.",
      "Visitors notice the loose wires long before they notice you.",
    ],
    mild: [
      "Mostly trustworthy, which is exactly what a con artist would say too.",
      "Your handshake is limp. Visitors can feel it through the screen.",
    ],
  },
  mobile: {
    brutal: [
      "On a phone, your site is a desktop page viewed through a keyhole.",
      "Screen readers don't read your site, they file a complaint.",
      "Using this on a phone feels like doing taxes on a calculator watch.",
    ],
    harsh: [
      "Works on mobile the way a folding chair works as a bed.",
      "Accessible to some. Everyone else gets a puzzle with no instructions.",
      "Phones load it. Thumbs file a complaint.",
    ],
    mild: [
      "Almost phone-friendly. Thumbs still find every rough edge you missed.",
      "Nearly inclusive, which is a polite way of saying someone is still locked out.",
    ],
  },
};

/**
 * For a perfect category: a light jab, then the next thing to push on, since
 * a clean score is the floor, not the finish line.
 */
export const CLEAN_CATEGORY_ROASTS: Record<RoastCategoryKey, string[]> = {
  speed: [
    "Fast. Suspiciously fast. Now make all that speed actually sell something.",
    "Top marks on speed. A fast page with nothing to say just loses people quicker, so make the content earn it.",
  ],
  seo: [
    "SEO is clean. Annoying, I had jokes ready. Ranking is step one; getting the click is step two.",
    "Google loves you. Now give the humans it sends a reason to stay.",
  ],
  copy: [
    "The copy actually says something. Rare. Unsettling. Next, make it say something people remember.",
    "Clear words, perfect score. Clear isn't the same as convincing, though.",
  ],
  social: [
    "Link previews look great. You must share your own link a lot. Now make the page live up to the preview.",
    "Perfect previews. Pretty wrapping only works if the gift inside is worth opening.",
  ],
  trust: [
    "Secure, tidy, no broken links. Boring in the best way. Trust gets them in; a reason to buy keeps them.",
    "Nothing broken, nothing scary. Safe is the floor, not the finish line.",
  ],
  mobile: [
    "Works on a phone. The bar is low, but you cleared it. Next, clear it with some style.",
    "Perfect on mobile. Now make it feel built for thumbs, not just tolerated by them.",
  ],
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
    "If this site were a restaurant, the health inspector would just leave a sympathy card.",
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
  pagespeed: "> asking Google Lighthouse for a second opinion ...",
  pagespeedDone: "> Lighthouse is back ... it has notes too",
  pagespeedSkipped:
    "> Lighthouse couldn't test it ... roasting from the HTML alone",
  aiRoasting: "> handing the evidence to an AI with no filter ...",
  aiDone: "> the AI read every word ... it has questions",
  aiSkipped: "> the AI refused to look ... using the house roasts",
  compiling: "> compiling roast ...",
  cached: "> roasted {domain} recently ... serving the leftovers",
};
