/**
 * Orgs shown inline in About.
 * Publications are resolved from papers.jsonl by matching mentor co-authors.
 */
export const collaborations = {
  tau: {
    name: 'Tel Aviv University (TAU)',
    mentors: [
      { name: 'Irad Ben-Gal', url: 'https://www.iradbengal.sites.tau.ac.il/' },
      { name: 'Nachum Dershowitz', url: 'https://www.cs.tau.ac.il/%7Enachumd/Homepage.html' },
      { name: 'Lior Wolf', url: 'https://www.cs.tau.ac.il/~wolf/' },
    ],
  },
  uh: {
    name: 'University of Houston',
    icon: 'uh-mark.png',
    mentors: [],
  },
  thapar: {
    name: 'Thapar Institute',
    icon: 'thapar-mark.png',
    tip: 'Thapar Institute of Engineering & Technology: accessible healthcare technologies for low-resource regions in India',
    mentors: [],
  },
  pgimer: {
    name: 'PGIMER',
    icon: 'pgimer-seal.png',
    tip: 'Post Graduate Institute of Medical Education & Research: accessible healthcare technologies for low-resource regions in India',
    mentors: [],
  },
  google: {
    name: 'Google',
    icon: 'google-g.png',
    tip: 'TAU–Google AI for Social Good: digitization of the Dead Sea Scrolls',
    mentors: [],
  },
};
