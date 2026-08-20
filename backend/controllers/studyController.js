import fs from "fs";
import Book from "../models/Book.js";
import { extractPdfText } from "../utils/pdfExtractor.js";
import { askForJSON, askForText } from "../utils/llm.js";
import { embedBatch, embedOne } from "../utils/embeddings.js";
import { topKChunks } from "../utils/vectorSearch.js";

const MAX_MODULES = 20; 

const chunkText = (text, maxChunks = MAX_MODULES) => {
  const chunkSize = Math.max(2000, Math.ceil(text.length / maxChunks));
  const chunks = [];
  for (let i = 0; i < text.length && chunks.length < maxChunks; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
};

const stripEmbeddings = (book) => {
  const lean = book.toObject();
  lean.modules = lean.modules.map(({ embedding, ...rest }) => rest);
  return lean;
};


export const uploadBookController = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Book PDF is required (field name: book)" });

    const fullText = await extractPdfText(fs.readFileSync(req.file.path));
    if (!fullText || fullText.length < 200) {
      return res.status(400).json({ message: "Could not extract readable text from this PDF" });
    }

    const chunks = chunkText(fullText);


    const embeddings = await embedBatch(chunks);


    const previews = chunks.map((c, i) => `Chunk ${i + 1}: ${c.slice(0, 400)}`).join("\n\n");
    const result = await askForJSON(
      `You are breaking a textbook/study PDF into a teachable syllabus. Given previews of
       sequential chunks of the book, generate a short topic title and a one-sentence summary
       for EACH chunk, in the same order. Respond ONLY with JSON:
       { "modules": [ { "title": string, "summary": string } ] }
       The "modules" array must have exactly ${chunks.length} entries, one per chunk, in order.`,
      previews
    );
    const generated = result.modules || [];

    const modules = chunks.map((chunk, i) => ({
      title: generated[i]?.title || `Section ${i + 1}`,
      summary: generated[i]?.summary || "",
      sourceExcerpt: chunk,
      embedding: embeddings[i],
      explanation: null,
      done: false
    }));

    const book = await Book.create({
      user: req.user._id,
      title: req.body.title || req.file.originalname.replace(/\.pdf$/i, ""),
      filename: req.file.originalname,
      path: `/uploads/books/${req.file.filename}`,
      modules
    });

    res.status(201).json(stripEmbeddings(book));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const listBooksController = async (req, res) => {
  const books = await Book.find({ user: req.user._id })
    .select("title filename path createdAt modules.title modules.done")
    .sort({ createdAt: -1 });
  res.json(books);
};


export const getBookController = async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, user: req.user._id });
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(stripEmbeddings(book));
};


export const askBookController = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) return res.status(400).json({ message: "question is required" });

    const book = await Book.findOne({ _id: req.params.id, user: req.user._id });
    if (!book) return res.status(404).json({ message: "Book not found" });


    const queryEmbedding = await embedOne(question);


    const matches = topKChunks(queryEmbedding, book.modules, 3);
    const context = matches
      .map((m, i) => `[Source ${i + 1} — "${m.module.title}"]\n${m.module.sourceExcerpt}`)
      .join("\n\n");


    const answer = await askForText(
      `You are a study tutor answering a student's question about their uploaded book.
       Answer using ONLY the provided source excerpts. If the answer isn't in the sources,
       say so honestly rather than guessing. Keep the answer clear and under 200 words.
       Mention which source(s) you used by their title where relevant.

       Format the answer as clean Markdown:
       - Use short bold headings for the answer and relevant sections such as Definition, Explanation,
         Example, Steps, or Key Takeaway.
       - Separate every heading, paragraph, and list with one blank line.
       - Use concise paragraphs, bullet points, or numbered steps where useful.
       - Do not use decorative symbols, emojis, repeated punctuation, or a dense block of text.`,
      `Question: ${question}\n\nSource excerpts:\n${context}`
    );

    book.chatHistory.push({
      question,
      answer,
      sourceModuleIndexes: matches.map((m) => m.index)
    });
    await book.save();

    res.json({
      answer,
      sources: matches.map((m) => ({ index: m.index, title: m.module.title, score: m.score }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const explainModuleController = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, user: req.user._id });
    if (!book) return res.status(404).json({ message: "Book not found" });

    const idx = Number(req.params.index);
    const module = book.modules[idx];
    if (!module) return res.status(404).json({ message: "Module not found" });

    if (module.explanation && !req.body.regenerate) {
      return res.json({ explanation: module.explanation });
    }

    const explanation = await askForText(
      `You are a patient tutor teaching from a textbook. Explain the given section clearly,
       as if teaching a student for the first time. Use simple language, a short example if
       relevant, and end with a one-line takeaway. Keep it focused — 150-250 words.

       Format the explanation as clean Markdown:
       - Use clear, short bold headings for sections such as Concept, How It Works, Example, and Key Takeaway.
       - Separate every heading, paragraph, and list with one blank line.
       - Use bullet points or numbered steps where appropriate.
       - Keep the final takeaway under a bold Key Takeaway heading.
       - Do not use decorative symbols, emojis, repeated punctuation, or one dense block of text.`,
      `Topic: ${module.title}\n\nSection text:\n${module.sourceExcerpt.slice(0, 5000)}`
    );

    module.explanation = explanation;
    await book.save();
    res.json({ explanation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const toggleModuleController = async (req, res) => {
  const book = await Book.findOne({ _id: req.params.id, user: req.user._id });
  if (!book) return res.status(404).json({ message: "Book not found" });

  const idx = Number(req.params.index);
  const module = book.modules[idx];
  if (!module) return res.status(404).json({ message: "Module not found" });

  module.done = req.body.done;
  await book.save();
  res.json({ progressPercent: book.progressPercent });
};


export const deleteBookController = async (req, res) => {
  const book = await Book.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json({ message: "Deleted" });
};