import "@/styles/cv.css";
import {
  Instrument_Serif,
  Inter_Tight,
  JetBrains_Mono,
} from "next/font/google";

// Loaded only on this route; the portfolio keeps its own Geist stack.
// Variable fonts without a weight list: listing weights makes Google return
// multi-parameter URLs that Turbopack's dev font loader can't resolve.
const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--cv-font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--cv-font-mono",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--cv-font-serif",
  display: "swap",
});

export default function CvLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`cv ${sans.variable} ${mono.variable} ${serif.variable}`}>
      {children}
    </div>
  );
}
