@echo off
@cd "C:\Users\vermaa\Desktop\Coding Stuff\Ashish - pls dont touch\DiepShowdown" 
@set PATH="C:\Users\vermaa\Desktop\Coding Stuff\Ashish - pls dont touch\NodeEnv";%PATH%
@echo Started Node.js environment.
@color 00
:redo
@cmd /k "node index.js"
goto redo