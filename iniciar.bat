@echo off
rem Radio Dra. Lis - instala o que faltar e abre o app no navegador.
title Radio Dra. Lis
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado. Instale a versao LTS em https://nodejs.org e rode este arquivo de novo.
  pause
  exit /b 1
)

if not exist "node_modules\.bin\vite.cmd" (
  echo Instalando dependencias, aguarde...
  call npm install
  if errorlevel 1 (
    echo.
    echo Falha ao instalar as dependencias. Confira a conexao com a internet e tente de novo.
    pause
    exit /b 1
  )
)

echo.
echo Abrindo o Radio Dra. Lis em http://localhost:5173
echo Para encerrar, feche esta janela ou aperte Ctrl+C.
echo.
call npm run dev -- --open
pause
