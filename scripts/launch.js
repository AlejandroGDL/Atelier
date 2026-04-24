#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');

// First check dependencies
const checkDeps = spawn('node', ['scripts/check-deps.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env
});

checkDeps.on('close', (code) => {
  if (code !== 0) {
    process.exit(code);
  }

  // Determine platform
  const platform = process.platform;
  let appPath;

  if (platform === 'darwin') {
    appPath = path.join(projectRoot, 'src-tauri', 'target', 'release', 'bundle', 'macos', 'Atelier.app');
  } else if (platform === 'win32') {
    appPath = path.join(projectRoot, 'src-tauri', 'target', 'release', 'bundle', 'msi', 'Atelier.exe');
  } else {
    appPath = path.join(projectRoot, 'src-tauri', 'target', 'release', 'bundle', 'appimage', 'Atelier.AppImage');
  }

  if (!fs.existsSync(appPath)) {
    console.log('\n⚠️  La aplicación aún no está compilada.');
    console.log('   Ejecutando compilación por primera vez...\n');
    
    const build = spawn('npm', ['run', 'tauri:build'], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: { ...process.env, PATH: `${process.env.HOME}/.cargo/bin:${process.env.PATH}` }
    });

    build.on('close', (buildCode) => {
      if (buildCode !== 0) {
        console.error('\n❌ Error al compilar la aplicación');
        process.exit(buildCode);
      }
      launchApp(appPath, platform);
    });
  } else {
    launchApp(appPath, platform);
  }
});

function launchApp(appPath, platform) {
  console.log('\n🚀 Iniciando Atelier...\n');
  
  let child;
  if (platform === 'darwin') {
    child = spawn('open', [appPath], { stdio: 'ignore', detached: true });
  } else if (platform === 'win32') {
    child = spawn('start', ['""', appPath], { stdio: 'ignore', detached: true, shell: true });
  } else {
    child = spawn(appPath, { stdio: 'ignore', detached: true });
  }

  child.on('error', (err) => {
    console.error('❌ Error al iniciar:', err.message);
    process.exit(1);
  });

  console.log('✅ Atelier se ha iniciado');
  console.log('   Para cerrar, usa Cmd+Q (macOS) o cierra la ventana\n');
  
  // Detach process
  child.unref();
  setTimeout(() => process.exit(0), 1000);
}
