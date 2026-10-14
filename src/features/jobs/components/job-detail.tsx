'use client';

import {
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  MapPin,
  Sparkles,
  Wallet,
  Clock3,
  CircleAlert,
} from 'lucide-react';
import type { EvidenceField, Job, UserJobState } from '@/domain/job';
import { CompanyLogo } from '@/components/ui/company-logo';
import {
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  arrangementLabels,
  dateLabel,
  feedDate,
  locationLabel,
  salaryLabel,
} from '../presentation';
import type { ReactNode, RefObject } from 'react';

function Evidence({ job, field }: { job: Job; field: EvidenceField }) {
  const evidence = job.evidence.filter((item) => item.field === field);
  if (!evidence.length) return null;
  return (
    <details className="evidence">
      <summary>
        View source wording <ChevronDown size={12} />
      </summary>
      {evidence.map((item) => {
        const snapshot = job.snapshots.find(
          (snapshot) => snapshot.id === item.snapshot_id,
        );
        const source = job.sources.find(
          (source) => source.id === snapshot?.job_source_id,
        );
        return (
          <div key={item.id}>
            <blockquote>{item.quote}</blockquote>
            <small>{source?.label} · {item.method}</small>
          </div>
        );
      })}
    </details>
  );
}

function Fact({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="detail-fact">
      <div className="fact-label">
        {icon}
        {label}
      </div>
      <div className="fact-value">{children}</div>
    </div>
  );
}

export function JobDetail({
  job,
  state,
  onSave,
  onApplied,
  returnFocus,
  privateMode = false,
  onHide,
}: {
  privateMode?: boolean;
  onHide?: () => void;
  job: Job;
  state: UserJobState;
  onSave: () => void;
  onApplied: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  const date = feedDate(job);
  const applicationUrl = job.sources.find(
    (source) => source.application_url,
  )?.application_url;
  return (
    <SheetContent
      className="job-detail"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        const target = returnFocus.current?.isConnected
          ? returnFocus.current
          : document.getElementById('main-content');
        target?.focus({ preventScroll: true });
      }}
    >
      <div className="detail-topline">
        <span>
          <FileText size={14} />
          Job details
        </span>
        <span className="sample-pill">{job.snapshots[0].kind === "fixture" ? "Sample job" : job.status}</span>
      </div>
      <div className="detail-heading">
        <div className="detail-company">
          <CompanyLogo company={job.company} large />
          <div>
            <p>{job.company.name}</p>
            <small>
              {job.employment_type === 'co-op' ? 'Co-op' : 'Internship'} ·{' '}
              {job.requisition_id}
            </small>
          </div>
        </div>
        <SheetTitle className="detail-title">{job.title}</SheetTitle>
        <SheetDescription className="detail-subtitle">
          {locationLabel(job)} · {arrangementLabels[job.work_arrangement]}
        </SheetDescription>
        <div className="detail-date">
          {date.basis} {dateLabel(date.date)}
          {date.date.precision === 'day' ? ' · Date only' : ''}
        </div>
        <div className="detail-primary-actions">
          {applicationUrl ? (
            <a
              className="button button-primary"
              href={applicationUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open application
              <ExternalLink size={15} />
            </a>
          ) : (
            <button
              className="button button-primary"
              disabled
              title="Sample jobs do not have real application links"
            >
              Open application
              <ExternalLink size={15} />
            </button>
          )}
          <button
            className={`button ${state.saved ? 'button-saved' : ''}`}
            aria-pressed={state.saved}
            onClick={onSave}
          >
            <Bookmark size={16} fill={state.saved ? 'currentColor' : 'none'} />
            {state.saved ? 'Saved' : 'Save job'}
          </button>
        </div>
        {job.snapshots[0].kind === "fixture" && <p className="sample-note">
          Demonstration content, not a live vacancy. Employer names and logos
          identify the sample only.
        </p>}
      </div>
      <div className="detail-body">
        <section className="detail-section">
          <h3>What you’ll work on</h3>
          <ul className="clean-list">
            {job.involves.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Evidence job={job} field="involves" />
        </section>
        <section className="detail-section">
          <h3>Technologies & engineering areas</h3>
          <div className="technology-list detail-technologies">
            {job.technologies.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
          <Evidence job={job} field="technologies" />
        </section>
        <section className="detail-section">
          <h3>What they’re looking for</h3>
          <h4>Required</h4>
          <ul className="clean-list">
            {job.required.length ? (
              job.required.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>Not stated</li>
            )}
          </ul>
          <Evidence job={job} field="required" />
          <h4>Preferred</h4>
          <ul className="clean-list">
            {job.preferred.length ? (
              job.preferred.map((item) => <li key={item}>{item}</li>)
            ) : (
              <li>Not stated</li>
            )}
          </ul>
          <Evidence job={job} field="preferred" />
        </section>
        <section className="detail-section">
          <h3>The practical details</h3>
          <div className="detail-facts-grid">
            <Fact icon={<Wallet size={15} />} label="Pay">
              <p>{salaryLabel(job)}</p>
              {job.salary?.qualification && (
                <small>{job.salary.qualification}</small>
              )}
              <Evidence job={job} field="salary" />
            </Fact>
            <Fact icon={<Clock3 size={15} />} label="Duration">
              <p>
                {job.conflicts.some((conflict) => conflict.field === 'Duration')
                  ? 'Conflicting source values'
                  : (job.duration?.original_text ?? 'Not stated')}
              </p>
              <Evidence job={job} field="duration" />
            </Fact>
            <Fact icon={<CalendarDays size={15} />} label="Work term / start">
              <p>{job.term?.label ?? 'Not stated'}</p>
              <small>
                Start date:{' '}
                {job.term?.start_date
                  ? dateLabel({ precision: 'day', value: job.term.start_date })
                  : 'Not stated'}
              </small>
              <Evidence job={job} field="term" />
            </Fact>
            <Fact icon={<MapPin size={15} />} label="Location & arrangement">
              <p>{locationLabel(job)}</p>
              <small>
                {job.work_arrangement === 'unknown'
                  ? 'Work arrangement: Not stated'
                  : arrangementLabels[job.work_arrangement]}
              </small>
              {job.work_arrangement === 'remote' && (
                <small>
                  Open to Canada:{' '}
                  {job.remote_open_to_canada === true
                    ? 'Explicitly stated'
                    : job.remote_open_to_canada === false
                      ? 'No'
                      : 'Not stated'}
                </small>
              )}
              <Evidence job={job} field="location" />
            </Fact>
            <Fact
              icon={<CalendarDays size={15} />}
              label="Application deadline"
            >
              <p>{dateLabel(job.deadline)}</p>
              <Evidence job={job} field="deadline" />
            </Fact>
          </div>
        </section>
        {job.conflicts.length > 0 && (
          <aside className="conflict-note">
            <CircleAlert size={18} />
            <div>
              <strong>Sources disagree</strong>
              {job.conflicts.map((conflict) => (
                <div key={conflict.field}>
                  <p>{conflict.field} needs confirmation.</p>
                  {conflict.values.map((value) => (
                    <p key={value.source_id}>
                      {
                        job.sources.find(
                          (source) => source.id === value.source_id,
                        )?.label
                      }
                      : <strong>{value.original_value}</strong>
                    </p>
                  ))}
                </div>
              ))}
              <p>Both original values are retained below.</p>
            </div>
          </aside>
        )}
        <section className="detail-section original-section">
          <h3>Original wording & sources</h3>
          <p className="section-caption">
            These are authored sample descriptions. Each highlight links to
            wording from its sample.
          </p>
          {job.snapshots.map((snapshot) => (
            <details className="original-description" key={snapshot.id}>
              <summary>
                <FileText size={16} />
                <span>
                  {
                    job.sources.find(
                      (source) => source.id === snapshot.job_source_id,
                    )?.label
                  }{' '}
                  description
                </span>
                <ChevronDown size={15} />
              </summary>
              <div className="original-text">
                {snapshot.sections.map((section) => (
                  <section key={section.heading}>
                    <h4>{section.heading}</h4>
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.items.length > 0 && (
                      <ul>
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </details>
          ))}
          <div className="source-links">
            {job.sources.map((source) => (
              <div key={source.id}>
                <strong>{source.label}</strong>
                {source.source_url ? (
                  <a href={source.source_url} target="_blank" rel="noreferrer">
                    Original posting
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span>Original posting: Not available for this sample</span>
                )}
                {source.application_url ? (
                  <a
                    href={source.application_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Application link
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span>Application link: Not available for this sample</span>
                )}
              </div>
            ))}
            {job.company.careers_url && (
              <a
                href={job.company.careers_url}
                target="_blank"
                rel="noreferrer"
              >
                Visit {job.company.name} careers
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <dl className="source-dates">
            <div>
              <dt>Original posting date</dt>
              <dd>{dateLabel(job.source_posted_at)}</dd>
            </div>
            <div>
              <dt>First discovered</dt>
              <dd>
                {dateLabel({ precision: 'instant', value: job.first_seen_at })}
              </dd>
            </div>
            <div>
              <dt>Source last updated</dt>
              <dd>{dateLabel(job.source_updated_at)}</dd>
            </div>
          </dl>
        </section>
        {privateMode ? <section className="detail-section preparation"><h3>Your next steps</h3><div className="desk-actions"><a className="button" href={"/resume?job="+job.id}>Tailor resume</a><a className="button button-primary" href={"/applications?job="+job.id}>Prepare application</a><button className="button" onClick={onHide}>{state.hidden?"Unhide job":"Hide job"}</button></div><p>Submission is recorded manually in Applications.</p></section> : <section className="detail-section preparation">
          <h3>Your next steps</h3>
          <div className="preparation-buttons">
            <button
              className="button"
              disabled
              title="Resume tools are not available in this preview"
            >
              <Sparkles size={15} />
              Tailor resume
            </button>
            <button
              className="button"
              disabled
              title="Application preparation is not available in this preview"
            >
              <FileText size={15} />
              Prepare application
            </button>
          </div>
          <p className="section-caption">
            Resume tools and application preparation will be added later.
          </p>
          <button
            className={`button ${state.applied_at ? 'button-saved' : ''}`}
            onClick={onApplied}
            aria-pressed={Boolean(state.applied_at)}
          >
            <Check size={16} />
            {state.applied_at
              ? 'Applied · undo sample status'
              : 'Mark applied in preview'}
          </button>
          <p className="section-caption">
            Sample status lasts until you reload. Opening a link never changes
            it.
          </p>
        </section>}
      </div>
    </SheetContent>
  );
}
