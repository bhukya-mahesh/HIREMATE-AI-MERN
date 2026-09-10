import CompanyVisit from "../models/CompanyVisit.js";
import { extractPdfText } from "../utils/pdfExtractor.js";
import { askForJSON } from "../utils/llm.js";

const CHUNK_SIZE = 8000;
const CHUNK_OVERLAP = 300; // small overlap so a company entry split across a chunk boundary isn't lost

const chunkText = (text) => {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + CHUNK_SIZE));
    i += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
};

const EXTRACTION_SYSTEM_PROMPT = `You are extracting structured data from a campus placement report.
Given a chunk of text listing companies that visited a college campus for placements, extract each company's details.

Return ONLY JSON in this exact shape:
{
  "visits": [
    {
      "company": string,
      "role": string,
      "visitMonth": number or null,
      "visitYear": number or null,
      "rawDateText": string,
      "maxSelections": number or null,
      "workLocation": string,
      "bond": string,
      "packageOffered": string,
      "eligibility": string,
      "otherDetails": string
    }
  ]
}

Rules:
- visitMonth must be a number 1-12 (January=1) if a month is mentioned or clearly implied, otherwise null.
- rawDateText should be the exact date/month text as written in the source (e.g. "March 2025", "Aug-Sept 2024"), or "" if none.
- Only include a company if its entry is clearly present in this text chunk — do not invent or guess data.
- If this chunk contains no company visit entries, return {"visits": []}.
- For any field not mentioned, use null (for numbers) or "" (for strings).`;

// Dedupe records that may appear twice because of chunk overlap.
const dedupeVisits = (visits) => {
  const seen = new Set();
  return visits.filter((v) => {
    const key = `${(v.company || "").trim().toLowerCase()}|${v.visitMonth}|${v.visitYear}|${v.role || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const uploadVisitList = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "PDF is required (field name: book)" });

    const fullText = await extractPdfText(req.file.buffer);
    if (!fullText || fullText.length < 100) {
      return res.status(400).json({ message: "Could not extract readable text from this PDF" });
    }

    const chunks = chunkText(fullText);
    const sourceBatch = `${req.file.originalname || "upload"}-${Date.now()}`;

    let allVisits = [];
    for (const chunk of chunks) {
      const result = await askForJSON(EXTRACTION_SYSTEM_PROMPT, chunk);
      if (Array.isArray(result.visits)) {
        allVisits = allVisits.concat(result.visits);
      }
    }

    const deduped = dedupeVisits(allVisits).filter((v) => v.company && v.company.trim());

    if (!deduped.length) {
      return res.status(400).json({
        message: "No company visit records could be extracted from this PDF",
      });
    }

    const docs = await CompanyVisit.insertMany(
      deduped.map((v) => ({
        user: req.user._id,
        company: v.company.trim(),
        role: v.role || "",
        visitMonth: Number.isInteger(v.visitMonth) ? v.visitMonth : null,
        visitYear: Number.isInteger(v.visitYear) ? v.visitYear : null,
        rawDateText: v.rawDateText || "",
        maxSelections: Number.isInteger(v.maxSelections) ? v.maxSelections : null,
        workLocation: v.workLocation || "",
        bond: v.bond || "",
        packageOffered: v.packageOffered || "",
        eligibility: v.eligibility || "",
        otherDetails: v.otherDetails || "",
        sourceBatch,
      }))
    );

    res.status(201).json({ message: `Extracted ${docs.length} company visit(s)`, visits: docs });
  } catch (err) {
    console.error("uploadVisitList error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const listVisits = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { user: req.user._id };
    if (month) filter.visitMonth = Number(month);
    if (year) filter.visitYear = Number(year);

    const visits = await CompanyVisit.find(filter).sort({ visitYear: 1, visitMonth: 1, company: 1 });
    res.json(visits);
  } catch (err) {
    console.error("listVisits error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getVisit = async (req, res) => {
  try {
    const visit = await CompanyVisit.findOne({ _id: req.params.id, user: req.user._id });
    if (!visit) return res.status(404).json({ message: "Not found" });
    res.json(visit);
  } catch (err) {
    console.error("getVisit error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteVisit = async (req, res) => {
  try {
    const visit = await CompanyVisit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!visit) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteVisit error:", err);
    res.status(500).json({ message: err.message });
  }
};