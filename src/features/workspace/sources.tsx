'use client';
import { useState } from 'react';
import type { Job } from '@/domain/job';
import { connectorSchema, type RecordRow } from '@/domain/workspace';
import { accountSource, importBlockedReason } from '@/domain/account-sources';
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
          : 'Import an accessible public posting, or paste one selected job’s description. Review the preview before saving. For SFU, keep the posting URL and paste the description from your signed-in tab.'
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
export function Sources() {
  const { data, perform, busy } = useDesk();
  const [edit, setEdit] = useState<RecordRow<'connector'> | undefined>(),
    [importSource, setImportSource] = useState<string | null>(null),
    [name, setName] = useState(''),
    [type, setType] = useState('github'),
    [board, setBoard] = useState(''),
    [repository, setRepository] = useState('vanshb03/Summer2027-Internships'),
    [path, setPath] = useState('README.md'),
    [reuse, setReuse] = useState(false),
    [licenseNotice, setLicenseNotice] = useState(''),
    [canada, setCanada] = useState(true),
    [students, setStudents] = useState(true),
    [expiry, setExpiry] = useState('');
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR DISCOVERY ROUTINE</div>
          <h1>Sources</h1>
          <p>Choose the places your opportunities come from.</p>
        </div>
      </div>
      <Panel
        title="Starter job sources"
        description="Collect Canadian student roles from Tenstorrent, Kepler Communications and a licensed Summer 2027 GitHub list. SFU MyExperience, Intern Insider, Workday, LinkedIn and other sites use URL or pasted-text import. Existing source settings are retained."
      >
        <button
          className="button button-primary"
          disabled={busy}
          onClick={() =>
            perform(
              () => api('setup-sources', {}),
              'Starter sources configured. Refresh the connected sources to collect their jobs.',
            )
          }
        >
          Set up starter sources
        </button>
      </Panel>
      <div className="desk-source-list">
        {data.connector.map((c) => (
          <Panel
            key={c.id}
            title={c.data.name}
            description={`${c.data.type} · ${c.data.state} · ${['github', 'greenhouse', 'lever'].includes(c.data.type) ? 'Manual / stale-on-open refresh · scheduling not configured' : 'URL / pasted text import only'}`}
          >
            <p>
              Last successful sync:{' '}
              {c.data.lastSync
                ? new Date(c.data.lastSync).toLocaleString()
                : 'Never'}
              {c.data.cursor ? ` · Next batch starts at ${c.data.cursor}` : ''}
            </p>
            {['github', 'greenhouse', 'lever'].includes(c.data.type) && (
              <p className="desk-muted">
                Collection:{' '}
                {c.data.config.canadaOnly
                  ? 'Explicit Canadian workplaces'
                  : 'All stated countries'}{' '}
                ·{' '}
                {c.data.config.studentOnly
                  ? 'Intern / co-op / student titles'
                  : 'All role titles'}
              </p>
            )}
            {c.data.error && <p role="alert">{c.data.error}</p>}
            {accountSource(c.data.type) && (
              <div>
                <p>{accountSource(c.data.type)!.description}</p>
                <p className="desk-muted">
                  Sign-in stays on the provider’s website in your browser. Co-op
                  Desk does not store its password or session, and cannot check
                  whether you are signed in.
                </p>
                <p>
                  Imports: {c.data.config.importsEnabled ? 'enabled' : 'off'}
                  {c.data.expiresAt
                    ? ` · Configured expiry: ${c.data.expiresAt}`
                    : ''}
                </p>
                <div className="desk-actions">
                  <a
                    className="button"
                    href={accountSource(c.data.type)!.loginUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Sign in to {accountSource(c.data.type)!.name}
                  </a>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() =>
                      perform(
                        () =>
                          save(
                            'connector',
                            {
                              ...c.data,
                              config: {
                                ...c.data.config,
                                importsEnabled: !c.data.config.importsEnabled,
                              },
                            },
                            c,
                          ),
                        c.data.config.importsEnabled
                          ? 'Source imports disabled. Existing jobs were retained.'
                          : 'Source imports enabled. Sign in on the provider’s site, then import a selected job.',
                      )
                    }
                  >
                    {c.data.config.importsEnabled
                      ? 'Disable imports'
                      : 'Enable imports'}
                  </button>
                  <button
                    className="button"
                    disabled={busy || !!importBlockedReason(c)}
                    onClick={() =>
                      setImportSource(importSource === c.id ? null : c.id)
                    }
                  >
                    Import a job
                  </button>
                  <a
                    href={accountSource(c.data.type)!.guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Access details
                  </a>
                </div>
                {importBlockedReason(c) && (
                  <p className="desk-muted">{importBlockedReason(c)}</p>
                )}
              </div>
            )}
            <div className="desk-actions">
              {['github', 'greenhouse', 'lever'].includes(c.data.type) && (
                <button
                  className="button"
                  disabled={busy || c.data.state !== 'connected'}
                  onClick={() =>
                    perform(
                      () => api('sync', { id: c.id }),
                      'Source refreshed. Refresh again if another batch remains.',
                    )
                  }
                >
                  Refresh batch
                </button>
              )}
              <button
                className="button"
                onClick={() =>
                  perform(() =>
                    save(
                      'connector',
                      {
                        ...c.data,
                        state:
                          c.data.state === 'paused'
                            ? ['github', 'greenhouse', 'lever'].includes(
                                c.data.type,
                              )
                              ? 'connected'
                              : 'import-only'
                            : 'paused',
                      },
                      c,
                    ),
                  )
                }
              >
                {c.data.state === 'paused' ? 'Resume' : 'Pause'}
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
                  setLicenseNotice(c.data.config.licenseNotice || '');
                  setCanada(c.data.config.canadaOnly ?? false);
                  setStudents(c.data.config.studentOnly ?? false);
                  setExpiry(c.data.expiresAt || '');
                }}
              >
                Edit
              </button>
              <button
                className="text-button"
                onClick={() =>
                  perform(
                    () => api('delete/connector', { id: c.id }),
                    'Source disconnected. Jobs and application history were retained.',
                  )
                }
              >
                Disconnect
              </button>
            </div>
            {importSource === c.id && (
              <ImportJob
                key={c.id}
                connector={c}
                onDone={() => setImportSource(null)}
              />
            )}
            {data.sync
              .filter((r) => r.data.connectorId === c.id)
              .slice(-3)
              .map((r) => (
                <small key={r.id} className="desk-muted">
                  {r.data.status}: {r.data.processed} processed {r.data.error}
                </small>
              ))}
          </Panel>
        ))}
      </div>
      {!data.connector.length && (
        <Empty>
          Add an employer board or repository below. No automatic sources are
          enabled yet.
        </Empty>
      )}
      <Panel title={edit ? 'Edit source' : 'Add a source'}>
        <div className="desk-form-grid">
          <Field label="Source type">
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {connectorSchema.shape.type.options.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Employer or source name">
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
                <input value={path} onChange={(e) => setPath(e.target.value)} />
              </Field>
            </>
          ) : (
            ['greenhouse', 'lever'].includes(type) && (
              <Field label="Employer board identifier">
                <input
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                />
              </Field>
            )
          )}
          <Field label="Subscription expiry, optional">
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
          </Field>
        </div>
        {['github', 'greenhouse', 'lever'].includes(type) && (
          <fieldset className="desk-checks">
            <legend>Collection scope</legend>
            <label>
              <input
                type="checkbox"
                checked={canada}
                onChange={(e) => setCanada(e.target.checked)}
              />
              Canadian workplaces only (exclude unknown country)
            </label>
            <label>
              <input
                type="checkbox"
                checked={students}
                onChange={(e) => setStudents(e.target.checked)}
              />
              Intern, co-op or student role titles only
            </label>
          </fieldset>
        )}
        {type === 'github' && (
          <Field
            label="Repository license / attribution notice"
            hint="Retained with imported listing snapshots."
          >
            <textarea
              rows={4}
              value={licenseNotice}
              onChange={(e) => setLicenseNotice(e.target.value)}
            />
          </Field>
        )}
        {type === 'github' && (
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={reuse}
              onChange={(e) => setReuse(e.target.checked)}
            />
            I reviewed the repository format and reuse terms. Collection imports
            its table, not full descriptions.
          </label>
        )}
        {!['github', 'greenhouse', 'lever'].includes(type) && (
          <p>
            Automatic access is not verified for this source. Use the import
            form below; no session cookies or login credentials are collected.
          </p>
        )}
        <button
          className="button button-primary"
          disabled={busy || !name}
          onClick={() =>
            perform(async () => {
              await save(
                'connector',
                connectorSchema.parse({
                  ...edit?.data,
                  name,
                  type,
                  state: ['github', 'greenhouse', 'lever'].includes(type)
                    ? 'connected'
                    : 'import-only',
                  config: {
                    ...edit?.data.config,
                    board,
                    repository,
                    path,
                    reuseConfirmed: reuse,
                    licenseNotice,
                    canadaOnly: canada,
                    studentOnly: students,
                  },
                  cursor: 0,
                  etag: null,
                  expiresAt: expiry || null,
                }),
                edit,
              );
              setEdit(undefined);
              setName('');
            })
          }
        >
          {edit ? 'Save source' : 'Add source'}
        </button>
      </Panel>
      <ImportJob />
    </>
  );
}
