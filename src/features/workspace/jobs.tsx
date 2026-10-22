'use client';
import { useEffect, useRef, useState } from 'react';
import {
  RefreshCw,
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Bookmark,
} from 'lucide-react';
import styles from './jobs.module.css';
import { disciplineLabels } from '@/features/jobs/presentation';
import { type Job, type UserJobState, disciplineSchema } from '@/domain/job';
import {
  filtersSchema,
  type Filters,
  type RecordRow,
} from '@/domain/workspace';
import { appliedDateFor } from '@/domain/application-state';
import { Sheet } from '@/components/ui/sheet';
import { JobCard } from '@/features/jobs/components/job-card';
import { JobDetail } from '@/features/jobs/components/job-detail';
import { api, useDesk, save, Field, Panel, Empty } from './client';
import { ImportJob, FeedStatus } from './sources';
const split = (value: string) =>
  value
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
export function JobsFeed() {
  const { data, perform, busy } = useDesk();
  const [filters, setFilters] = useState<Filters>(
      () =>
        data.search.find((s) => s.data.isDefault)?.data.filters ||
        filtersSchema.parse({ view: 'vancouver' }),
    ),
    [advanced, setAdvanced] = useState(false),
    [searchId, setSearchId] = useState(''),
    [searchName, setSearchName] = useState(''),
    [jobs, setJobs] = useState<Job[]>([]),
    [next, setNext] = useState<string | null>(null),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(true),
    [loadingMore, setLoadingMore] = useState(false),
    [error, setError] = useState(''),
    [selected, setSelected] = useState<Job | null>(null),
    [open, setOpen] = useState(false),
    [importing, setImporting] = useState(false);
  const [updates, setUpdates] = useState(false);
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const focus = useRef<HTMLButtonElement | null>(null);
  const current = useRef(0);
  function patch(value: Partial<Filters>) {
    setFilters((f) => ({ ...f, ...value }));
  }
  useEffect(() => {
    const token = ++current.current;
    setLoading(true);
    const timer = setTimeout(() => {
      api<{ jobs: Job[]; next: string | null; total: number }>(
        'jobs?filters=' + encodeURIComponent(JSON.stringify(filters)),
      )
        .then((result) => {
          if (token !== current.current) return;
          setJobs(result.jobs);
          setNext(result.next);
          setTotal(result.total);
          setError('');
        })
        .catch((e) => {
          if (token === current.current) setError(e.message);
        })
        .finally(() => {
          if (token === current.current) setLoading(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      current.current++;
    };
  }, [filters, data]);
  useEffect(() => {
    const known = new Set(jobs.map((j) => j.id));
    const timer = setInterval(() => {
      api<{ jobs: Job[] }>(
        'jobs?filters=' + encodeURIComponent(JSON.stringify(filters)),
      )
        .then((r) => {
          if (r.jobs.some((j) => !known.has(j.id))) setUpdates(true);
        })
        .catch(() => {});
    }, 60000);
    return () => clearInterval(timer);
  }, [filters, jobs]);
  const stateFor = (job: Job): UserJobState => {
    const row = data.state.find((s) => s.data.job_id === job.id);
    return {
      id: job.id,
      owner_id: job.owner_id,
      created_at: job.created_at,
      updated_at: job.updated_at,
      job_id: job.id,
      saved: false,
      hidden: false,
      viewed_at: null,
      ...row?.data,
      applied_at: appliedDateFor(job.id, data.application),
    };
  };
  const changeState = (job: Job, patch: Partial<UserJobState>) =>
    perform(() =>
      save(
        'state',
        { ...stateFor(job), ...patch },
        data.state.find((s) => s.data.job_id === job.id) ||
          ({ id: job.id, revision: 0 } as RecordRow<'state'>),
      ),
    );
  const search = data.search.find((s) => s.id === searchId);
  const watermark = data.visit[0]?.data.previous;
  return (
    <section className={styles.board} aria-label="Internship job board">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR INTERNSHIP SEARCH</div>
          <h1>Find your next internship.</h1>
          <p>
            Explore engineering and tech opportunities. Save the ones worth a
            closer look.
          </p>
        </div>
        <div className="desk-actions">
          <button
            className="button"
            disabled={busy}
            onClick={() =>
              perform(
                () => api('sync', {}),
                'Refresh finished. Source details show progress and any errors.',
              )
            }
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            className="button button-primary"
            onClick={() => setImporting(!importing)}
          >
            <Plus size={16} />
            Add job
          </button>
        </div>
      </div>
      <FeedStatus />
      <div className="feed-views" aria-label="Opportunity location views">
        {(
          [
            ['vancouver', 'Metro Vancouver'],
            ['remote', 'Remote from BC'],
            ['relocation', 'Relocation support'],
            ['review', 'Relocation · needs review'],
            ['all', 'All collected jobs'],
          ] as const
        ).map(([view, label]) => (
          <button
            key={view}
            className={`button ${filters.view === view ? 'button-primary' : ''}`}
            aria-pressed={filters.view === view}
            onClick={() => {
              setSearchId('');
              setFilters(filtersSchema.parse({ view }));
              setUpdates(false);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {filters.view === 'relocation' && (
        <p className="desk-muted">
          Stated or conditional moving, housing or visa support. Compare costs
          in job details and confirm work authorization before deciding.
        </p>
      )}
      {filters.view === 'review' && (
        <p className="desk-muted">
          Other Canadian and U.S. roles whose support is not established. These
          have not been judged worth relocating for.
        </p>
      )}
      <label className="feed-freshness">
        Freshness{' '}
        <select
          value={filters.freshness}
          onChange={(e) =>
            patch({ freshness: e.target.value as Filters['freshness'] })
          }
        >
          <option value="any">All dates</option>
          <option value="posted-day">
            Employer posted in the last 24 hours
          </option>
          <option value="discovered-day">
            Discovered in the last 24 hours · excludes baseline
          </option>
        </select>
      </label>
      {updates && (
        <button
          className="button"
          onClick={() => {
            setUpdates(false);
            patch({});
          }}
        >
          New opportunities available · update feed
        </button>
      )}
      {importing && <ImportJob onDone={() => setImporting(false)} />}
      <div className="desk-searchbar">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Search jobs"
            placeholder="Role, technology, or keyword…"
            value={filters.keywords}
            onChange={(e) => patch({ keywords: e.target.value })}
          />
        </label>
        <button
          className="button"
          onClick={() => setAdvanced(!advanced)}
          aria-expanded={advanced}
        >
          <SlidersHorizontal size={16} />
          Filters & searches
        </button>
        <button className="button" onClick={() => setAdvanced(true)}>
          <Bookmark size={16} /> Save search
        </button>
        <button
          className="text-button"
          onClick={() => {
            setSearchId('');
            setSearchName('');
            setFilters(filtersSchema.parse({ view: filters.view }));
            setUpdates(false);
          }}
        >
          Clear filters
        </button>
      </div>
      <div className={styles.quickFilters}>
        <label>
          Country
          <select
            value={
              filters.countries.length === 1
                ? filters.countries[0]
                : filters.countries.length
                  ? 'custom'
                  : ''
            }
            onChange={(e) =>
              patch({ countries: e.target.value ? [e.target.value] : [] })
            }
          >
            <option value="">All countries</option>
            {filters.countries.length > 1 && (
              <option value="custom" disabled>
                Multiple countries
              </option>
            )}
            {filters.countries.length === 1 &&
              !['Canada', 'United States'].includes(filters.countries[0]) && (
                <option value={filters.countries[0]}>
                  {filters.countries[0]}
                </option>
              )}
            <option value="Canada">Canada</option>
            <option value="United States">United States</option>
          </select>
        </label>
        <label>
          Engineering area
          <select
            value={
              filters.disciplines.length === 1
                ? filters.disciplines[0]
                : filters.disciplines.length
                  ? 'custom'
                  : ''
            }
            onChange={(e) =>
              patch({
                disciplines: e.target.value
                  ? [e.target.value as Filters['disciplines'][number]]
                  : [],
              })
            }
          >
            <option value="">All areas</option>
            {filters.disciplines.length > 1 && (
              <option value="custom" disabled>
                Multiple areas
              </option>
            )}
            {disciplineSchema.options.map((d) => (
              <option key={d} value={d}>
                {disciplineLabels[d]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Work arrangement
          <select
            value={
              filters.arrangements.length === 1
                ? filters.arrangements[0]
                : filters.arrangements.length
                  ? 'custom'
                  : ''
            }
            onChange={(e) =>
              patch({
                arrangements: e.target.value
                  ? [e.target.value as Filters['arrangements'][number]]
                  : [],
              })
            }
          >
            <option value="">All arrangements</option>
            {filters.arrangements.length > 1 && (
              <option value="custom" disabled>
                Multiple arrangements
              </option>
            )}
            <option value="on-site">On-site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
            <option value="unknown">Not stated</option>
          </select>
        </label>
      </div>
      <div className="desk-tabs">
        {[
          ['All jobs', {}],
          ['Saved', { saved: true }],
          ['New since last visit', { newOnly: true }],
        ].map(([label, p]) => (
          <button
            key={String(label)}
            className={`button ${(!filters.saved && !filters.newOnly && label === 'All jobs') || (filters.saved && label === 'Saved') || (filters.newOnly && label === 'New since last visit') ? 'button-primary' : ''}`}
            aria-pressed={
              label === 'Saved'
                ? filters.saved
                : label === 'New since last visit'
                  ? filters.newOnly
                  : !filters.saved && !filters.newOnly
            }
            onClick={() =>
              patch({
                saved: false,
                newOnly: false,
                ...(p as Partial<Filters>),
              })
            }
          >
            {String(label)}
          </button>
        ))}
        <select
          aria-label="Saved search"
          value={searchId}
          onChange={(e) => {
            const s = data.search.find((s) => s.id === e.target.value);
            setSearchId(e.target.value);
            if (s) {
              setFilters(s.data.filters);
              setSearchName(s.data.name);
            }
          }}
        >
          <option value="">Saved searches</option>
          {data.search.map((s) => (
            <option key={s.id} value={s.id}>
              {s.data.name}
              {s.data.isDefault ? ' · default' : ''}
            </option>
          ))}
        </select>
      </div>
      {advanced && (
        <Panel
          title="Find the right set of opportunities"
          description="Options within a field are OR; fields combine with AND. No personal eligibility filter is inferred."
        >
          <div className="desk-form-grid">
            {(
              [
                'countries',
                'provinces',
                'cities',
                'technologies',
                'companies',
                'sources',
                'terms',
              ] as const
            ).map((key) => (
              <Field
                key={key}
                label={
                  key[0].toUpperCase() + key.slice(1) + ' (comma separated)'
                }
              >
                <input
                  value={filters[key].join(', ')}
                  onChange={(e) => patch({ [key]: split(e.target.value) })}
                />
              </Field>
            ))}
            <Field label="Keyword mode">
              <select
                value={filters.keywordMode}
                onChange={(e) =>
                  patch({
                    keywordMode: e.target.value as Filters['keywordMode'],
                  })
                }
              >
                <option value="all">All words</option>
                <option value="any">Any word</option>
                <option value="phrase">Exact phrase</option>
              </select>
            </Field>
            <Field label="Exclude phrases (comma separated)">
              <input
                value={filters.exclude}
                onChange={(e) => patch({ exclude: e.target.value })}
              />
            </Field>
            <Field label="Minimum pay">
              <input
                type="number"
                min="0"
                value={filters.minimumPay ?? ''}
                onChange={(e) =>
                  patch({
                    minimumPay: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </Field>
            <Field label="Pay currency / interval">
              <div className="desk-inline">
                <input
                  maxLength={3}
                  value={filters.currency}
                  onChange={(e) =>
                    patch({ currency: e.target.value.toUpperCase() })
                  }
                />
                <select
                  value={filters.payInterval}
                  onChange={(e) =>
                    patch({
                      payInterval: e.target.value as Filters['payInterval'],
                    })
                  }
                >
                  <option>hour</option>
                  <option>month</option>
                  <option>year</option>
                </select>
              </div>
            </Field>
            {(['minimumMonths', 'maximumMonths'] as const).map((k) => (
              <Field
                key={k}
                label={
                  k === 'minimumMonths' ? 'Minimum months' : 'Maximum months'
                }
              >
                <input
                  type="number"
                  min="0"
                  value={filters[k] ?? ''}
                  onChange={(e) =>
                    patch({
                      [k]: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </Field>
            ))}
            <Field label="Applied state">
              <select
                value={filters.applied}
                onChange={(e) =>
                  patch({ applied: e.target.value as Filters['applied'] })
                }
              >
                <option value="any">Any</option>
                <option value="yes">Applied</option>
                <option value="no">Not applied</option>
              </select>
            </Field>
            <Field label="Hidden jobs">
              <select
                value={filters.hidden}
                onChange={(e) =>
                  patch({ hidden: e.target.value as Filters['hidden'] })
                }
              >
                <option value="exclude">Exclude</option>
                <option value="include">Include</option>
                <option value="only">Only hidden</option>
              </select>
            </Field>
          </div>
          <fieldset className="desk-checks">
            <legend>Engineering areas</legend>
            {disciplineSchema.options.map((d) => (
              <label key={d}>
                <input
                  type="checkbox"
                  checked={filters.disciplines.includes(d)}
                  onChange={(e) =>
                    patch({
                      disciplines: e.target.checked
                        ? [...filters.disciplines, d]
                        : filters.disciplines.filter((x) => x !== d),
                    })
                  }
                />
                {d}
              </label>
            ))}
          </fieldset>
          <fieldset className="desk-checks">
            <legend>Arrangement</legend>
            {(['on-site', 'hybrid', 'remote', 'unknown'] as const).map((d) => (
              <label key={d}>
                <input
                  type="checkbox"
                  checked={filters.arrangements.includes(d)}
                  onChange={(e) =>
                    patch({
                      arrangements: e.target.checked
                        ? [...filters.arrangements, d]
                        : filters.arrangements.filter((x) => x !== d),
                    })
                  }
                />
                {d}
              </label>
            ))}
          </fieldset>
          <fieldset className="desk-checks">
            <legend>Include</legend>
            {(
              [
                'includeUnknownPay',
                'includeUnknownTerm',
                'includeUnknownLocation',
                'canadaRemote',
              ] as const
            ).map((k) => (
              <label key={k}>
                <input
                  type="checkbox"
                  checked={filters[k]}
                  onChange={(e) => patch({ [k]: e.target.checked })}
                />
                {
                  {
                    includeUnknownPay: 'Unknown pay',
                    includeUnknownTerm: 'Unknown term',
                    includeUnknownLocation: 'Unknown location',
                    canadaRemote: 'Only remote explicitly open to Canada',
                  }[k]
                }
              </label>
            ))}
            <label>
              <input
                type="checkbox"
                checked={filters.types.includes('new-grad')}
                onChange={(e) =>
                  patch({
                    types: e.target.checked
                      ? [...filters.types, 'new-grad']
                      : filters.types.filter((t) => t !== 'new-grad'),
                  })
                }
              />
              New graduate roles
            </label>
          </fieldset>
          <Field
            label="Straight-line radius in km"
            hint="Uses your Settings origin. Strict mode includes exact workplace coordinates only; unknown locations never match a radius."
          >
            <input
              type="number"
              min="1"
              value={filters.radius?.km ?? ''}
              onChange={(e) => {
                const origin = data.profile[0]?.data.origin;
                if (e.target.value && origin)
                  patch({
                    radius: {
                      ...origin,
                      km: Number(e.target.value),
                      approximate: false,
                    },
                  });
                else patch({ radius: null });
              }}
              disabled={!data.profile[0]?.data.origin}
            />
          </Field>
          {filters.radius && (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={filters.radius.approximate}
                onChange={(e) =>
                  patch({
                    radius: {
                      ...filters.radius!,
                      approximate: e.target.checked,
                    },
                  })
                }
              />
              Include postal approximations and city centroids
            </label>
          )}
          <div className="desk-divider" />
          <Field label="Search name">
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </Field>
          <div className="desk-actions">
            <button
              className="button button-primary"
              disabled={busy || !searchName.trim()}
              onClick={() =>
                perform(() =>
                  save(
                    'search',
                    {
                      name: searchName,
                      filters,
                      isDefault: search?.data.isDefault || false,
                      version: 1,
                    },
                    search,
                  ),
                )
              }
            >
              Save search
            </button>
            <button
              className="button"
              disabled={!search}
              onClick={() =>
                perform(() =>
                  save('search', {
                    name: searchName + ' copy',
                    filters,
                    isDefault: false,
                    version: 1,
                  }),
                )
              }
            >
              Duplicate
            </button>
            <button
              className="button"
              disabled={!search}
              onClick={() =>
                perform(() =>
                  save('search', { ...search!.data, isDefault: true }, search),
                )
              }
            >
              Make default
            </button>
            <button
              className="button"
              disabled={!search}
              onClick={() =>
                perform(async () => {
                  await api('delete/search', { id: search!.id });
                  setSearchId('');
                })
              }
            >
              Delete search
            </button>
            <button
              className="text-button"
              onClick={() => setFilters(filtersSchema.parse({}))}
            >
              Clear filters
            </button>
          </div>
        </Panel>
      )}
      <div className="results-toolbar">
        <p role="status">
          {loading ? 'Loading opportunities…' : `${total} opportunities`}
        </p>
        <span>Newest first · posted, otherwise discovered</span>
        <div className={styles.layoutControls} aria-label="Results layout">
          <button
            className="icon-button"
            aria-label="List layout"
            aria-pressed={layout === 'list'}
            onClick={() => setLayout('list')}
          >
            <List size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Grid layout"
            aria-pressed={layout === 'grid'}
            onClick={() => setLayout('grid')}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>
      {error && (
        <div role="alert" className="desk-alert">
          {error}
        </div>
      )}
      <Sheet open={open} onOpenChange={setOpen}>
        <div
          className={`jobs-grid ${layout === 'list' ? styles.list : ''}`}
          aria-busy={loading}
        >
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              state={stateFor(job)}
              newSince={
                !job.baseline && !!watermark && job.first_seen_at > watermark
              }
              onSave={() => changeState(job, { saved: !stateFor(job).saved })}
              onOpen={(trigger) => {
                focus.current = trigger;
                setSelected(job);
                void changeState(job, { viewed_at: new Date().toISOString() });
              }}
            />
          ))}
        </div>
        {selected && (
          <JobDetail
            job={selected}
            state={stateFor(selected)}
            returnFocus={focus}
            onSave={() =>
              changeState(selected, { saved: !stateFor(selected).saved })
            }
            onApplied={() => {
              window.location.href = '/applications?job=' + selected.id;
            }}
            privateMode
            onHide={() =>
              changeState(selected, { hidden: !stateFor(selected).hidden })
            }
          />
        )}
      </Sheet>
      {!loading && !jobs.length && (
        <Empty>
          No opportunities match this view. Change your filters or add a source.
        </Empty>
      )}
      {next && (
        <button
          className="button"
          disabled={busy || loading || loadingMore}
          onClick={async () => {
            const token = current.current;
            setLoadingMore(true);
            setError('');
            try {
              const r = await api<{ jobs: Job[]; next: string | null }>(
                'jobs?filters=' +
                  encodeURIComponent(JSON.stringify(filters)) +
                  '&cursor=' +
                  encodeURIComponent(next),
              );
              if (token !== current.current) return;
              setJobs((j) => [
                ...j,
                ...r.jobs.filter(
                  (job) => !j.some((existing) => existing.id === job.id),
                ),
              ]);
              setNext(r.next);
            } catch (e) {
              if (token === current.current) setError((e as Error).message);
            } finally {
              setLoadingMore(false);
            }
          }}
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </section>
  );
}
