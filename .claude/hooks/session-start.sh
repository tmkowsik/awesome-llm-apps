#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "Installing test dependencies for awesome-llm-apps..."

# Install pytest and core test dependencies
pip install --quiet \
  pytest \
  numpy \
  faiss-cpu

echo "Dependencies installed successfully."
