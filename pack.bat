setlocal

set PATH=%PATH%;%ProgramFiles%\7-zip
set PATH=%PATH%;Q:\tmp\Mozilla\gecko-sdk-i586-pc-msvc-1.8a6\gecko-sdk\BIN

set PRJPATH=%CD%

set XPISTDLIB=%PRJPATH%\stdlib
set XPISTDINC=%XPISTDLIB%\inc

set FIREFOXPROFILEPATH="H:\Documents and Settings\MozillaFF"
set IDLPATH=Q:\tmp\Mozilla\gecko-sdk-i586-pc-msvc-1.8a6\gecko-sdk\IDL
set EXTCHROMEDIR=.\chrome\custombuttons
set JARNAME=custombuttons
set XPINAME=custom_buttons-0.0.2

rem preprocessing
for /r . %%i in (*.s??) do call jpp %%~dpni %%~xi %PRJPATH%\inc

rem create *.jar
del /Q %EXTCHROMEDIR%.jar > nul
7z a -tzip -mx=0 -r %EXTCHROMEDIR%.jar %EXTCHROMEDIR%\ -x@noinclude.txt > nul

rem create typelibs (*.xpt)
if not exist .\components goto createxpi
for /r .\components %%i in (*.xpt) do del /Q %%i
for /r .\components %%i in (*.idl) do xpidl -m typelib -I %IDLPATH% -e %%~dpni.xpt %%i

:createxpi
rem create *.xpi
del /Q .\%XPINAME%.xpi > nul
rem next line for *.xpi with *.jar:
rem 7z a -tzip -mx=9 -r .\%XPINAME%.xpi .\ -x@noinclude.txt -x!%JARNAME%\ > nul
rem next line for *.xpi without *.jar:
7z a -tzip -mx=9 -r .\%XPINAME%.xpi .\ -x@noinclude.txt > nul

rem "install"
rem copy /y %XPINAME%.xpi %FIREFOXPROFILEPATH%\extensions

endlocal
