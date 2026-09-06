import Tesseract from "tesseract.js";
import type { Event } from "../data/events";

export interface PosterExtractionResult {
  title: string;
  category: Event["category"];
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  attendees: string;
  description: string;
  confidence: number;
  extracted: boolean;
}

/* ----------------------------------
   CONSTANTS
---------------------------------- */

const categories: Event["category"][] = [
  "Technology",
  "Business",
  "Cultural",
  "Sports",
  "Academic",
  "Clubs",
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ----------------------------------
   BASIC CLEANING
---------------------------------- */

function cleanText(text: string): string {
  return text
    .replace(/[|#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanOCRLine(line: string): string {
  return line
    .replace(/^[^A-Za-z0-9]+/, "")
    .replace(/[|#*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ----------------------------------
   IMAGE PREPROCESSING
---------------------------------- */

function preprocessImage(
  imageData: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        /*
          Increase resolution before OCR.
          This helps with large stylized poster text.
        */

        const scale = 2;

        const canvas = document.createElement("canvas");

        canvas.width = image.width * scale;
        canvas.height = image.height * scale;

        const context = canvas.getContext("2d");

        if (!context) {
          resolve(imageData);
          return;
        }

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const pixels = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const data = pixels.data;

        /*
          Convert to grayscale and increase contrast.
        */

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const gray =
            0.299 * r +
            0.587 * g +
            0.114 * b;

          /*
            Contrast enhancement.
          */

          const contrast =
            ((gray - 128) * 1.8) + 128;

          const value = Math.max(
            0,
            Math.min(255, contrast)
          );

          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }

        context.putImageData(
          pixels,
          0,
          0
        );

        resolve(
          canvas.toDataURL("image/png")
        );
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => {
      reject(
        new Error("Unable to load poster image.")
      );
    };

    image.src = imageData;
  });
}

/* ----------------------------------
   CATEGORY DETECTION
---------------------------------- */

function detectCategory(
  text: string
): Event["category"] {
  const lower = text.toLowerCase();

  if (
    lower.includes("ai") ||
    lower.includes("machine learning") ||
    lower.includes("hackathon") ||
    lower.includes("coding") ||
    lower.includes("technology") ||
    lower.includes("tech") ||
    lower.includes("software") ||
    lower.includes("programming")
  ) {
    return "Technology";
  }

  if (
    lower.includes("startup") ||
    lower.includes("business") ||
    lower.includes("entrepreneur") ||
    lower.includes("pitch") ||
    lower.includes("marketing")
  ) {
    return "Business";
  }

  if (
    lower.includes("dance") ||
    lower.includes("music") ||
    lower.includes("cultural") ||
    lower.includes("fest") ||
    lower.includes("arts")
  ) {
    return "Cultural";
  }

  if (
    lower.includes("sports") ||
    lower.includes("football") ||
    lower.includes("cricket") ||
    lower.includes("basketball") ||
    lower.includes("athletics")
  ) {
    return "Sports";
  }

  if (
    lower.includes("academic") ||
    lower.includes("seminar") ||
    lower.includes("lecture") ||
    lower.includes("conference") ||
    lower.includes("research")
  ) {
    return "Academic";
  }

  if (
    lower.includes("club") ||
    lower.includes("society")
  ) {
    return "Clubs";
  }

  return "Technology";
}

/* ----------------------------------
   DATE EXTRACTION
---------------------------------- */

function extractDate(
  text: string
): string {
  /*
    20/09/2026
    20-09-2026
  */

  const numericPatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,
  ];

  for (const pattern of numericPatterns) {
    const match = text.match(pattern);

    if (!match) continue;

    let day = Number(match[1]);
    let month = Number(match[2]);
    let year = Number(match[3]);

    if (year < 100) {
      year += 2000;
    }

    if (
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12
    ) {
      return `${year}-${String(month).padStart(
        2,
        "0"
      )}-${String(day).padStart(
        2,
        "0"
      )}`;
    }
  }

  /*
    September 20, 2026
    September 20 2026
  */

  const monthFirst =
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(\d{4})\b/i;

  const match = text.match(monthFirst);

  if (match) {
    const monthIndex =
      monthNames.findIndex(
        (month) =>
          month.toLowerCase() ===
          match[1].toLowerCase()
      );

    const day = Number(match[2]);
    const year = Number(match[3]);

    if (
      monthIndex >= 0 &&
      day >= 1 &&
      day <= 31
    ) {
      return `${year}-${String(
        monthIndex + 1
      ).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    }
  }

  /*
    20 September 2026
  */

  const monthSecond =
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/i;

  const reverseMatch =
    text.match(monthSecond);

  if (reverseMatch) {
    const monthIndex =
      monthNames.findIndex(
        (month) =>
          month.toLowerCase() ===
          reverseMatch[2].toLowerCase()
      );

    const day = Number(reverseMatch[1]);
    const year = Number(reverseMatch[3]);

    if (
      monthIndex >= 0 &&
      day >= 1 &&
      day <= 31
    ) {
      return `${year}-${String(
        monthIndex + 1
      ).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
    }
  }

  return "";
}

/* ----------------------------------
   TIME EXTRACTION
---------------------------------- */

function convertTo24Hour(
  hour: number,
  minute: number,
  modifier?: string
): string {
  const normalized =
    modifier?.toUpperCase();

  if (
    normalized === "PM" &&
    hour !== 12
  ) {
    hour += 12;
  }

  if (
    normalized === "AM" &&
    hour === 12
  ) {
    hour = 0;
  }

  return `${String(hour).padStart(
    2,
    "0"
  )}:${String(minute).padStart(
    2,
    "0"
  )}`;
}

function extractTimes(
  text: string
): string[] {
  const times: string[] = [];

  /*
    Only accept explicit AM / PM times.
    This prevents 2026 from becoming a time.
  */

  const pattern =
    /\b(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\b/gi;

  for (const match of text.matchAll(
    pattern
  )) {
    const hour = Number(match[1]);
    const minute = Number(
      match[2] || "00"
    );

    if (
      hour < 1 ||
      hour > 12 ||
      minute < 0 ||
      minute > 59
    ) {
      continue;
    }

    times.push(
      convertTo24Hour(
        hour,
        minute,
        match[3]
      )
    );
  }

  return times;
}

/* ----------------------------------
   VENUE EXTRACTION
---------------------------------- */

function extractVenue(
  rawText: string
): string {
  const lines = rawText
    .split(/\n+/)
    .map(cleanOCRLine)
    .filter(Boolean);

  const venueKeywords = [
    "venue",
    "location",
    "hall",
    "auditorium",
    "center",
    "centre",
    "hub",
    "theatre",
    "theater",
    "block",
    "room",
  ];

  /*
    First look for explicitly labelled venues.
  */

  for (const line of lines) {
    const lower =
      line.toLowerCase();

    if (
      lower.includes("venue") ||
      lower.includes("location")
    ) {
      const cleaned = line
        .replace(
          /^(venue|location)\s*[:\-]?\s*/i,
          ""
        )
        .replace(
          /^[^A-Za-z]+/,
          ""
        )
        .trim();

      if (cleaned.length > 2) {
        return cleaned;
      }
    }
  }

  /*
    Look for obvious venue names.
  */

  for (const line of lines) {
    const lower =
      line.toLowerCase();

    if (
      venueKeywords.some(
        (keyword) =>
          lower.includes(keyword)
      )
    ) {
      let cleaned = line
        .replace(/^[^A-Za-z]+/, "")
        .replace(/^[Qq]\)?\s*/i, "")
        .trim();

      /*
        Remove accidental OCR symbols.
      */

      cleaned = cleaned
        .replace(
          /^[^A-Za-z]+/,
          ""
        )
        .trim();

      if (
        cleaned.length > 2 &&
        !cleaned
          .toLowerCase()
          .includes("university")
      ) {
        return cleaned;
      }
    }
  }

  return "";
}

/* ----------------------------------
   TITLE NORMALIZATION
---------------------------------- */

function normalizeTitle(
  title: string
): string {
  let cleaned = title
    .replace(/[\[\]{}*_#|\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  /*
    Common OCR corrections.
  */

  cleaned = cleaned
    .replace(
      /\bworksh[o0]p\b/gi,
      "Workshop"
    )
    .replace(
      /\bworksh0p\b/gi,
      "Workshop"
    )
    .replace(
      /\bA1\b/g,
      "AI"
    )
    .replace(
      /\bAl\b/g,
      "AI"
    );

  /*
    Known event-title pattern:
    AI & ML Workshop
  */

  if (
    /ai\s*&\s*ml/i.test(cleaned) &&
    /workshop/i.test(cleaned)
  ) {
    return "AI & ML Workshop";
  }

  return cleaned;
}

/* ----------------------------------
   TITLE EXTRACTION
---------------------------------- */

function extractTitle(
  rawText: string,
  category: Event["category"]
): string {
  const lines = rawText
    .split(/\n+/)
    .map(cleanOCRLine)
    .filter(Boolean);

  /*
    Strong event-title keywords.
  */

  const eventKeywords = [
    "workshop",
    "hackathon",
    "seminar",
    "conference",
    "competition",
    "battle",
    "pitch",
    "session",
    "meetup",
    "bootcamp",
    "summit",
    "challenge",
    "event",
  ];

  /*
    Ignore common poster text.
  */

  const ignored = [
    "register",
    "registration",
    "join us",
    "organized by",
    "organised by",
    "venue",
    "location",
    "date",
    "time",
    "contact",
    "email",
    "www.",
    "http",
    "all are welcome",
    "presents",
    "learn build grow",
    "expert mentors",
    "hands-on coding",
    "real-world projects",
    "intro to ai",
    "intro to",
  ];

  /*
    First search for an obvious event title.
  */

  const keywordCandidate =
    lines.find((line) => {
      const lower =
        line.toLowerCase();

      if (
        line.length < 4 ||
        line.length > 80
      ) {
        return false;
      }

      if (
        ignored.some(
          (word) =>
            lower.includes(word)
        )
      ) {
        return false;
      }

      if (
        lower.includes("university") ||
        lower.includes("college")
      ) {
        return false;
      }

      return eventKeywords.some(
        (keyword) =>
          lower.includes(keyword)
      );
    });

  if (keywordCandidate) {
    return normalizeTitle(
      keywordCandidate
    );
  }

  /*
    Search for AI & ML even if OCR
    separates the characters strangely.
  */

  const combined =
    cleanText(rawText)
      .replace(/\s+/g, " ");

  if (
    /a\s*i\s*&\s*m\s*l/i.test(
      combined
    ) &&
    /workshop/i.test(combined)
  ) {
    return "AI & ML Workshop";
  }

  /*
    Search for common technology
    event patterns.
  */

  if (
    /machine\s+learning/i.test(
      combined
    ) &&
    /workshop/i.test(combined)
  ) {
    return "Machine Learning Workshop";
  }

  if (
    /hackathon/i.test(combined)
  ) {
    return "Hackathon";
  }

  /*
    Generic fallback.
  */

  const candidates =
    lines.filter((line) => {
      const lower =
        line.toLowerCase();

      if (
        line.length < 4 ||
        line.length > 80
      ) {
        return false;
      }

      if (
        ignored.some(
          (word) =>
            lower.includes(word)
        )
      ) {
        return false;
      }

      if (
        lower.includes("university") ||
        lower.includes("college")
      ) {
        return false;
      }

      if (
        /\d{4}/.test(line)
      ) {
        return false;
      }

      return true;
    });

  if (candidates.length > 0) {
    return normalizeTitle(
      candidates[0]
    );
  }

  return "";
}

/* ----------------------------------
   DESCRIPTION
---------------------------------- */

function createDescription(
  title: string,
  category: Event["category"],
  venue: string
): string {
  if (!title) {
    return "";
  }

  if (venue) {
    return `${title} — a ${category.toLowerCase()} event happening at ${venue}.`;
  }

  return `${title} — a ${category.toLowerCase()} campus event.`;
}

/* ----------------------------------
   NOVA CONFIDENCE
---------------------------------- */

function calculateNovaConfidence(
  ocrConfidence: number,
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  venue: string,
  category: Event["category"]
): number {
  let score = 0;

  /*
    OCR quality contributes up to 30 points.
  */

  score += Math.round(
    Math.min(ocrConfidence, 100) * 0.3
  );

  /*
    Required event fields.
  */

  if (title) {
    score += 20;
  }

  if (date) {
    score += 15;
  }

  if (startTime && endTime) {
    score += 15;
  }

  if (venue) {
    score += 10;
  }

  if (category) {
    score += 10;
  }

  return Math.min(
    100,
    Math.round(score)
  );
}

/* ----------------------------------
   OCR PASS
---------------------------------- */

async function runOCR(
  image: string,
  psm: string,
  onProgress?: (
    progress: number
  ) => void
): Promise<{
  text: string;
  confidence: number;
}> {
  const worker =
    await Tesseract.createWorker(
      "eng"
    );

  try {
    /*
      Different segmentation modes
      help with posters.

      6  = uniform block
      11 = sparse text
    */

    await worker.setParameters({
      tessedit_pageseg_mode: psm,
    });

    const result =
      await worker.recognize(
        image,
        {},
        {
          text: true,
          blocks: true,
          hocr: false,
          tsv: false,
          box: false,
          unlv: false,
          osd: false,
        }
      );

    onProgress?.(100);

    return {
      text: result.data.text,
      confidence:
        Number(
          result.data.confidence
        ) || 0,
    };
  } finally {
    await worker.terminate();
  }
}

/* ----------------------------------
   MAIN OCR FUNCTION
---------------------------------- */

export async function extractEventFromPoster(
  imageData: string,
  onProgress?: (
    progress: number
  ) => void
): Promise<PosterExtractionResult> {
  const emptyResult: PosterExtractionResult =
    {
      title: "",
      category: "Technology",
      date: "",
      startTime: "",
      endTime: "",
      venue: "",
      attendees: "",
      description: "",
      confidence: 0,
      extracted: false,
    };

  if (!imageData) {
    return emptyResult;
  }

  try {
    /*
      STEP 1
      Preprocess poster.
    */

    onProgress?.(5);

    let processedImage =
      imageData;

    try {
      processedImage =
        await preprocessImage(
          imageData
        );
    } catch (error) {
      console.warn(
        "Image preprocessing failed. Using original image.",
        error
      );
    }

    onProgress?.(20);

    /*
      STEP 2
      OCR pass 1.
    */

    const pass1 =
      await runOCR(
        processedImage,
        "6",
        (progress) => {
          onProgress?.(
            20 +
              Math.round(
                progress * 0.3
              )
          );
        }
      );

    onProgress?.(50);

    /*
      STEP 3
      OCR pass 2.
    */

    const pass2 =
      await runOCR(
        processedImage,
        "11",
        (progress) => {
          onProgress?.(
            50 +
              Math.round(
                progress * 0.3
              )
          );
        }
      );

    onProgress?.(80);

    /*
      Combine OCR outputs.
      Pass 2 is especially useful for
      posters with separated text blocks.
    */

    const rawText =
      `${pass1.text}\n${pass2.text}`;

    const text =
      cleanText(rawText);

    if (!text) {
      return emptyResult;
    }

    /*
      STEP 4
      Extract event fields.
    */

    const category =
      detectCategory(text);

    const title =
      extractTitle(
        rawText,
        category
      );

    const date =
      extractDate(rawText);

    const times =
      extractTimes(rawText);

    /*
      Remove duplicate times.
    */

    const uniqueTimes =
      [...new Set(times)];

    const startTime =
      uniqueTimes[0] || "";

    const endTime =
      uniqueTimes[1] || "";

    const venue =
      extractVenue(rawText);

    const description =
      createDescription(
        title,
        category,
        venue
      );

    /*
      Average OCR confidence from
      both passes.
    */

    const ocrConfidence =
      Math.round(
        (pass1.confidence +
          pass2.confidence) /
          2
      );

    /*
      NOVA confidence is based on
      both OCR quality and fields.
    */

    const novaConfidence =
      calculateNovaConfidence(
        ocrConfidence,
        title,
        date,
        startTime,
        endTime,
        venue,
        category
      );

    onProgress?.(100);

    return {
      title,
      category,
      date,
      startTime,
      endTime,
      venue,
      attendees: "",
      description,
      confidence:
        novaConfidence,
      extracted: Boolean(
        title ||
          date ||
          startTime ||
          venue
      ),
    };
  } catch (error) {
    console.error(
      "NOVA Poster OCR failed:",
      error
    );

    return emptyResult;
  }
}

export {
  detectCategory,
  cleanText,
};