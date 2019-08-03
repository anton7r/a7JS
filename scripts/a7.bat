@echo off
if %1 == help (goto help)
if %1 == init (goto init)
if %1 == version (goto version)
if %1 == ver (goto version)
if %1 == v (goto version)
if %1 == newproject (goto newproject)

echo a7 %1 is not a recognized command.
goto help
:newproject
echo generating neccessary files for a website using a7JS.
xcopy "%ProgramFiles%\a7js\js" %cd%\a7\ /E/C/Y/Q
xcopy "%ProgramFiles%\a7js\newproject" %cd%\ /E/C/Y/Q
echo successfully added a7JS to your project.
goto void

:help
echo --------------------- [a7JS Help] ---------------------
echo init - initialises a7JS into current directory.
echo newproject - start a new project with a7JS.
echo -------------------------------------------------------
goto void

:init
echo adding a7JS to your current project.
xcopy "%ProgramFiles%\a7js\js" %cd%\a7\ /E/C/Y/Q
echo successfully added a7JS to your project.
goto void

:version
echo --------------------- [a7JS] ---------------------
echo            current version:      v3.1.3
echo --------------------------------------------------
goto void

:void