import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import papersJsonl from '../data/papers.jsonl?raw';
import { site } from '../config/site';
import { collaborations } from '../data/collaborations';
import { papersForMentors, parsePapersJsonl } from '../utils/papers';
import YappingMachines from './YappingMachines';

const papers = parsePapersJsonl(papersJsonl);

const mentorLinkClass =
  'text-brand-700 dark:text-brand-400 hover:underline';
const pubLinkClass =
  'text-gray-500 dark:text-gray-400 hover:underline';

// Shared so only one org tooltip is open at a time (important on mobile).
let closeOpenOrgTooltip = null;

function usePreferHover() {
  const [preferHover, setPreferHover] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setPreferHover(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    // First real touch → permanently prefer tap (covers iOS sticky-hover quirks)
    const onTouch = () => setPreferHover(false);
    window.addEventListener('touchstart', onTouch, { once: true, passive: true });
    return () => {
      mq.removeEventListener?.('change', sync);
      window.removeEventListener('touchstart', onTouch);
    };
  }, []);

  return preferHover;
}

function Org({ orgKey }) {
  const org = collaborations[orgKey];
  const tooltipId = useId();
  const rootRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const preferHover = usePreferHover();

  const pubs = useMemo(
    () => (org ? papersForMentors(papers, org.mentors) : []),
    [org]
  );

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openTooltip = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    // Brief grace period so the pointer can cross into the tooltip / links.
    closeTimerRef.current = setTimeout(() => setOpen(false), 220);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (!open) return undefined;

    const close = () => {
      clearCloseTimer();
      setOpen(false);
    };
    // Close any other open org tooltip first.
    if (closeOpenOrgTooltip && closeOpenOrgTooltip !== close) {
      closeOpenOrgTooltip();
    }
    closeOpenOrgTooltip = close;

    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        close();
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      if (closeOpenOrgTooltip === close) closeOpenOrgTooltip = null;
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!org) return null;

  const hasMentors = org.mentors?.length > 0;
  const hasPubs = pubs.length > 0;
  const hasTip = Boolean(org.tip);
  const hasPubsNote = Boolean(org.pubsNote);
  const hasContent = hasTip || hasMentors || hasPubs || hasPubsNote;

  const tooltipBody = hasTip && !hasMentors ? (
    <span className="block">{org.tip}</span>
  ) : (
    <span className="block">
      {hasMentors &&
        org.mentors.map((m, i) => (
          <span key={m.name}>
            {i > 0 && ', '}
            {m.url ? (
              <a
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className={mentorLinkClass}
              >
                {m.name}
              </a>
            ) : (
              m.name
            )}
          </span>
        ))}
      {(hasPubs || hasPubsNote) && (
        <span>
          {' '}(
          {hasPubs
            ? pubs.map((p, i) => (
                <span key={p.title}>
                  {i > 0 && ', '}
                  {p.pdf ? (
                    <a
                      href={p.pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={pubLinkClass}
                    >
                      {p.label}
                    </a>
                  ) : (
                    <span>{p.label}</span>
                  )}
                </span>
              ))
            : org.pubsNote}
          )
        </span>
      )}
    </span>
  );

  return (
    <span
      ref={rootRef}
      className="relative inline whitespace-nowrap align-baseline"
      onMouseEnter={() => {
        if (hasContent && preferHover) openTooltip();
      }}
      onMouseLeave={() => {
        if (preferHover) scheduleClose();
      }}
    >
      <button
        type="button"
        className={`inline p-0 m-0 bg-transparent border-0 ${hasContent ? 'cursor-help' : 'cursor-default'} text-inherit font-inherit leading-[inherit] align-baseline`}
        aria-describedby={hasContent && open ? tooltipId : undefined}
        aria-expanded={hasContent ? open : undefined}
        onClick={(e) => {
          if (!hasContent || preferHover) return;
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        {org.icon && (
          <img
            src={`/assets/icons/${org.icon}`}
            alt=""
            aria-hidden="true"
            className="inline-block h-[1em] w-[1em] object-contain rounded-sm align-[-0.125em] mr-1"
          />
        )}
        <span className="org-mark-name">{org.name}</span>
      </button>

      {hasContent && open && (
        <span
          id={tooltipId}
          role="tooltip"
          className={[
            'z-30',
            // Padding (not margin) bridges the gap so the pointer stays in-hover
            // while moving between the org mark and the tooltip body.
            preferHover
              ? 'absolute left-1/2 bottom-full -translate-x-1/2 pb-2'
              : 'absolute left-0 top-full pt-1.5',
          ].join(' ')}
        >
          <span className="relative block w-max max-w-[min(18rem,calc(100vw-2rem))] rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-left text-xs leading-snug text-gray-700 dark:text-gray-200 shadow-lg normal-case font-normal whitespace-normal">
            {tooltipBody}

            {preferHover && (
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-900"
              />
            )}
          </span>
        </span>
      )}
    </span>
  );
}

const iconClass =
  'w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors';

function SocialLinks() {
  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      <a
        href={`mailto:${site.email}`}
        className={iconClass}
        title="Email"
        aria-label="Email"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </a>
      {site.scholar && (
        <a
          href={site.scholar}
          target="_blank"
          rel="noopener noreferrer"
          className={iconClass}
          title="Google Scholar"
          aria-label="Google Scholar"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5s-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
          </svg>
        </a>
      )}
      <a
        href={site.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={iconClass}
        title="LinkedIn"
        aria-label="LinkedIn"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.128 0c0 1.141-.926 2.065-2.065 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      </a>
      <a
        href={site.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className={iconClass}
        title="Twitter/X"
        aria-label="Twitter/X"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={site.github}
        target="_blank"
        rel="noopener noreferrer"
        className={iconClass}
        title="GitHub"
        aria-label="GitHub"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
      <a
        href={site.cv}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center h-5 text-sm font-semibold leading-none text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        title="CV"
        aria-label="CV"
      >
        CV
      </a>
    </div>
  );
}

const linkClass = 'text-brand-700 dark:text-brand-400 hover:underline';

function ExtLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
    </a>
  );
}

function About() {
  return (
    <section id="about" className="mb-4">
      {/* Photo + name/first paragraph — photo height matches the text block on desktop */}
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 sm:items-stretch">
        <div className="flex-shrink-0 mx-auto sm:mx-0 w-36 aspect-square sm:aspect-auto sm:w-40 sm:self-stretch rounded-2xl overflow-hidden">
          <img
            src={site.photo}
            alt={`A photo of ${site.name}`}
            className="w-full h-full object-cover object-[50%_30%] origin-center"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {site.name}
              </h1>
              <p className="mt-1 text-[15px] text-gray-500 dark:text-gray-400">
                {site.tagline}
              </p>
            </div>
            <SocialLinks />
          </div>

          <p className="text-[15px] leading-[1.55] text-gray-700 dark:text-gray-300">
            I&apos;m a researcher currently affiliated with Tel Aviv University and Bar-Ilan University. I completed both my undergraduate and graduate studies at Tel Aviv University. My interests have evolved over the years, and currently, I am most interested in how language models represent and understand meaning in different contexts.
          </p>

          <YappingMachines />
        </div>
      </div>

      {/* Rest of bio — full width below the photo */}
      <div className="mt-4 text-[15px] leading-[1.55] text-gray-700 dark:text-gray-300 space-y-3">
        <p>Some questions I have been recently thinking about:</p>

        <ol className="list-decimal list-outside space-y-2 ml-6">
          <li className="pl-2">How do language models represent concepts across different ways of expressing the same idea?</li>
          <li className="pl-2">How do models recover intended meaning when language is figurative, indirect, or deceptive?</li>
          <li className="pl-2">How do models integrate meaning across events, characters, and context to build a coherent understanding of a narrative?</li>
        </ol>

        <p>
          My underlying goal is to understand how LLMs behave as they increasingly interact with people, especially across different linguistic and social contexts. I explore these problems through a combined lens of NLP, human-centered AI, and computational social science.
        </p>

        <p>
          I&apos;ve been fortunate to collaborate with wonderful mentors across these areas, including{' '}
          <ExtLink href="https://sites.google.com/mail.huji.ac.il/dr-chen-shani/bio?authuser=0">Dr. Chen Shani</ExtLink>,{' '}
          <ExtLink href="https://scholar.google.com/citations?hl=en&user=va3JOtYAAAAJ&view_op=list_works&sortby=pubdate">Prof. Rakesh Verma</ExtLink>,{' '}
          <ExtLink href="https://scholar.google.com/citations?hl=en&user=2-T_yUUAAAAJ&view_op=list_works&sortby=pubdate">Dr. Hila Chalutz</ExtLink>, and{' '}
          <ExtLink href="https://scholar.google.com/citations?hl=en&user=7lw3CSEAAAAJ&view_op=list_works&sortby=pubdate">Dr. Kfir Bar</ExtLink>. I also worked extensively under{' '}
          <ExtLink href="https://www.cs.tau.ac.il/%7Enachumd/Homepage.html">Prof. Nachum Dershowitz</ExtLink> and{' '}
          <ExtLink href="https://www.iradbengal.sites.tau.ac.il/">Prof. Irad Ben-Gal</ExtLink> during my bachelor&apos;s and master&apos;s.
        </p>

        <p>
          I&apos;m also a mentor in the joint initiative between PGIMER Chandigarh and Thapar University, along with{' '}
          <ExtLink href="https://hpsingh.info/">Dr. Harpreet Singh</ExtLink>, which aims to build accessible healthcare technologies for low-resource regions in India.
        </p>

        <p>
          Outside of research, I enjoy deep dives into completely unrelated topics (the classic YouTube rabbit holes ;)), cooking, watching F1, and exploring new cities!
        </p>

        <p>
          I&apos;m always happy to discuss interesting research problems, ideas, or potential collaborations. Please feel free to{' '}
          <a href={`mailto:${site.email}`} className={linkClass}>reach out</a>&nbsp;😀
        </p>
      </div>
    </section>
  );
}

export default About;
