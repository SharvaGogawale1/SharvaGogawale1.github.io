import React, { useState, useMemo, useEffect, useRef } from 'react';
import papersJsonl from '../data/papers.jsonl?raw';
import { useFilter } from '../contexts/FilterContext';
import { site } from '../config/site';

// Demo video component that auto-plays, loops, and resets when expanded
const DemoVideo = ({ src, isExpanded }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (isExpanded && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(err => {
        // Auto-play might be blocked by browser, but we'll try
        console.log('Auto-play prevented:', err);
      });
    } else if (!isExpanded && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isExpanded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(err => {
        console.log('Auto-play prevented on loop:', err);
      });
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
    >
      Your browser does not support the video tag.
    </video>
  );
};

const PAPER_FILTERS = [
  'All',
  'Computational Social Science & NLP',
  'Computational Humanities',
  'AI in Education',
];

const DEFAULT_TAB = 'Computational Social Science & NLP';

// Parse JSONL into array of papers
const parseJsonl = (jsonlText) => {
  // Split by double newlines (blank lines) to separate JSON objects
  return jsonlText
    .split(/\n\s*\n/)
    .filter(block => block.trim())
    .map(block => JSON.parse(block.trim()));
};

const INITIAL_PAPER_COUNT = 5;

function Research({ title }) {
  const papers = useMemo(() => parseJsonl(papersJsonl), []);
  const { registerFilterFunction } = useFilter();
  // Track expanded content types per paper: { "paperTitle": Set(["video", "demo", "poster", "tldr"]) }
  const [expandedContent, setExpandedContent] = useState(new Map());
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
  const [filterByTitle, setFilterByTitle] = useState(null);
  const [filterByAuthor, setFilterByAuthor] = useState(null);
  const [showAllPapers, setShowAllPapers] = useState(false);

  const formatAuthors = (authors) => {
    if (authors.length === 0) return '';
    
    const formatAuthor = (author) => {
      if (author === site.name) {
        return <strong>{author}</strong>;
      }
      return author;
    };
    
    if (authors.length === 1) {
      return formatAuthor(authors[0]);
    }
    
    if (authors.length === 2) {
      return (
        <>
          {formatAuthor(authors[0])} and {formatAuthor(authors[1])}
        </>
      );
    }
    
    return (
      <>
        {authors.slice(0, -1).map((author, index) => (
          <React.Fragment key={index}>
            {formatAuthor(author)}
            {index < authors.length - 2 ? ', ' : ''}
          </React.Fragment>
        ))}
        , and {formatAuthor(authors[authors.length - 1])}
      </>
    );
  };

  const formatVenue = (venue, year) => (
    <em className="text-gray-500 dark:text-gray-400 italic">
      {year ? `${venue}, ${year}` : venue}
    </em>
  );

  const toggleContentExpansion = (paperTitle, contentType) => {
    setExpandedContent(prev => {
      const newMap = new Map(prev);
      const paperSet = newMap.get(paperTitle) || new Set();
      const newSet = new Set(paperSet);
      
      if (newSet.has(contentType)) {
        // If clicking the same content type, close it
        newSet.delete(contentType);
      } else {
        // If opening a different content type, close any open ones first
        newSet.clear();
        newSet.add(contentType);
      }
      
      if (newSet.size > 0) {
        newMap.set(paperTitle, newSet);
      } else {
        newMap.delete(paperTitle);
      }
      
      return newMap;
    });
  };

  const isContentExpanded = (paperTitle, contentType) => {
    const paperSet = expandedContent.get(paperTitle);
    return paperSet ? paperSet.has(contentType) : false;
  };

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Build poster path
  const getPosterPath = (poster) => {
    if (!poster) return null;
    if (poster.startsWith('http://') || poster.startsWith('https://')) {
      return poster;
    }
    // If it already includes 'poster/', use as is, otherwise prepend 'poster/'
    if (poster.startsWith('poster/')) {
      return `/assets/${poster}`;
    }
    return `/assets/poster/${poster}`;
  };

  // Build demo path
  const getDemoPath = (demo) => {
    if (!demo) return null;
    if (demo.startsWith('http://') || demo.startsWith('https://')) {
      return demo;
    }
    // If it already includes 'ui-demos/', use as is, otherwise prepend 'ui-demos/'
    if (demo.startsWith('ui-demos/')) {
      return `/assets/${demo}`;
    }
    return `/assets/ui-demos/${demo}`;
  };


  // Handle tab selection
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Reset all other filters
    setFilterByTitle(null);
    setFilterByAuthor(null);
  };

  // Register filter function for external use (from About component)
  useEffect(() => {
    const filterAndScroll = (pivot, tab, title = null, author = null) => {
      if (author) {
        // Filter by author
        setFilterByAuthor(author);
        setFilterByTitle(null);
        setActiveTab('All');
      } else if (title) {
        // Filter by title
        setFilterByTitle(title);
        setFilterByAuthor(null);
        setActiveTab('All');
      } else {
        // Normal filtering
        setFilterByTitle(null);
        setFilterByAuthor(null);
        setActiveTab(tab);
      }
      // Scroll to research section
      setTimeout(() => {
        const researchSection = document.getElementById('publications');
        if (researchSection) {
          researchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };
    registerFilterFunction(filterAndScroll);
  }, [registerFilterFunction]);

  // Calculate paper count for each filter.
  const getTabCount = (tab) => {
    if (tab === 'Selected') {
      return papers.filter(paper => paper.selected === true).length;
    }
    if (tab === 'All') {
      return papers.length;
    }
    const rq = tab;
    return papers.filter(paper => (paper.rqs || []).includes(rq)).length;
  };

  const filteredPapers = useMemo(() => {
    let filtered = [...papers];
    
    // If filtering by author, filter papers that contain this author
    // Author names in papers may include special characters like † (U+2020) and *, so we remove them for comparison
    if (filterByAuthor) {
      filtered = filtered.filter(paper => {
        return paper.authors.some(author => {
          // Remove special characters (dagger † U+2020 and asterisk *) for comparison
          const cleanAuthor = author.replace(/\u2020|\*/g, '').trim();
          const cleanFilterName = filterByAuthor.trim();
          return cleanAuthor === cleanFilterName;
        });
      });
      return filtered;
    }
    
    // If filtering by title, show only that paper
    if (filterByTitle) {
      return filtered.filter(paper => paper.title === filterByTitle);
    }
    
    if (activeTab === 'Selected') {
      return filtered.filter(paper => paper.selected === true);
    }
    if (activeTab === 'All') {
      return filtered;
    }
    const rq = activeTab;
    return filtered.filter(paper => (paper.rqs || []).includes(rq));
  }, [papers, activeTab, filterByTitle, filterByAuthor]);

  // Collapse the list again when filters change
  useEffect(() => {
    setShowAllPapers(false);
  }, [activeTab, filterByTitle, filterByAuthor]);

  const previewPapers = filteredPapers.slice(0, INITIAL_PAPER_COUNT);
  const restPapers = filteredPapers.slice(INITIAL_PAPER_COUNT);
  const hasMorePapers = restPapers.length > 0;
  const hiddenCount = restPapers.length;

  const renderPaper = (paper) => {
    const pdfHref = paper.links?.pdf || paper.links?.url;
    const youtubeId = extractYouTubeId(paper.links?.video);
    const externalLinks = [
      pdfHref && { href: pdfHref, label: 'Paper' },
      paper.links?.code && { href: paper.links.code, label: 'Code' },
      paper.links?.poster && { href: getPosterPath(paper.links.poster), label: 'Poster' },
    ].filter(Boolean);
    const expandable = [
      youtubeId && { type: 'video', label: 'Video' },
      paper.links?.demo && { type: 'demo', label: 'UI Demo' },
      paper.description && { type: 'tldr', label: 'TL;DR' },
      paper.bibtex && { type: 'bibtex', label: 'BibTeX' },
    ].filter(Boolean);
    const linkClass =
      'inline-block mr-1.5 text-[13px] leading-snug text-brand-600 dark:text-brand-400 hover:underline';

    return (
      <article key={paper.title} data-paper-title={paper.title} className="py-4 first:pt-1">
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white leading-snug mb-0.5">
          {pdfHref ? (
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {paper.title}
            </a>
          ) : (
            paper.title
          )}
        </h3>
        <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-[1.48]">
          {formatAuthors(paper.authors)}
        </p>
        <p className="text-[15px] leading-[1.48] mt-0.5">
          {formatVenue(paper.venue, paper.year)}
          {paper.awards && (
            <>
              <span className="text-gray-400 dark:text-gray-500"> · </span>
              <span className="text-brand-600 dark:text-brand-400 font-medium not-italic">
                {paper.awards}
              </span>
            </>
          )}
        </p>
        {(externalLinks.length > 0 || expandable.length > 0) && (
          <p className="mt-1">
            {externalLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                [{item.label}]
              </a>
            ))}
            {expandable.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => toggleContentExpansion(paper.title, item.type)}
                className={`${linkClass} bg-transparent border-0 p-0 cursor-pointer ${
                  isContentExpanded(paper.title, item.type) ? 'font-semibold' : ''
                }`}
                aria-label={isContentExpanded(paper.title, item.type) ? `Hide ${item.label}` : `Show ${item.label}`}
              >
                [{item.label}]
              </button>
            ))}
          </p>
        )}

        {youtubeId && (
          <div className={`overflow-hidden transition-all duration-300 ${
            isContentExpanded(paper.title, 'video') ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {paper.links?.demo && (
          <div className={`overflow-hidden transition-all duration-300 ${
            isContentExpanded(paper.title, 'demo') ? 'max-h-[600px] opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}>
            <DemoVideo
              src={getDemoPath(paper.links.demo)}
              isExpanded={isContentExpanded(paper.title, 'demo')}
            />
          </div>
        )}

        {paper.description && (
          <div className={`overflow-hidden transition-all duration-300 ${
            isContentExpanded(paper.title, 'tldr') ? 'max-h-[300px] opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}>
            <p className="pl-3 border-l-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic">
              {paper.description}
            </p>
          </div>
        )}
        {paper.bibtex && (
          <div className={`overflow-hidden transition-all duration-300 ${
            isContentExpanded(paper.title, 'bibtex') ? 'max-h-[400px] opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}>
            <pre className="p-3 rounded bg-gray-100 dark:bg-gray-800 text-xs leading-relaxed font-mono text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
              {paper.bibtex}
            </pre>
          </div>
        )}
      </article>
    );
  };

  return (
    <section id="publications" className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><span className="hand-underline">{title}</span></h2>
        
        {/* Paper filters */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pb-1">
            {PAPER_FILTERS.map((tab) => {
              const isActive = activeTab === tab;
              const count = getTabCount(tab);
              return (
                <button
                  key={tab}
                  onClick={(e) => {
                    handleTabClick(tab);
                    e.currentTarget.blur();
                  }}
                  className={`text-sm uppercase tracking-wide transition-all duration-200 pt-1.5 pb-1 border-b-2 ${
                    isActive
                      ? 'font-bold text-gray-900 dark:text-white border-gray-900 dark:border-white'
                      : 'font-normal text-gray-400 dark:text-gray-500 border-transparent hover:text-gray-600 dark:hover:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ overflow: 'visible' }}>
        {filteredPapers.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4">No papers match the selected filter.</p>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {previewPapers.map(renderPaper)}
            </div>
            {hasMorePapers && (
              <button
                type="button"
                onClick={() => setShowAllPapers((prev) => !prev)}
                className="group flex w-full items-center gap-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors bg-transparent border-0 cursor-pointer"
                aria-expanded={showAllPapers}
              >
                <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors" />
                <span className="shrink-0 tracking-wide lowercase">
                  {showAllPapers ? 'see less' : `see more (${hiddenCount})`}
                </span>
                <span className="h-px flex-1 bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors" />
              </button>
            )}
            {showAllPapers && hasMorePapers && (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {restPapers.map(renderPaper)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Research;
