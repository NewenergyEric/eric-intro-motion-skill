# Rename in v0.4.0

The official name, repository, primary skill folder, display name and release prefix are now `eric-intro-motion-skill`.

| Before | Current |
| --- | --- |
| `NewenergyEric/motion-story-skills` | `NewenergyEric/eric-intro-motion-skill` |
| `$motion-story` | `$eric-intro-motion-skill` |
| `skills/motion-story/` runtime and assets | `skills/eric-intro-motion-skill/` |
| `motion-story-skills-v*.zip` | `eric-intro-motion-skill-v*.zip` |
| `motion-story-examples-v*.zip` | `eric-intro-motion-skill-examples-v*.zip` |

`social-motion` remains a companion utility. Its imports now target the canonical runtime. A small `motion-story` compatibility entry routes old prompts and forwards the three existing CLI entry points (`cli.mjs`, `compose.mjs`, `assemble-media.mjs`). Update old asset paths; the alias does not duplicate the font or npm runtime. Direct imports of other old internal files are not a supported API; update those paths too.

From a fresh clone, `node scripts/install.mjs` installs the canonical skill, companion and alias. It refuses existing folders. For an existing install:

```sh
node scripts/install.mjs --upgrade
npm ci --prefix /path/to/skills/eric-intro-motion-skill
```

The installer prints the exact runtime path and backs up all replaced folders under a unique dated `eric-intro-motion-skill-backup-*` directory beside the skills directory, outside normal skill discovery. It stages all files first and restores the original folders if installation fails. Backups include local changes and old dependencies. Refresh skill discovery or start a new session after installation.

For a different skill library, add `--dest /path/to/skills`. Review local modifications in the backup before removing it. Existing Git clones should set their origin to `https://github.com/NewenergyEric/eric-intro-motion-skill.git`. Historical tags and release assets keep their original names for reproducibility; new releases use the canonical prefix. GitHub redirects the old repository URL after the rename, while examples and install commands use the new URL directly.
