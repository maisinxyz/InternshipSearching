'use client';

import {
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Wallet,
} from 'lucide-react';
import type { Job, UserJobState } from '@/domain/job';
import { CompanyLogo } from '@/components/ui/company-logo';
import { SheetTrigger } from '@/components/ui/sheet';
import {
  arrangementLabels,
  dateLabel,
  feedDate,
  salaryLabel,
} from '../presentation';
import { isNewJob } from '../data/fixtures';

export function JobCard({
  job,
  state,
  onOpen,
  onSave,
  newSince,
}: {
  newSince?: boolean;
  job: Job;
  state: UserJobState;
  onOpen: (trigger: HTMLButtonElement) => void;
  onSave: () => void;
}) {
  const date = feedDate(job);
  return (
    <article className="job-card">
      <div className="card-company-row">
        <CompanyLogo company={job.company} />
        <div className="card-company">
          <span>{job.company.name}</span>
          <small>
            {job.employment_type === 'co-op' ? 'Co-op' : 'Internship'}
          </small>
        </div>
        {(newSince ?? isNewJob(job)) && <span className="new-label">New</span>}
        <button
          className={`icon-button bookmark-button ${state.saved ? 'is-saved' : ''}`}
          aria-label={`${state.saved ? 'Unsave' : 'Save'} ${job.title} at ${job.company.name}`}
          aria-pressed={state.saved}
          onClick={onSave}
        >
          <Bookmark size={19} fill={state.saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <h2 className="card-title">
        <SheetTrigger asChild>
          <button
            className="card-title-button"
            onClick={(event) => onOpen(event.currentTarget)}
          >
            <span>{job.title}</span>
            <ArrowUpRight size={19} />
          </button>
        </SheetTrigger>
      </h2>
      <div className="card-location">
        <MapPin size={14} />
        <span>
          {job.locations
            .map((location) => location.original_text)
            .join(' · ')}
        </span>
        <span className="meta-dot">·</span>
        <span>{arrangementLabels[job.work_arrangement]}</span>
      </div>
      <div className="card-facts">
        {job.salary && (
          <span>
            <Wallet size={15} />
            {salaryLabel(job)}
          </span>
        )}
        {job.term && (
          <span>
            <CalendarDays size={15} />
            {job.term.label}
            {job.duration ? (
              <>
                <span className="meta-dot">·</span>
                {job.duration.months} months
              </>
            ) : null}
          </span>
        )}
        {!job.salary && !job.term && (
          <span className="muted">
            <Clock3 size={15} />
            Pay and work term not stated
          </span>
        )}
      </div>
      <div className="technology-list">
        {job.technologies.slice(0, 3).map((tech) => (
          <span key={tech}>{tech}</span>
        ))}
      </div>
      <footer className="card-footer">
        <div className="source-labels">
          {job.sources.map((source) => (
            <span key={source.id}>
              <span className="source-dot" />
              {source.label}
            </span>
          ))}
        </div>
        <span className={state.applied_at ? 'applied-label' : 'card-date'}>
          {state.applied_at ? (
            <>
              <Check size={13} />
              Applied
            </>
          ) : (
            `${date.basis} ${dateLabel(date.date).replace(', 2026', '')}`
          )}
        </span>
      </footer>
    </article>
  );
}
