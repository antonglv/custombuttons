setlocal

if %2==.sjs (
	set text=js
) else if %2==.sxul (
	set text=xul
) else if %2==.sxml (
	set text=xml
) else if %2==.sxbl (
	set text=xbl
) else if %2==.scss (
	set text=css
) else (
	set text=jpp
)

cpp -I %XPISTDLIB% -I %XPISTDINC% -I %3 -P -CC %1%2 | grep -v {--exclude-this-line} > %1.%text%

endlocal
