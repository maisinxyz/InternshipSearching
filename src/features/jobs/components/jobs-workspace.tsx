'use client';

import { useMemo, useRef, useState } from 'react';
import {
  ArrowDownWideNarrow,
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Code2,
  Cpu,
  FileText,
  FolderKanban,
  Inbox,
  LayoutGrid,
  ListFilter,
  MapPin,
  Menu,
  Network,
  RefreshCw,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import type { Arrangement, Discipline, UserJobState } from '@/domain/job';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { fixtureJobs, fixtureUserStates, isNewJob } from '../data/fixtures';
import {
  arrangementLabels,
  disciplineLabels,
  newestFirst,
} from '../presentation';
import { JobCard } from './job-card';
import { JobDetail } from './job-detail';

type Tab = 'all' | 'saved' | 'new';
type PreviewState = 'ready' | 'loading' | 'empty' | 'error';
type Preset = 'all' | Discipline;

const presets = [
  {
    id: 'software' as const,
    label: 'Software & C++',
    caption: 'Software internships',
    icon: Code2,
  },
  {
    id: 'firmware' as const,
    label: 'Embedded & firmware',
    caption: 'Embedded & firmware co-ops',
    icon: Cpu,
  },
  {
    id: 'electrical' as const,
    label: 'Electrical & electronics',
    caption: 'Electrical & electronics co-ops',
    icon: Zap,
  },
];

export function JobsWorkspace() {
  const [preset, setPreset] = useState<Preset>('all');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [discipline, setDiscipline] = useState<Discipline | 'all'>('all');
  const [arrangement, setArrangement] = useState<Arrangement | 'all'>('all');
  const [province, setProvince] = useState('all');
  const [term, setTerm] = useState('all');
  const [hideApplied, setHideApplied] = useState(false);
  const [preview, setPreview] = useState<PreviewState>('ready');
  const [states, setStates] = useState(fixtureUserStates);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const selected = fixtureJobs.find((job) => job.id === selectedId);
  const savedCount = states.filter((state) => state.saved).length;
  const newCount = fixtureJobs.filter(isNewJob).length;
  const activeFilters = [
    discipline !== 'all',
    arrangement !== 'all',
    province !== 'all',
    term !== 'all',
    hideApplied,
  ].filter(Boolean).length;
  const stateFor = (id: string) => states.find((state) => state.job_id === id)!;

  const jobs = useMemo(
    () =>
      fixtureJobs
        .filter((job) => {
          const state = states.find((state) => state.job_id === job.id)!;
          const searchText = [
            job.title,
            job.company.name,
            ...job.technologies,
            ...job.disciplines,
            ...job.locations.map((location) => location.original_text),
          ]
            .join(' ')
            .toLowerCase();
          return (
            (preset === 'all' || job.disciplines.includes(preset)) &&
            (discipline === 'all' || job.disciplines.includes(discipline)) &&
            (arrangement === 'all' || job.work_arrangement === arrangement) &&
            (province === 'all' ||
              job.locations.some(
                (location) => location.province === province,
              )) &&
            (term === 'all' ||
              (term === 'unknown' ? !job.term : job.term?.label === term)) &&
            (!hideApplied || !state.applied_at) &&
            (tab !== 'saved' || state.saved) &&
            (tab !== 'new' || isNewJob(job)) &&
            query
              .trim()
              .toLowerCase()
              .split(/\s+/)
              .every((token) => searchText.includes(token))
          );
        })
        .sort(newestFirst),
    [
      preset,
      query,
      tab,
      discipline,
      arrangement,
      province,
      term,
      hideApplied,
      states,
    ],
  );

  function updateState(id: string, update: Partial<UserJobState>) {
    setStates((current) =>
      current.map((state) =>
        state.job_id === id
          ? { ...state, ...update, updated_at: new Date().toISOString() }
          : state,
      ),
    );
  }

  function toggleSaved(id: string) {
    const saved = !stateFor(id).saved;
    updateState(id, { saved });
    setAnnouncement(
      saved ? 'Job saved in this preview.' : 'Job removed from saved jobs.',
    );
  }

  function clearFilters() {
    setPreset('all');
    setDiscipline('all');
    setArrangement('all');
    setProvince('all');
    setTerm('all');
    setHideApplied(false);
    setQuery('');
    setTab('all');
    setPreview('ready');
  }

  function choosePreset(value: Preset) {
    clearFilters();
    setPreset(value);
    setMobileNavOpen(false);
  }

  function refresh() {
    setPreview('loading');
    window.setTimeout(() => {
      setPreview('ready');
      setAnnouncement('Sample jobs reloaded. No live sources are connected.');
    }, 450);
  }

  const navigation = (
    <>
      <a className="brand" href="/" aria-label="Co-op Desk home">
        <span className="brand-mark">
          <BriefcaseBusiness size={21} strokeWidth={1.65} />
        </span>
        <span>
          co-op<span className="brand-light">desk</span>
          <span className="brand-period">.</span>
        </span>
      </a>
      <div className="workspace-label">PERSONAL WORKSPACE</div>
      <nav aria-label="Main navigation" className="main-navigation">
        <button
          className="nav-item active"
          aria-current="page"
          onClick={() => choosePreset('all')}
        >
          <BriefcaseBusiness size={18} />
          <span>Jobs</span>
          <span className="nav-count">{fixtureJobs.length}</span>
        </button>
        <button
          className="nav-item"
          disabled
          title="Application history will be added later"
        >
          <FolderKanban size={18} />
          <span>Applications</span>
        </button>
        <button
          className="nav-item"
          disabled
          title="Source connections will be added later"
        >
          <Network size={18} />
          <span>Sources</span>
        </button>
        <button
          className="nav-item"
          disabled
          title="Resume tools will be added later"
        >
          <FileText size={18} />
          <span>Resume</span>
        </button>
      </nav>
      <div className="sidebar-divider" />
      <div className="sidebar-section-label">
        BROWSE PRESETS
        <span title="Sample shortcuts; saved-search editing comes later">
          <Bookmark size={13} />
        </span>
      </div>
      <nav aria-label="Job browse presets" className="preset-navigation">
        <button
          className={`preset-item ${preset === 'all' && tab === 'all' ? 'preset-active' : ''}`}
          aria-pressed={preset === 'all' && tab === 'all'}
          onClick={() => choosePreset('all')}
        >
          <span className="preset-bullet" />
          All opportunities
        </button>
        {presets.map((item) => (
          <button
            className={`preset-item ${preset === item.id ? 'preset-active' : ''}`}
            aria-pressed={preset === item.id}
            key={item.id}
            onClick={() => choosePreset(item.id)}
          >
            <span className="preset-bullet" />
            {item.label}
          </button>
        ))}
        <button
          className={`preset-item ${tab === 'saved' ? 'preset-active' : ''}`}
          aria-pressed={tab === 'saved'}
          onClick={() => {
            clearFilters();
            setTab('saved');
            setMobileNavOpen(false);
          }}
        >
          <Bookmark size={14} />
          Saved jobs<span className="preset-count">{savedCount}</span>
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="desk-note">
          <span className="desk-note-icon">
            <Sparkles size={17} />
          </span>
          <strong>A space for your next step.</strong>
          <p>
            Explore the possibilities.
            <br />
            Keep the ones that stand out.
          </p>
        </div>
        <button
          className="nav-item settings-nav"
          disabled
          title="Settings will be added later"
        >
          <Settings2 size={18} />
          <span>Settings</span>
        </button>
        <div className="profile">
          <span className="avatar">VO</span>
          <div>
            <strong>Vince Ong</strong>
            <small>Personal workspace</small>
          </div>
          <span className="profile-dot" />
        </div>
      </div>
    </>
  );

  const filters = (
    <div className="filter-fields">
      <label>
        Discipline
        <select
          value={discipline}
          onChange={(event) =>
            setDiscipline(event.target.value as Discipline | 'all')
          }
        >
          <option value="all">All disciplines</option>
          {Object.entries(disciplineLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Province
        <select
          value={province}
          onChange={(event) => setProvince(event.target.value)}
        >
          <option value="all">All of Canada</option>
          <option value="BC">British Columbia</option>
          <option value="ON">Ontario</option>
          <option value="AB">Alberta</option>
        </select>
      </label>
      <label>
        Work arrangement
        <select
          value={arrangement}
          onChange={(event) =>
            setArrangement(event.target.value as Arrangement | 'all')
          }
        >
          <option value="all">Any arrangement</option>
          {Object.entries(arrangementLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Work term
        <select value={term} onChange={(event) => setTerm(event.target.value)}>
          <option value="all">Any work term</option>
          <option>Winter 2027</option>
          <option>Summer 2027</option>
          <option value="unknown">Not stated</option>
        </select>
      </label>
      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={hideApplied}
          onChange={(event) => setHideApplied(event.target.checked)}
        />
        Hide applied jobs
      </label>
    </div>
  );

  return (
    <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
      <a className="skip-link" href="#main-content">
        Skip to jobs
      </a>
      <div className="app-shell">
        <aside className="sidebar">{navigation}</aside>
        <div className="workspace-main">
          <header className="topbar">
            <div className="breadcrumb">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <button
                    className="icon-button mobile-menu"
                    aria-label="Open navigation"
                  >
                    <Menu size={21} />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="mobile-sidebar">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <SheetDescription className="sr-only">
                    Browse jobs and workspace destinations.
                  </SheetDescription>
                  {navigation}
                </SheetContent>
              </Sheet>
              <span className="breadcrumb-home">
                <LayoutGrid size={15} />
                Workspace
                <ChevronRight size={13} />
              </span>
              <span>Jobs</span>
            </div>
            <div className="topbar-right">
              <span className="sample-pill">
                <span />
                Sample workspace
              </span>
              <span className="topbar-divider" />
              <span className="topbar-location">
                <MapPin size={14} />
                Canada
              </span>
            </div>
          </header>
          <main id="main-content" className="feed-main" tabIndex={-1}>
            <div className="page-heading">
              <div>
                <div className="eyebrow">MAKE YOUR NEXT MOVE</div>
                <h1>
                  {preset === 'all'
                    ? 'All opportunities'
                    : presets.find((item) => item.id === preset)?.caption}
                </h1>
                <p>Your next co-op starts with a little exploring.</p>
              </div>
              <button
                aria-label="Refresh samples"
                className="button refresh-button"
                onClick={refresh}
                disabled={preview === 'loading'}
              >
                <RefreshCw
                  size={16}
                  className={preview === 'loading' ? 'spin' : ''}
                />
                <span>Refresh samples</span>
              </button>
            </div>
            <div className="sample-banner">
              <span className="sample-banner-icon">
                <BriefcaseBusiness size={17} />
              </span>
              <p>
                <strong>A preview of your job board.</strong> Explore{' '}
                {fixtureJobs.length} sample roles across software, firmware, and
                electrical engineering.
              </p>
              <span className="banner-label">FIXTURE DATA</span>
            </div>
            <div className="feed-tabs" aria-label="Job views">
              {(
                [
                  { id: 'all', label: 'All jobs', count: fixtureJobs.length },
                  { id: 'saved', label: 'Saved', count: savedCount },
                  { id: 'new', label: 'New since last visit', count: newCount },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  className={`feed-tab ${tab === item.id ? 'selected' : ''}`}
                  aria-pressed={tab === item.id}
                  onClick={() => setTab(item.id)}
                >
                  {item.id === 'saved' && <Bookmark size={14} />}
                  <span>{item.label}</span>
                  <span className="tab-count">{item.count}</span>
                </button>
              ))}
            </div>
            <div className="search-row">
              <label className="search-field">
                <Search size={18} />
                <span className="sr-only">Search jobs</span>
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by role, company, or technology…"
                />
                {query && (
                  <button
                    className="icon-button"
                    onClick={() => {
                      setQuery('');
                      searchRef.current?.focus();
                    }}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <button className="button filter-button">
                    <SlidersHorizontal size={16} />
                    Filters
                    {activeFilters > 0 && (
                      <span className="filter-count">{activeFilters}</span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent className="filters-sheet">
                  <div className="panel-heading">
                    <span className="eyebrow">REFINE YOUR VIEW</span>
                    <SheetTitle>Filter opportunities</SheetTitle>
                    <SheetDescription>
                      Filter the sample roles. Unknown work terms and
                      arrangements stay visible until you choose a specific
                      value.
                    </SheetDescription>
                  </div>
                  {filters}
                  <div className="filter-sheet-actions">
                    <button className="button" onClick={clearFilters}>
                      Reset filters
                    </button>
                    <button
                      className="button button-primary"
                      onClick={() => setFilterOpen(false)}
                    >
                      Show {jobs.length} jobs
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="quick-filters">
              <label className="filter-chip">
                <MapPin size={14} />
                <span className="sr-only">Province quick filter</span>
                <select
                  aria-label="Province quick filter"
                  value={province}
                  onChange={(event) => setProvince(event.target.value)}
                >
                  <option value="all">Canada</option>
                  <option value="BC">British Columbia</option>
                  <option value="ON">Ontario</option>
                  <option value="AB">Alberta</option>
                </select>
                <ChevronDown size={12} />
              </label>
              <label className="filter-chip">
                <Code2 size={14} />
                <select
                  aria-label="Discipline quick filter"
                  value={discipline}
                  onChange={(event) =>
                    setDiscipline(event.target.value as Discipline | 'all')
                  }
                >
                  <option value="all">All disciplines</option>
                  {Object.entries(disciplineLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} />
              </label>
              <label className="filter-chip term-chip">
                <ListFilter size={14} />
                <select
                  aria-label="Work term quick filter"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                >
                  <option value="all">Any work term</option>
                  <option>Winter 2027</option>
                  <option>Summer 2027</option>
                  <option value="unknown">Not stated</option>
                </select>
                <ChevronDown size={12} />
              </label>
              {(activeFilters > 0 || preset !== 'all' || query) && (
                <button className="text-button" onClick={clearFilters}>
                  Clear filters
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="results-toolbar">
              <p role="status">
                {preview === 'loading' ? (
                  'Loading sample opportunities…'
                ) : (
                  <>
                    <strong>
                      {preview === 'empty' || preview === 'error'
                        ? 0
                        : jobs.length}
                    </strong>{' '}
                    {jobs.length === 1 ? 'opportunity' : 'opportunities'}
                    <span className="results-extra"> to explore</span>
                  </>
                )}
              </p>
              <span>
                <ArrowDownWideNarrow size={15} />
                Newest first
              </span>
            </div>
            {preview === 'loading' ? (
              <div
                className="jobs-grid"
                aria-busy="true"
                aria-label="Loading jobs"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <div className="job-card skeleton-card" key={index}>
                    <div className="skeleton skeleton-company" />
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton" />
                    <div className="skeleton skeleton-short" />
                    <div className="skeleton skeleton-tags" />
                  </div>
                ))}
              </div>
            ) : preview === 'error' ? (
              <div className="feed-state" role="alert">
                <span className="state-icon">
                  <CircleAlert size={26} />
                </span>
                <h2>We couldn’t load these jobs</h2>
                <p>
                  This is the error preview. Your saved samples are still here.
                </p>
                <button
                  className="button button-primary"
                  onClick={() => setPreview('ready')}
                >
                  <RefreshCw size={16} />
                  Try again
                </button>
              </div>
            ) : preview === 'empty' || jobs.length === 0 ? (
              <div className="feed-state">
                <span className="state-icon">
                  <Inbox size={28} />
                </span>
                <h2>
                  {tab === 'saved' && !savedCount
                    ? 'Keep a few possibilities close'
                    : 'No opportunities in this view'}
                </h2>
                <p>
                  {tab === 'saved' && !savedCount
                    ? 'Use the bookmark on a job to find it here.'
                    : 'Try a different keyword or loosen your filters.'}
                </p>
                <button
                  className="button button-primary"
                  onClick={clearFilters}
                >
                  View all opportunities
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    state={stateFor(job.id)}
                    onSave={() => toggleSaved(job.id)}
                    onOpen={(trigger) => {
                      returnFocus.current = trigger;
                      setSelectedId(job.id);
                      updateState(job.id, {
                        viewed_at: new Date().toISOString(),
                      });
                    }}
                  />
                ))}
              </div>
            )}
            <footer className="feed-footer">
              <span>
                <Check size={14} />
                {preview === 'ready' && jobs.length > 0
                  ? 'You’re all caught up with these samples.'
                  : 'Sample data · No live sources connected'}
              </span>
              <label>
                Preview state
                <select
                  aria-label="Preview feed state"
                  value={preview}
                  onChange={(event) =>
                    setPreview(event.target.value as PreviewState)
                  }
                >
                  <option value="ready">Default</option>
                  <option value="loading">Loading</option>
                  <option value="empty">Empty</option>
                  <option value="error">Error</option>
                </select>
              </label>
            </footer>
          </main>
        </div>
      </div>
      {selected && (
        <JobDetail
          key={selected.id}
          job={selected}
          state={stateFor(selected.id)}
          onSave={() => toggleSaved(selected.id)}
          onApplied={() => {
            const applied = !stateFor(selected.id).applied_at;
            updateState(selected.id, {
              applied_at: applied ? new Date().toISOString() : null,
            });
            setAnnouncement(
              applied
                ? 'Marked applied for this preview only.'
                : 'Sample applied status removed.',
            );
          }}
          returnFocus={returnFocus}
        />
      )}
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
    </Sheet>
  );
}
