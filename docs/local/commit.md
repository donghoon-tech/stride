# Commit Rules

This project strictly follows these commit guidelines to ensure history is clean and meaningful.

1. **Prefix Usage:**
   Always use conventional commit prefixes: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`.
   Format: `<type>: <summary>`
   Example: `feat: add user authentication`

2. **Body Usage:**
   Actively use the commit body to explain the *why* and *how* of the change. Do not just rely on the summary. Explain the context, the problem being solved, and any architectural decisions made in the commit.

3. **Language and Tone:**
   Write commit messages in concise, dry English. Be direct and objective. Do not use conversational language or emojis.

4. **Verify Real Changes:**
   Before proposing a commit, ALWAYS verify the *actual* changes compared to the last commit by checking the diff (`git diff HEAD`). Do not write the commit message based on what you *think* you changed; base it on what is actually present in the diff.

5. **Require User Approval:**
   NEVER execute a `git commit` command without explicit, direct user confirmation in the current turn. Always propose the plan first, ask for permission, and WAIT.
