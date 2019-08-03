@echo off

echo installing a7JS..
xcopy /y %cd%\cli\a7.bat  %windir%\System32\a7.bat /C/Q
xcopy %cd%\src "%ProgramFiles%\a7js\" /E/C/Y/Q
echo a7JS installation complete.