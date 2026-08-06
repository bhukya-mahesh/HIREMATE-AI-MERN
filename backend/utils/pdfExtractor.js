import pdfParse from "pdf-parse";

/**
 * @param {Buffer} buffer 
 * @returns {Promise<string>} 
 */
export const extractPdfText = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text.trim();
};
