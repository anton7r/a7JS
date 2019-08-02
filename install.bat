@echo off
title a7JS Installer
echo --------------------------
echo  Starting to install a7JS
echo --------------------------

robocopy .\src "%programfiles%"\a7js /MIR

echo a7JS was copied.