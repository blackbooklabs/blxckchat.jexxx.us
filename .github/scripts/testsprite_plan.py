#!/usr/bin/env python3
"""Resolve required TestSprite suites for a PR and assess evidence coverage."""

from __future__ import annotations

import argparse
import fnmatch
import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import yaml


@dataclass
class RepoPlan:
    repo: str
    billing_provider: str
    premium_mode: str
    changed_files: list[str]
    required_suites: list[str]
    matched_conditions: list[dict[str, Any]]
    missing_evidence: list[str]
    satisfied_evidence: list[str]


def load_yaml(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def matches_any(path: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatchcase(path, pattern) for pattern in patterns)


def collect_changed_files_for_repo(repo: str, changed_files: list[str]) -> list[str]:
    if repo in {".", "", "root", "blxckchat.jexxx.us"}:
        return changed_files

    prefix = f"{repo}/"
    return [changed for changed in changed_files if changed == repo or changed.startswith(prefix)]


def normalize_suite_list(values: list[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for value in values:
        cleaned = value.strip()
        if cleaned and cleaned not in seen:
            seen.add(cleaned)
            ordered.append(cleaned)
    return ordered


def parse_evidence_blocks(text_blocks: list[str], evidence_prefix: str) -> tuple[dict[str, set[str]], set[str]]:
    repo_evidence: dict[str, set[str]] = {}
    global_evidence: set[str] = set()

    for block in text_blocks:
        if not block:
            continue
        for line in block.splitlines():
            stripped = line.strip()
            if not stripped.lower().startswith(evidence_prefix.lower()):
                continue
            payload = stripped[len(evidence_prefix) :].strip()
            if not payload:
                continue

            segments = [segment.strip() for segment in payload.split(";") if segment.strip()]
            if not segments:
                segments = [payload]

            for segment in segments:
                if "=" in segment:
                    repo_name, suites_blob = segment.split("=", 1)
                elif ":" in segment:
                    repo_name, suites_blob = segment.split(":", 1)
                else:
                    repo_name, suites_blob = "*", segment

                suite_tokens = [token.strip() for token in suites_blob.replace("|", ",").split(",") if token.strip()]
                if repo_name.strip() in {"*", "all", "global"}:
                    global_evidence.update(suite_tokens)
                else:
                    repo_evidence.setdefault(repo_name.strip(), set()).update(suite_tokens)

    return repo_evidence, global_evidence


def has_override(text_blocks: list[str], override_prefix: str) -> bool:
    lowered = override_prefix.lower()
    for block in text_blocks:
        if not block:
            continue
        for line in block.splitlines():
            if line.strip().lower().startswith(lowered):
                return True
    return False


def build_repo_plan(
    repo: str,
    repo_config: dict[str, Any],
    repo_changed_files: list[str],
    repo_evidence: dict[str, set[str]],
    global_evidence: set[str],
) -> RepoPlan:
    minimum = repo_config.get("minimum_required_suites", {})
    required = list(minimum.get("always", []))
    matched_conditions: list[dict[str, Any]] = []

    for condition_name, condition in minimum.get("conditional", {}).items():
        patterns = condition.get("paths", [])
        if repo_changed_files and matches_any_for_files(repo_changed_files, patterns):
            suites = condition.get("suites", [])
            required.extend(suites)
            matched_conditions.append(
                {
                    "condition": condition_name,
                    "paths": patterns,
                    "suites": suites,
                }
            )

    normalized_required = normalize_suite_list(required)
    repo_specific_evidence = repo_evidence.get(repo, set())
    local_evidence = repo_evidence.get("blxckchat.jexxx.us", set())
    satisfied = [suite for suite in normalized_required if suite in repo_specific_evidence or suite in local_evidence or suite in global_evidence]
    missing = [suite for suite in normalized_required if suite not in satisfied]

    return RepoPlan(
        repo=repo,
        billing_provider=repo_config.get("billing_provider", "unknown"),
        premium_mode=repo_config.get("premium_mode", "unknown"),
        changed_files=repo_changed_files,
        required_suites=normalized_required,
        matched_conditions=matched_conditions,
        missing_evidence=missing,
        satisfied_evidence=satisfied,
    )


def matches_any_for_files(changed_files: list[str], patterns: list[str]) -> bool:
    for changed_file in changed_files:
        if matches_any(changed_file, patterns):
            return True
    return False


def render_markdown(
    marker: str,
    plans: list[RepoPlan],
    strict_evidence: bool,
    missing_total: int,
    override_enabled: bool,
) -> str:
    lines: list[str] = [marker, "## TestSprite suite plan"]

    if not plans:
        lines.extend(
            [
                "",
                "No BLXCKCHAT repo paths matched this PR, so no TestSprite suites are currently required.",
            ]
        )
        return "\n".join(lines)

    lines.extend(
        [
            "",
            f"- Strict evidence gate: `{str(strict_evidence).lower()}`",
            f"- Override detected: `{str(override_enabled).lower()}`",
            f"- Missing required suite evidence count: `{missing_total}`",
            "",
            "### Required suites by repo",
        ]
    )

    for plan in plans:
        lines.extend(
            [
                "",
                f"#### `{plan.repo}`",
                f"- Billing provider: `{plan.billing_provider}`",
                f"- Premium mode: `{plan.premium_mode}`",
                f"- Changed files in repo: `{len(plan.changed_files)}`",
            ]
        )

        if plan.required_suites:
            lines.append("- Required suites:")
            for suite in plan.required_suites:
                status = "✅" if suite in plan.satisfied_evidence else "⬜"
                lines.append(f"  - {status} `{suite}`")
        else:
            lines.append("- Required suites: none")

        if plan.matched_conditions:
            lines.append("- Triggered conditions:")
            for condition in plan.matched_conditions:
                suites_blob = ", ".join(condition["suites"])
                lines.append(f"  - `{condition['condition']}` → {suites_blob}")

        if plan.missing_evidence:
            lines.append(f"- Missing evidence: `{', '.join(plan.missing_evidence)}`")
        else:
            lines.append("- Missing evidence: none")

    lines.extend(
        [
            "",
            "### Evidence comment format",
            "",
            "Add a PR comment like:",
            "",
            "```text",
            "testsprite-evidence: blxckchat.jexxx.us=TS-SMOKE-ROUTE-INTEGRITY,TS-CRITICAL-USER-JOURNEY",
            "```",
            "",
            "To bypass strict enforcement intentionally, add a maintainer comment starting with:",
            "",
            "```text",
            "override-testsprite: <reason>",
            "```",
        ]
    )

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--matrix", required=True)
    parser.add_argument("--context", required=True)
    parser.add_argument("--plan-json", required=True)
    parser.add_argument("--plan-md", required=True)
    parser.add_argument("--strict-evidence", choices=["true", "false"], default=None)
    args = parser.parse_args()

    matrix = load_yaml(Path(args.matrix))
    context = load_json(Path(args.context))

    policy = matrix.get("policy", {})
    strict_label = policy.get("strict_evidence_label", "testsprite-strict")
    labels: list[str] = context.get("labels", [])
    strict_evidence = (
        (args.strict_evidence == "true")
        if args.strict_evidence is not None
        else bool(policy.get("strict_evidence_default", False)) or strict_label in labels
    )

    changed_files: list[str] = context.get("changed_files", [])
    text_blocks: list[str] = [context.get("pr_body", "")] + context.get("comments", [])

    repo_evidence, global_evidence = parse_evidence_blocks(text_blocks, policy.get("evidence_comment_prefix", "testsprite-evidence:"))
    override_enabled = has_override(text_blocks, policy.get("override_comment_prefix", "override-testsprite:"))

    repo_plans: list[RepoPlan] = []
    for repo_name, repo_config in matrix.get("repos", {}).items():
        repo_changed_files = collect_changed_files_for_repo(repo_name, changed_files)
        if not repo_changed_files:
            continue
        repo_plans.append(build_repo_plan(repo_name, repo_config, repo_changed_files, repo_evidence, global_evidence))

    total_required = sum(len(plan.required_suites) for plan in repo_plans)
    total_missing = sum(len(plan.missing_evidence) for plan in repo_plans)
    should_fail = strict_evidence and total_required > 0 and total_missing > 0 and not override_enabled
    gate_label = policy.get("gate_label", "needs-testsprite")
    gate_label_present = gate_label in labels

    rendered = render_markdown(
        policy.get("plan_comment_marker", "<!-- testsprite-plan -->"),
        repo_plans,
        strict_evidence,
        total_missing,
        override_enabled,
    )

    payload = {
        "strict_evidence": strict_evidence,
        "strict_evidence_label": strict_label,
        "override_enabled": override_enabled,
        "gate_label": gate_label,
        "gate_label_present": gate_label_present,
        "total_required": total_required,
        "total_missing_evidence": total_missing,
        "required_repos": [plan.repo for plan in repo_plans],
        "repos": [
            {
                "repo": plan.repo,
                "billing_provider": plan.billing_provider,
                "premium_mode": plan.premium_mode,
                "changed_files": plan.changed_files,
                "required_suites": plan.required_suites,
                "matched_conditions": plan.matched_conditions,
                "missing_evidence": plan.missing_evidence,
                "satisfied_evidence": plan.satisfied_evidence,
            }
            for plan in repo_plans
        ],
        "should_fail": should_fail,
    }

    Path(args.plan_json).write_text(json.dumps(payload, indent=2), encoding="utf-8")
    Path(args.plan_md).write_text(rendered, encoding="utf-8")

    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as handle:
            handle.write(f"total_required={total_required}\n")
            handle.write(f"total_missing_evidence={total_missing}\n")
            handle.write(f"should_fail={'true' if should_fail else 'false'}\n")
            handle.write(f"strict_evidence={'true' if strict_evidence else 'false'}\n")
            handle.write(f"gate_label_present={'true' if gate_label_present else 'false'}\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
