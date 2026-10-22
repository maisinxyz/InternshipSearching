import 'server-only';
import { connectorSchema } from '@/domain/workspace';
import type { Repository } from './repository';

// Reviewed public sources. Configuration remains editable; this is not an adapter registry.
// https://github.com/vanshb03/Summer2027-Internships/blob/dev/LICENSE.txt
const githubLicense = `The MIT License (MIT)
Copyright (c) 2025 Vansh Bataviya
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

export const sourcePresets = [
  {
    id: 'starter-tenstorrent',
    data: connectorSchema.parse({
      name: 'Tenstorrent',
      intervalMinutes: 5,
      type: 'greenhouse',
      state: 'connected',
      config: {
        board: 'tenstorrentuniversity',
        canadaOnly: true,
        studentOnly: true,
        technicalOnly: true,
      },
    }),
  },
  {
    id: 'starter-kepler',
    data: connectorSchema.parse({
      name: 'Kepler Communications',
      type: 'lever',
      state: 'connected',
      config: {
        board: 'kepler',
        canadaOnly: true,
        studentOnly: true,
        technicalOnly: true,
      },
    }),
  },
  {
    id: 'starter-github-summer2027',
    data: connectorSchema.parse({
      name: 'Summer 2027 internships — Canadian listings',
      intervalMinutes: 60,
      type: 'github',
      state: 'connected',
      config: {
        repository: 'vanshb03/Summer2027-Internships',
        path: 'README.md',
        reuseConfirmed: true,
        licenseNotice: githubLicense,
        canadaOnly: true,
        studentOnly: true,
        technicalOnly: true,
      },
    }),
  },
  ...[
    ['starter-astera', 'Astera Labs', 'greenhouse', 'asteraearlycareer2027', 5],
    ['starter-moment', 'Moment Energy', 'greenhouse', 'momentenergy', 5],
    ['starter-waabi', 'Waabi', 'lever', 'waabi', 15],
    ['starter-1password', '1Password', 'ashby', '1password', 15],
    ['starter-apera', 'Apera AI', 'greenhouse', 'aperaaiinc', 15],
    ['starter-later', 'Later', 'greenhouse', 'later', 15],
    ['starter-cohere', 'Cohere', 'ashby', 'cohere', 15],
    ['starter-super', 'Super.com', 'ashby', 'super.com', 15],
    ['starter-harvey', 'Harvey', 'ashby', 'harvey', 15],
    ['starter-geotab', 'Geotab', 'greenhouse', 'geotab', 15],
    ['starter-samsara', 'Samsara', 'greenhouse', 'samsara', 15],
  ].map(([id, name, type, board, intervalMinutes]) => ({
    id: String(id),
    data: connectorSchema.parse({
      name,
      type,
      state: 'connected',
      intervalMinutes,
      config: {
        board,
        studentOnly: true,
        technicalOnly: true,
        canadaOnly: false,
      },
    }),
  })),
];

export async function setupSourcePresets(repo: Repository) {
  const existing = await repo.list('connector');
  const created: string[] = [],
    retained: string[] = [];
  for (const preset of sourcePresets) {
    const found = existing.some(
      (row) =>
        row.id === preset.id ||
        (row.data.type === preset.data.type &&
          (preset.data.type === 'github'
            ? row.data.config.repository === preset.data.config.repository &&
              (row.data.config.path || 'README.md') ===
                (preset.data.config.path || 'README.md')
            : ['greenhouse', 'lever', 'ashby'].includes(preset.data.type)
              ? row.data.config.board === preset.data.config.board
              : true)),
    );
    if (found) {
      retained.push(preset.data.name);
      continue;
    }
    const row = await repo.put('connector', preset.id, preset.data);
    existing.push(row);
    created.push(preset.data.name);
  }
  return { created, retained };
}
