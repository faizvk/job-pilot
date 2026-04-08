/**
 * Fetch company information from Wikipedia API (free, no key needed).
 * Returns a brief extract about the company.
 */
export async function getCompanyInfo(companyName: string): Promise<{
  extract: string;
  url: string;
  thumbnail?: string;
} | null> {
  if (!companyName) return null;

  try {
    // Search for the company on Wikipedia
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      companyName + " company"
    )}&srlimit=3&format=json&origin=*`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();

    const results = searchData.query?.search;
    if (!results || results.length === 0) return null;

    // Find the best match — prefer titles that contain the company name
    const nameLower = companyName.toLowerCase();
    const bestMatch = results.find((r: any) =>
      r.title.toLowerCase().includes(nameLower) ||
      nameLower.includes(r.title.toLowerCase())
    ) || results[0];

    // Get the extract and thumbnail for the best match
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
      bestMatch.title
    )}&prop=extracts|pageimages&exintro=true&explaintext=true&pithumbsize=200&format=json&origin=*`;

    const extractRes = await fetch(extractUrl);
    if (!extractRes.ok) return null;
    const extractData = await extractRes.json();

    const pages = extractData.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as any;
    if (!page || page.missing) return null;

    const extract = page.extract || "";
    // Limit to first 2-3 sentences for brevity
    const sentences = extract.split(". ").slice(0, 3).join(". ");
    const trimmed = sentences.endsWith(".") ? sentences : sentences + ".";

    return {
      extract: trimmed,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(bestMatch.title.replace(/ /g, "_"))}`,
      thumbnail: page.thumbnail?.source,
    };
  } catch (error) {
    console.error("Wikipedia API error:", error);
    return null;
  }
}
