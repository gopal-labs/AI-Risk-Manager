"""
conftest.py — pytest configuration
Adds the backend/ directory to sys.path so `models.*` imports resolve
when tests are run from any working directory.
"""
import sys
import warnings
from pathlib import Path

# Always ensure backend/ is on the path
sys.path.insert(0, str(Path(__file__).parent))

# Filter pandas deprecation warnings emitted by xgboost / sklearn internals
warnings.filterwarnings("ignore", category=FutureWarning, module="pandas.*")
warnings.filterwarnings("ignore", message=".*is_sparse is deprecated.*")
warnings.filterwarnings("ignore", message=".*is_categorical_dtype is deprecated.*")
