import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { QuickYAML } from 'quick-yaml.db';

export function openDatabase(path: `${string}.yml` | `${string}.yaml`): QuickYAML {
    mkdirSync(dirname(path), { recursive: true });
    // Append mode creates a missing file without changing existing data.
    writeFileSync(path, '', { flag: 'a' });
    return new QuickYAML(path);
}
