#!/usr/bin/env bash
# Install 10 Claude Code skill packs globally (user scope) on macOS.
# Vetted 2026-11-25 against each repo's own README / marketplace.json.
# Run in Terminal:  bash install-claude-skills-macos.sh
set -uo pipefail

need() { command -v "$1" >/dev/null 2>&1 || { echo "MISSING: $1 — $2"; exit 1; }; }
need claude "install Claude Code first: https://code.claude.com"
need node   "brew install node   (hooks for ponytail/i-have-adhd need it; npx for 2 skills)"
need git    "xcode-select --install"
command -v uv >/dev/null 2>&1 || { command -v brew >/dev/null && brew install uv || curl -LsSf https://astral.sh/uv/install.sh | sh; }

mp()  { claude plugin marketplace add "$1" || true; }   # idempotent: ignore "already added"
ins() { claude plugin install "$1" || echo "FAILED: $1"; }

# --- Native Claude plugins (namespaced => no name clashes between packs) ---
mp claude-plugins-official 2>/dev/null || true          # usually preinstalled
ins superpowers@claude-plugins-official                 # 2  obra/superpowers (official listing)
ins mattpocock-skills@claude-plugins-official || { mp mattpocock/skills; ins mattpocock-skills@mattpocock; }  # 2 fallback = repo's own marketplace
mp DietrichGebert/ponytail;        ins ponytail@ponytail                 # 1
mp ayghri/i-have-adhd;             ins i-have-adhd@i-have-adhd           # 3
mp cathrynlavery/diagram-design;   ins diagram-design@diagram-design     # 6
mp blader/humanizer;               ins humanizer@humanizer               # 7 (needs Claude Code >= 2.1.142)
mp addyosmani/agent-skills;        ins agent-skills@addy-agent-skills    # 9
mp pbakaus/impeccable;             ins impeccable@impeccable             # 10 (engine binary auto-downloads from GitHub releases, SHA-checked)

# --- Skill-only repo (no Claude plugin manifest) ---
npx -y skills add https://github.com/cloudflare/security-audit-skill -g -a claude-code -y   # 4 -> ~/.claude/skills/security-audit

# --- Python CLI + skill (PyPI name is "graphifyy", double y — matches repo pyproject) ---
uv tool install graphifyy && uv tool update-shell >/dev/null 2>&1   # 8
export PATH="$HOME/.local/bin:$PATH"
graphify install                                                     # writes ~/.claude/skills/graphify

# --- Verify ---
echo; echo "== Plugins =="; claude plugin list
echo; echo "== ~/.claude/skills =="; ls ~/.claude/skills
for s in security-audit graphify; do [ -f ~/.claude/skills/$s/SKILL.md ] && echo "OK  $s" || echo "MISSING $s"; done
echo; echo "Restart Claude Code, then type /plugin and /skills to confirm all 10 are enabled."
