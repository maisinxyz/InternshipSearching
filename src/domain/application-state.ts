import type { RecordRow } from './workspace';

// Submission belongs to application history. Legacy bookmark state is not authoritative.
export function appliedDateFor(
  jobId: string,
  applications: Pick<RecordRow<'application'>, 'data'>[],
): string | null {
  const dates = applications
    .filter((application) => application.data.jobId === jobId)
    .map((application) => application.data.appliedAt)
    .filter((date): date is string => date !== null)
    .sort();
  // UserJobState expects an instant; this compatibility value is only an indicator.
  // The actual submission date remains date-only on Application.
  return dates.length ? `${dates[0]}T12:00:00Z` : null;
}
