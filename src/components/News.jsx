import React, { Fragment } from 'react';
import { useFilter } from '../contexts/FilterContext';
import newsData from '../data/news.json';

function News({ title }) {
  const { filterByPaperTitle } = useFilter();
  const highlights = newsData.highlights;

  const formatDate = (dateString) => {
    // Dates are YYYY-MM-DD, which JS parses as UTC midnight; format in UTC so
    // visitors west of UTC don't see the previous month.
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const year = date.getUTCFullYear();
    return `${month} ${year}`;
  };

  const handlePaperClick = (paperTitle, e) => {
    e.preventDefault();
    filterByPaperTitle(paperTitle);
  };

  const renderTextWithLinks = (text, paperLinks) => {
    if (!paperLinks) return text;

    // Sort keys by length (longest first) to handle overlapping matches correctly
    const linkKeys = Object.keys(paperLinks).sort((a, b) => b.length - a.length);
    
    // Create a regex pattern that matches whole words only
    let lastIndex = 0;
    
    // Find all matches with their positions
    const matches = [];
    linkKeys.forEach(key => {
      const keyLower = key.toLowerCase();
      const regex = new RegExp(`\\b${keyLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          key: key,
          paperTitle: paperLinks[key]
        });
      }
    });
    
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);
    
    // Remove overlapping matches (keep the first one)
    const nonOverlappingMatches = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (nonOverlappingMatches.length === 0 || 
          match.start >= nonOverlappingMatches[nonOverlappingMatches.length - 1].end) {
        nonOverlappingMatches.push(match);
      }
    }
    
    // Build the JSX with links
    const elements = [];
    nonOverlappingMatches.forEach((match, index) => {
      // Add text before the match
      if (match.start > lastIndex) {
        elements.push(text.substring(lastIndex, match.start));
      }
      
      // Add the link
      const matchedText = text.substring(match.start, match.end);
      elements.push(
        <a
          key={index}
          href="#"
          onClick={(e) => handlePaperClick(match.paperTitle, e)}
          className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline"
        >
          {matchedText}
        </a>
      );
      
      lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }
    
    return elements.length > 0 ? elements : text;
  };

  const externalLinkClass =
    'text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline';

  const externalLinkAnchor = (href, linkLabel) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={externalLinkClass}
    >
      {linkLabel}
    </a>
  );

  const renderExternalLinkInPlainText = (plainText, href, linkText) => {
    const resolvedLinkText = linkText || href;
    const linkIndex = plainText.indexOf(resolvedLinkText);
    if (linkIndex !== -1) {
      const beforeText = plainText.substring(0, linkIndex);
      const afterText = plainText.substring(linkIndex + resolvedLinkText.length);
      return (
        <>
          {beforeText}
          {externalLinkAnchor(href, resolvedLinkText)}
          {afterText}
        </>
      );
    }
    return (
      <>
        {plainText}{' '}
        {externalLinkAnchor(href, resolvedLinkText)}
      </>
    );
  };

  /** Apply external link to plain-text segments only (preserves adjacent paper link nodes). */
  const mergeExternalLinkIntoContent = (content, href, linkText) => {
    const resolvedLinkText = linkText || href;
    const wrapSegmentIfMatch = (plainText, key) => {
      const linkIndex = plainText.indexOf(resolvedLinkText);
      if (linkIndex === -1) return plainText;
      const beforeText = plainText.substring(0, linkIndex);
      const afterText = plainText.substring(linkIndex + resolvedLinkText.length);
      return (
        <Fragment key={key}>
          {beforeText}
          {externalLinkAnchor(href, resolvedLinkText)}
          {afterText}
        </Fragment>
      );
    };

    if (typeof content === 'string') {
      return renderExternalLinkInPlainText(content, href, linkText);
    }
    if (Array.isArray(content) || React.isValidElement(content)) {
      const parts = Array.isArray(content)
        ? content
        : React.Children.toArray(content.props?.children ?? content);
      let foundExternal = false;
      const mapped = parts.map((part, idx) => {
        if (typeof part !== 'string') return part;
        if (part.indexOf(resolvedLinkText) !== -1) {
          foundExternal = true;
          return wrapSegmentIfMatch(part, idx);
        }
        return part;
      });
      if (!foundExternal) {
        return (
          <>
            {mapped}
            {' '}
            {externalLinkAnchor(href, resolvedLinkText)}
          </>
        );
      }
      return <>{mapped}</>;
    }
    return content;
  };

  const resolveExternalLinks = (item) => {
    const links = { ...(item.externalLinks || {}) };
    if (item.externalLink) {
      links[item.linkText || item.externalLink] = item.externalLink;
    }
    return links;
  };

  const applyExternalLinks = (content, externalLinks) => {
    const entries = Object.entries(externalLinks || {});
    return entries.reduce(
      (acc, [linkText, href]) => mergeExternalLinkIntoContent(acc, href, linkText),
      content
    );
  };

  const renderHighlights = (highlights) => (
    <div className="space-y-3.5">
      {highlights.map((item, index) => {
        const externalLinks = resolveExternalLinks(item);
        const hasExternal = Object.keys(externalLinks).length > 0;

        let textContent;
        if (item.paperLinks && hasExternal) {
          textContent = applyExternalLinks(
            renderTextWithLinks(item.text, item.paperLinks),
            externalLinks
          );
        } else if (hasExternal) {
          textContent = applyExternalLinks(item.text, externalLinks);
        } else if (item.paperLinks) {
          textContent = renderTextWithLinks(item.text, item.paperLinks);
        } else if (item.paperTitle) {
          textContent = (
            <a
              href="#"
              onClick={(e) => handlePaperClick(item.paperTitle, e)}
              className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline"
            >
              {item.text}
            </a>
          );
        } else {
          textContent = item.text;
        }

        return (
          <div key={index} className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 items-baseline">
            <span className="text-[13.5px] text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
              {formatDate(item.date)}
            </span>
            <span className="text-[15px] leading-[1.55] text-gray-800 dark:text-gray-200">{textContent}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <section id="news" className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white"><span className="hand-underline">{title}</span></h2>
      </div>

      <div className="paper-card flex flex-col bg-[var(--theme-bg-secondary)] dark:bg-gray-800 border border-[var(--theme-border)] dark:border-gray-700">
        <div className="overflow-y-auto max-h-[360px] p-4">
          {renderHighlights(highlights)}
        </div>
      </div>
    </section>
  );
}

export default News;
