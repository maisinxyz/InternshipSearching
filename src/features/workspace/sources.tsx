'use client';
import { useEffect, useState } from 'react';
import type { Job } from '@/domain/job';
import { connectorSchema, type RecordRow } from '@/domain/workspace';
import { importBlockedReason } from '@/domain/account-sources';
import { automaticTypes, isAutomatic, sourceHealth } from '@/domain/collection';
import { useDesk, api, save, Field, Panel, Empty } from './client';
export function ImportJob({
  onDone,
  connector,
}: {
  onDone?: () => void;
  connector?: RecordRow<'connector'>;
}) {
  const { perform, busy } = useDesk();
  const [url, setUrl] = useState(''),
    [text, setText] = useState(''),
    [title, setTitle] = useState(''),
    [company, setCompany] = useState(''),
    [useAI, setAI] = useState(false),
    [postingId, setPostingId] = useState(''),
    [preview, setPreview] = useState<Job | null>(null);
  const blocked = connector ? importBlockedReason(connector) : null;
  const employerLinkOnly = connector?.data.type === 'intern-insider';
  return (
    <Panel
      title={
        connector ? `Import from ${connector.data.name}` : 'Add an opportunity'
      }
      description={
        employerLinkOnly
          ? 'Find a job using your subscription, open its employer posting, and paste that public employer URL here. Co-op Desk retrieves the employer page, not your subscription account.'
          : 'Import an accessible public posting, or paste one selected job’s description. Review the preview before saving. Keep the original source link with the description.'
      }
    >
      <div className="desk-form-grid">
        {connector?.data.type === 'myexperience' && (
          <Field
            label="SFU job ID"
            hint="The numeric ID beside the job title. Keeps different SFU postings separate."
          >
            <input
              value={postingId}
              onChange={(e) => {
                setPostingId(e.target.value);
                setPreview(null);
              }}
              inputMode="numeric"
            />
          </Field>
        )}
        <Field
          label={
            employerLinkOnly ? 'Public employer posting URL' : 'Posting URL'
          }
        >
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setPreview(null);
            }}
          />
        </Field>
        <Field label="Role title, if needed">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setPreview(null);
            }}
          />
        </Field>
        <Field label="Company, if needed">
          <input
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              setPreview(null);
            }}
          />
        </Field>
      </div>
      {!employerLinkOnly && (
        <Field label="Pasted description">
          <textarea
            rows={6}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setPreview(null);
            }}
          />
        </Field>
      )}
      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={useAI}
          onChange={(e) => {
            setAI(e.target.checked);
            setPreview(null);
          }}
        />
        Use Gemini to extract facts from this posting
      </label>
      <button
        className="button"
        disabled={busy || !!blocked}
        onClick={() =>
          perform(
            async () =>
              setPreview(
                await api<Job>('import-preview', {
                  url,
                  text,
                  title,
                  company,
                  useAI,
                  connectorId: connector?.id,
                  postingId,
                }),
              ),
            'Preview ready. Review the extracted facts.',
          )
        }
      >
        {busy ? 'Preparing preview…' : 'Preview import'}
      </button>
      {blocked && <p role="status">{blocked}</p>}
      {preview && (
        <div className="desk-preview">
          <h3>{preview.title}</h3>
          <p>{preview.company.name}</p>
          <p>
            Source: {preview.sources[0].label}
            {connector?.data.type === 'myexperience'
              ? ` · SFU job ${preview.requisition_id}`
              : ''}
          </p>
          <p>
            {preview.locations
              .map((location) => location.original_text)
              .join(' · ') || 'Location not stated'}{' '}
            ·{' '}
            {preview.work_arrangement === 'unknown'
              ? 'Arrangement not stated'
              : preview.work_arrangement}
          </p>
          {connector?.data.type === 'myexperience' && (
            <p>
              Apply through SFU MyExperience using job ID{' '}
              {preview.requisition_id}. Follow all application instructions in
              the retained posting, including any employer website step.
            </p>
          )}
          <p>
            Pay: {preview.salary?.original_text || 'Not stated'} · Term:{' '}
            {preview.term?.label || 'Not stated'}
          </p>
          <p>{preview.technologies.join(' · ') || 'Technologies not stated'}</p>
          <details>
            <summary>Original text and evidence</summary>
            <pre>{preview.snapshots[0].original_text}</pre>
            {preview.evidence.map((e) => (
              <blockquote key={e.id}>
                {e.field}: {e.quote}
              </blockquote>
            ))}
          </details>
          <button
            className="button button-primary"
            disabled={busy || !!blocked}
            onClick={() =>
              perform(async () => {
                await api('import-save', preview);
                setPreview(null);
                setText('');
                onDone?.();
              }, 'Job saved.')
            }
          >
            Confirm and save
          </button>
        </div>
      )}
    </Panel>
  );
}
export function FeedStatus() {
  const [status, setStatus] = useState<{
    configured: boolean;
    healthy: boolean;
    lastRun: string | null;
    error: string | null;
  } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const check = () =>
      api<NonNullable<typeof status>>('feed-status')
        .then((s) => {
          if (active) {
            setStatus(s);
            setError('');
          }
        })
        .catch(() => {
          if (active) setError('Unable to check collection status.');
        });
    void check();
    const timer = setInterval(check, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);
  return (
    <div className="feed-health" role="status">
      <span
        className={`feed-health-dot ${status?.healthy ? 'healthy' : ''}`}
        aria-hidden
      />
      <div>
        <strong>
          {error ||
            (!status
              ? 'Checking collection status…'
              : status.healthy
                ? 'Scheduled collection is running'
                : status.configured
                  ? 'Scheduled collection needs attention'
                  : 'Automatic collection needs deployment')}
        </strong>
        <small>
          {status?.lastRun
            ? `Last scheduled run: ${new Date(status.lastRun).toLocaleString()}`
            : 'Manual checks are available. Background checks have not been verified.'}
          {status?.error ? ` · ${status.error}` : ''}
        </small>
      </div>
    </div>
  );
}
export function Sources() {
  const { data, perform, busy } = useDesk();
  const [edit, setEdit] = useState<RecordRow<'connector'>>();
  const [name, setName] = useState(''),
    [type, setType] = useState('greenhouse'),
    [board, setBoard] = useState('');
  const [repository, setRepository] = useState(''),
    [path, setPath] = useState('README.md');
  const [reuse, setReuse] = useState(false),
    [notice, setNotice] = useState('');
  const [technical, setTechnical] = useState(true),
    [students, setStudents] = useState(true),
    [canada, setCanada] = useState(false),
    [interval, setIntervalMinutes] = useState(15);
  const sources = data.connector.filter((c) => isAutomatic(c.data.type));
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">DIRECT FROM EMPLOYERS</div>
          <h1>Feed coverage</h1>
          <p>
            Vancouver engineering, work from home, and opportunities worth a
            move.
          </p>
        </div>
      </div>
      <FeedStatus />
      <Panel
        title="Build your employer watchlist"
        description="Start with Tenstorrent, Astera Labs, Moment Energy, Kepler, Waabi and 1Password, plus a supplementary GitHub list. Existing board settings and saved jobs are retained."
      >
        <button
          className="button button-primary"
          disabled={busy}
          onClick={() =>
            perform(
              () => api('setup-sources', {}),
              'Employer watchlist ready. Check boards now to collect jobs.',
            )
          }
        >
          Set up employer watchlist
        </button>
        <p className="desk-muted">
          Priority boards target five-minute checks after deployment. A
          successful check can find no new jobs.
        </p>
      </Panel>
      <div className="desk-source-list">
        {sources.map((c) => (
          <Panel
            key={c.id}
            title={c.data.name}
            description={`${sourceHealth(c.data)} · ${c.data.intervalMinutes}-minute target`}
          >
            <p>
              Last complete check:{' '}
              {c.data.lastSync
                ? new Date(c.data.lastSync).toLocaleString()
                : 'Not checked yet'}
            </p>
            {c.data.cursor > 0 && (
              <p>Processing saved batch · {c.data.cursor} postings processed</p>
            )}
            {c.data.error && <p role="alert">{c.data.error}</p>}
            {c.data.failures > 0 && c.data.nextRunAt && (
              <p>Retry after {new Date(c.data.nextRunAt).toLocaleString()}</p>
            )}
            <p className="desk-muted">
              {c.data.type === 'github'
                ? 'Community discovery · descriptions may be incomplete'
                : 'Direct employer descriptions'}{' '}
              ·{' '}
              {c.data.config.studentOnly
                ? 'Internships / co-ops / students'
                : 'All role titles'}{' '}
              ·{' '}
              {c.data.config.canadaOnly
                ? 'Canadian workplaces'
                : 'All locations; filtered in Jobs'}
            </p>
            <div className="desk-actions">
              <button
                className="button"
                disabled={busy || c.data.state !== 'connected'}
                onClick={() =>
                  perform(
                    () => api('sync', { id: c.id }),
                    'Board checked. Any remaining batch continues on the next scheduled run.',
                  )
                }
              >
                Check now
              </button>
              <button
                className="button"
                disabled={busy}
                onClick={() =>
                  perform(() =>
                    save(
                      'connector',
                      {
                        ...c.data,
                        state:
                          c.data.state === 'connected' ? 'paused' : 'connected',
                      },
                      c,
                    ),
                  )
                }
              >
                {c.data.state === 'connected' ? 'Pause' : 'Resume'}
              </button>
              <button
                className="button"
                onClick={() => {
                  setEdit(c);
                  setName(c.data.name);
                  setType(c.data.type);
                  setBoard(c.data.config.board || '');
                  setRepository(c.data.config.repository || '');
                  setPath(c.data.config.path || 'README.md');
                  setReuse(c.data.config.reuseConfirmed);
                  setNotice(c.data.config.licenseNotice);
                  setStudents(c.data.config.studentOnly);
                  setTechnical(c.data.config.technicalOnly);
                  setCanada(c.data.config.canadaOnly);
                  setIntervalMinutes(c.data.intervalMinutes);
                  document
                    .getElementById('board-editor')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Edit coverage
              </button>
              <button
                className="text-button"
                disabled={busy}
                onClick={() =>
                  perform(
                    () => api('delete/connector', { id: c.id }),
                    'Board removed. Jobs and application history retained.',
                  )
                }
              >
                Remove board
              </button>
            </div>
          </Panel>
        ))}
      </div>
      {!sources.length && (
        <Empty>
          Set up the employer watchlist to begin collecting public postings.
        </Empty>
      )}
      <div id="board-editor">
        <Panel
          title={edit ? 'Edit employer board' : 'Add an employer board'}
          description="Find the board name in the employer’s public careers link. No employer account is needed."
        >
          <div className="desk-form-grid">
            <Field label="Board platform">
              <select
                disabled={!!edit}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {automaticTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Employer or list name">
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            {type === 'github' ? (
              <>
                <Field label="GitHub owner/repository">
                  <input
                    value={repository}
                    onChange={(e) => setRepository(e.target.value)}
                  />
                </Field>
                <Field label="Table file path">
                  <input
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                  />
                </Field>
              </>
            ) : (
              <Field label="Public board name">
                <input
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  placeholder="e.g. momentenergy"
                />
              </Field>
            )}
            <Field label="Target check interval">
              <select
                value={interval}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
              >
                {[5, 15, 30, 60].map((n) => (
                  <option key={n} value={n}>
                    Every {n} minutes
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="desk-checks">
            <label>
              <input
                type="checkbox"
                checked={technical}
                onChange={(e) => setTechnical(e.target.checked)}
              />
              Broad tech and engineering titles
            </label>
            <label>
              <input
                type="checkbox"
                checked={students}
                onChange={(e) => setStudents(e.target.checked)}
              />
              Intern / co-op / student roles only
            </label>
            <label>
              <input
                type="checkbox"
                checked={canada}
                onChange={(e) => setCanada(e.target.checked)}
              />
              Collect Canadian workplaces only
            </label>
          </div>
          {type === 'github' && (
            <>
              <Field label="License / attribution notice">
                <textarea
                  value={notice}
                  onChange={(e) => setNotice(e.target.value)}
                />
              </Field>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={reuse}
                  onChange={(e) => setReuse(e.target.checked)}
                />
                I reviewed this repository’s reuse terms.
              </label>
            </>
          )}
          <div className="desk-actions">
            <button
              className="button button-primary"
              disabled={busy || !name.trim()}
              onClick={() =>
                perform(async () => {
                  await save(
                    'connector',
                    connectorSchema.parse({
                      ...edit?.data,
                      name,
                      type,
                      state: edit?.data.state || 'connected',
                      intervalMinutes: interval,
                      config: {
                        ...edit?.data.config,
                        board,
                        repository,
                        path,
                        studentOnly: students,
                        technicalOnly: technical,
                        canadaOnly: canada,
                        reuseConfirmed: reuse,
                        licenseNotice: notice,
                      },
                    }),
                    edit,
                  );
                  setEdit(undefined);
                  setName('');
                  setBoard('');
                }, 'Employer board saved.')
              }
            >
              {edit ? 'Save coverage' : 'Add board'}
            </button>
            {edit && (
              <button
                className="text-button"
                onClick={() => {
                  setEdit(undefined);
                  setName('');
                  setBoard('');
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </Panel>
      </div>
      <p className="desk-muted">
        Earlier imported jobs retain their original sources. Subscription and
        university accounts are no longer part of feed setup.
      </p>
      <ImportJob />
    </>
  );
}
