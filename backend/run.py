"""
run.py — One-command backend launcher
======================================
Usage:
    cd "Risk Management/backend"
    python run.py

What this does:
  1. Ensures the synthetic dataset exists (generates if not)
  2. Starts uvicorn on port 8000 with hot-reload enabled
"""

import os
import sys
from pathlib import Path

# Add backend/ to sys.path so all imports resolve
sys.path.insert(0, str(Path(__file__).parent))

# ── Pre-flight: generate data if missing ──────────────────────────────────
data_dir = Path(__file__).parent / "data"
data_dir.mkdir(exist_ok=True)

if not (data_dir / "transactions.csv").exists():
    print("[run.py] Generating synthetic dataset…")
    from data_generator import generate_and_save
    generate_and_save()

# ── Launch ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))          # Render sets $PORT dynamically
    is_prod = os.getenv("RENDER") is not None      # Render sets RENDER=true
    print("\n" + "=" * 60)
    print(f"  AI Risk Manager — Scoring API  (port {port})")
    print(f"  Docs: http://0.0.0.0:{port}/docs")
    print("=" * 60 + "\n")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=not is_prod,                        # hot-reload off in production
        reload_dirs=[str(Path(__file__).parent)] if not is_prod else None,
        log_level="info",
    )
