@echo off
rem Modified for CALL-E Community Cases on 2026-10-22: installed engines only.
setlocal
rem Impeccable launcher (Windows). Runs bin\windows-<arch>\impeccable.exe next
rem to this file, else an already installed engine binary.
rem
rem Structure notes (this file is exercised by dry parsing and string-level
rem tests, not yet on a real Windows machine):
rem - No multi-line parenthesized blocks: cmd expands %var% at block parse
rem   time, which made the old download path read back empty %url%/%cached%.
rem   Linear goto flow keeps every expansion on its own line, and avoids
rem   delayed expansion eating ! characters in user arguments.
rem - The unversioned user binary and the PATH candidate are validated with
rem   the engine-probe handshake (see :probe) so the retired 3.x npm CLI,
rem   whose bin is also named impeccable, is never exec'd. IMPECCABLE_BIN,
rem   the sibling binary, and the version-pinned cache stay trusted.
if not defined IMPECCABLE_SKILL_DIR set "IMPECCABLE_SKILL_DIR=%~dp0.."
if not defined IMPECCABLE_SELF set "IMPECCABLE_SELF=%~f0"
set "arch=x64"
if /I "%PROCESSOR_ARCHITECTURE%"=="ARM64" set "arch=arm64"

if not defined IMPECCABLE_BIN goto no_env_bin
if not exist "%IMPECCABLE_BIN%" goto no_env_bin
set "run=%IMPECCABLE_BIN%"
goto run
:no_env_bin

set "bin=%~dp0bin\windows-%arch%\impeccable.exe"
if not exist "%bin%" goto no_sibling
set "run=%bin%"
goto run
:no_sibling

set "home_bin=%USERPROFILE%\.impeccable\bin\impeccable.exe"
if not exist "%home_bin%" goto no_home_bin
if defined IMPECCABLE_LAUNCHER_PROBE goto no_home_bin
call :probe "%home_bin%"
if not "%probe_ok%"=="1" goto no_home_bin
set "run=%home_bin%"
goto run
:no_home_bin

set "version="
if exist "%~dp0VERSION" set /p version=<"%~dp0VERSION"
if not defined IMPECCABLE_HOME set "IMPECCABLE_HOME=%USERPROFILE%\.impeccable"
set "cached=%IMPECCABLE_HOME%\bin\%version%\impeccable.exe"
if not defined version goto no_cache
if not exist "%cached%" goto no_cache
set "run=%cached%"
goto run
:no_cache

if defined IMPECCABLE_LAUNCHER_PROBE goto unavailable
where impeccable >nul 2>nul
if errorlevel 1 goto unavailable
call :probe impeccable
if not "%probe_ok%"=="1" goto unavailable
impeccable %*
exit /b %errorlevel%

:unavailable
if defined IMPECCABLE_LAUNCHER_PROBE exit /b 127
echo impeccable: no installed engine found; automatic download is disabled in this project. 1>&2
echo Read PRODUCT.md and DESIGN.md and continue with the manual skill workflow, or set IMPECCABLE_BIN to an installed engine. 1>&2
exit /b 127

:run
"%run%" %*
exit /b %errorlevel%

:probe
rem Sets probe_ok=1 when %1 answers the engine handshake: prints
rem "impeccable-engine <version>" and exits 0. The 3.x npm CLI answers any
rem unknown verb with "Unknown command", exit 1, so it never passes.
set "probe_ok="
set "probe_tmp=%TEMP%\impeccable-probe-%RANDOM%%RANDOM%.txt"
set "IMPECCABLE_LAUNCHER_PROBE=1"
"%~1" engine-probe >"%probe_tmp%" 2>nul
set "probe_err=%ERRORLEVEL%"
set "IMPECCABLE_LAUNCHER_PROBE="
if not "%probe_err%"=="0" goto probe_done
findstr /b /c:"impeccable-engine" "%probe_tmp%" >nul 2>nul
if not errorlevel 1 set "probe_ok=1"
:probe_done
del "%probe_tmp%" >nul 2>nul
exit /b 0
