/** Shared paper parsing / collaboration lookups */

export function parsePapersJsonl(jsonlText) {
  return jsonlText
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .map((block) => JSON.parse(block.trim()));
}

/** Prefer a short display label (pre-colon title, with a few aliases). */
const SHORT_LABEL_ALIASES = {
  'A Multi-Stage Agentic Framework for Effective Counter-Narrative Generation and Refinement': 'Counter-Narratives',
  'Classifying Medieval Manuscripts by Pen and Support': 'Pen & Support',
  'Real-Time Attentiveness Detection and Adaptive Feedback in Online Learning Using Facial Expression Recognition and LLMs': 'Attentiveness Detection',
  'Learner attentiveness and engagement analysis in online education using computer vision': 'Learner Engagement',
  'Auditing Gendered Name Sensitivity in LLM-Based Candidate Screening': 'Gendered Name Sensitivity',
  'Reading Order Inference for Complex Document Layouts': 'Reading Order',
};

export function shortPaperLabel(title) {
  const base = title.split(':')[0].trim();
  return SHORT_LABEL_ALIASES[base] || base;
}

// Hyphens count as spaces so "Ben-Gal" and "Ben Gal" match.
function normalizeAuthor(name) {
  return name.replace(/[†*]/g, '').replace(/-/g, ' ').trim().toLowerCase();
}

function authorMatchesMentor(author, mentorName) {
  const a = normalizeAuthor(author);
  const m = normalizeAuthor(mentorName);
  if (a === m) return true;
  // last-name match when first names align enough (handles "Jordan Lee Boyd-Graber")
  const aParts = a.split(/\s+/);
  const mParts = m.split(/\s+/);
  if (aParts.at(-1) !== mParts.at(-1)) return false;
  // same last name + mentor first name present in author
  return aParts.includes(mParts[0]);
}

/**
 * Papers co-authored with any of the given mentors, newest first.
 * @returns {{ title: string, label: string, pdf: string | null, year: number }[]}
 */
export function papersForMentors(papers, mentors = []) {
  if (!mentors.length) return [];

  const matched = papers.filter((paper) =>
    (paper.authors || []).some((author) =>
      mentors.some((mentor) => authorMatchesMentor(author, mentor.name))
    )
  );

  return matched
    .map((paper) => ({
      title: paper.title,
      label: shortPaperLabel(paper.title),
      pdf: paper.links?.pdf || null,
      year: paper.year ?? 0,
    }))
    .sort((a, b) => b.year - a.year || a.label.localeCompare(b.label));
}
