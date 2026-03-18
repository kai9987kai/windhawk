from __future__ import annotations

import argparse
from pathlib import Path
import runpy
import sys


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render a Python-authored Windhawk mod into .wh.cpp source."
    )
    parser.add_argument("source", help="Path to the .wh.py file")
    parser.add_argument(
        "--module-root",
        required=True,
        help="Directory that contains the windhawk_py package",
    )
    return parser.parse_args()


def resolve_mod(namespace: dict) -> object:
    if "mod" in namespace:
        return namespace["mod"]

    build_mod = namespace.get("build_mod")
    if callable(build_mod):
        return build_mod()

    raise SystemExit(
        "Python mod files must define `mod = Mod(...)` or a callable `build_mod()`."
    )


def main() -> int:
    args = parse_args()
    source_path = Path(args.source).resolve()
    module_root = Path(args.module_root).resolve()

    sys.path.insert(0, str(source_path.parent))
    sys.path.insert(0, str(module_root))

    namespace = runpy.run_path(str(source_path), run_name="__main__")
    mod = resolve_mod(namespace)

    if not hasattr(mod, "render"):
        raise SystemExit("Resolved Python mod object does not provide render().")

    rendered = mod.render()
    sys.stdout.write(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
