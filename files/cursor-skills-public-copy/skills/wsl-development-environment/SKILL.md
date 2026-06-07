---
name: wsl-development-environment
description: Treat this computer as a WSL-based development environment with PowerShell 7 as the preferred Windows-side host shell. Use whenever the user mentions WSL, wsl.exe, Ubuntu, Linux subsystem, PowerShell running Linux commands, Windows/WSL path conversion, or asks to run commands in this Windows workspace. Also use when running local development commands, installing dependencies, starting dev servers, reading terminal instructions, converting paths, explaining environment setup, or when required tools are missing/outdated and need to be installed or upgraded. 本机是 WSL 优先开发环境；当用户提到 WSL、wsl 命令、Linux 子系统、本地开发命令、安装依赖、启动服务、构建、测试、lint、Git、路径转换时必须使用。 Prefer WSL/Linux conventions for development work, and prefer PowerShell 7 (`pwsh`) when a Windows-side wrapper is needed, unless the user explicitly asks for another shell.
user-invocable: true
---

# WSL Development Environment

This machine uses WSL as the preferred development environment.

## Environment Detection and Fallback

Do not blindly assume WSL is available on a newly migrated computer just because this skill exists.

On a new machine, or whenever the environment is uncertain, verify the runtime before running development commands:

```powershell
pwsh -NoProfile -Command "wsl.exe --status"
```

Decision rules:

- If WSL exists and the target distro works, use WSL as the preferred development environment.
- If WSL is missing but the task requires Linux tooling, explain that WSL is not available and install/enable WSL only when appropriate for the task.
- If WSL is missing and the task can run cleanly on Windows, use PowerShell 7 (`pwsh`) with Windows paths instead of forcing WSL paths.
- If PowerShell 7 is missing or too old, it is allowed to install or upgrade PowerShell 7 before continuing.
- Never convert paths to `/mnt/...` until WSL availability is confirmed.

## Default Assumption

For local development work, prefer WSL/Linux after WSL availability has been verified. If verification has not happened yet, treat WSL as a preference rather than a fact, even if Cursor reports Windows paths or PowerShell as the host shell.

Use WSL for:

- dependency installation
- package manager commands
- build/test/lint commands
- dev server startup
- shell scripts
- Unix tools
- Git workflows
- path examples in technical instructions

Use native Windows tooling only when:

- the user explicitly asks for Windows behavior
- interacting with Windows-only tools
- editing Cursor/user configuration stored under Windows paths
- a command is clearly unavailable or unsuitable in WSL

When a Windows-side shell is needed, prefer PowerShell 7 (`pwsh`) over Windows PowerShell 5.1 because it has better UTF-8 behavior and more predictable cross-platform command handling.

## Environment Installation and Upgrades

When a required development tool is missing, broken, or below the version required by the current task, it is allowed to install or upgrade that tool inside WSL without asking for separate permission first.

Allowed actions include:

- installing missing package managers, runtimes, CLIs, SDKs, build tools, and language toolchains
- upgrading versions that are too old for the project or command being run
- installing project dependencies through the project's declared package manager
- using common WSL/Linux package managers or official installers when appropriate

Default safety boundaries:

- Prefer project-local or user-level installation when practical.
- Prefer stable/current supported versions rather than arbitrary pinned versions.
- Avoid changing native Windows tooling unless the user explicitly requests it.
- Avoid destructive environment changes, global removals, or major distro-level changes unless the user confirms.
- If installation requires elevated privileges or could affect unrelated projects, state the reason before proceeding.

## Path Mapping

Convert Windows workspace paths to WSL paths only after WSL availability has been confirmed. If WSL is missing, keep Windows paths and use PowerShell 7 commands instead.

Examples:

```text
<WINDOWS_DRIVE>:\path\to\project
/mnt/<drive>/path/to/project
```

```text
<WINDOWS_DRIVE>:\Users\<user>\.cursor
/mnt/<drive>/Users/<user>/.cursor
```

## Running Commands From Cursor

When the available terminal is PowerShell but the task is development-related, invoke WSL explicitly. Prefer PowerShell 7 (`pwsh`) as the Windows-side host. If the current terminal is already `pwsh`, run the `wsl.exe ...` command directly. If the caller needs an explicit wrapper, use `pwsh -NoProfile -Command`.

Use one of two command styles depending on the current working directory.

### Relative-path command style

Use this when the shell is already in the project root or the caller has explicitly set the working directory.

Direct PowerShell 7 terminal:

```powershell
wsl.exe bash -lc 'npm run dev'
```

Explicit PowerShell 7 wrapper:

```powershell
pwsh -NoProfile -Command "wsl.exe bash -lc 'npm run dev'"
```

```powershell
wsl.exe bash -lc 'npm install && npm run build'
```

### Absolute-path command style

Use this when the current working directory is uncertain, when the command may run from a different folder, or when giving a reproducible command to the user.

Direct PowerShell 7 terminal:

```powershell
wsl.exe bash -lc 'cd /mnt/<drive>/path/to/project && npm run dev'
```

Explicit PowerShell 7 wrapper:

```powershell
pwsh -NoProfile -Command "wsl.exe bash -lc 'cd /mnt/<drive>/path/to/project && npm run dev'"
```

```powershell
wsl.exe bash -lc 'cd /mnt/<drive>/path/to/project && npm install && npm run build'
```

For automation, prefer absolute-path commands unless the tool call already provides a reliable working directory.

## Encoding Requirements

Keep file and terminal encoding compatible with Cursor to avoid mojibake, especially for Chinese text.

Default rules:

- Write text files as UTF-8.
- Prefer UTF-8 without BOM for source files, Markdown, JSON, YAML, JavaScript, CSS, HTML, shell scripts, and config files.
- Prefer PowerShell 7 (`pwsh`) on the Windows side because its UTF-8 behavior is more consistent than Windows PowerShell 5.1.
- Do not use legacy encodings such as GBK, ANSI, or system-default code pages for project files.
- When generating files from WSL commands, ensure the output is UTF-8.
- When running through PowerShell wrappers, prefer `pwsh -NoProfile -Command` and avoid commands that implicitly rewrite text using the Windows default encoding.
- Prefer Cursor file editing tools for text changes; avoid shell redirection for creating or rewriting files containing Chinese text.

If encoding is uncertain, verify using a read-only check before editing or rewriting the file.

## Communication Rules

When giving commands to the user:

- Prefer Linux shell syntax.
- Prefer `/mnt/<drive>/...` paths for project work.
- Mention PowerShell only when it is required as the host wrapper for `wsl.exe`.
- Do not suggest Windows-specific package installation flows unless explicitly requested.

## Verification

If environment behavior is uncertain, verify with lightweight read-only commands such as:

```powershell
wsl.exe bash -lc 'pwd && uname -a'
```

Then continue using the WSL result as the source of truth for development commands.