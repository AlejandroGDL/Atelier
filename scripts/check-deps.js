#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const nodeModulesPath = path.join(projectRoot, 'node_modules');
const packageJsonPath = path.join(projectRoot, 'package.json');

console.log('\n🔍 Atelier — Validando entorno...\n');

// Check if node_modules exists
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  No se encontró node_modules');
  console.log('📦 Instalando dependencias...\n');
  try {
    execSync('npm install', { 
      cwd: projectRoot, 
      stdio: 'inherit',
      env: { ...process.env, npm_config_loglevel: 'error' }
    });
    console.log('\n✅ Dependencias instaladas correctamente\n');
  } catch (error) {
    console.error('\n❌ Error al instalar dependencias:', error.message);
    process.exit(1);
  }
} else {
  // Check if package.json has changed since last install
  const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
  const packageHash = require('crypto').createHash('md5').update(packageJson).digest('hex');
  const hashFile = path.join(nodeModulesPath, '.package-hash');
  
  let needsInstall = false;
  
  if (!fs.existsSync(hashFile)) {
    needsInstall = true;
  } else {
    const lastHash = fs.readFileSync(hashFile, 'utf8');
    if (lastHash !== packageHash) {
      needsInstall = true;
    }
  }
  
  if (needsInstall) {
    console.log('📦 package.json ha cambiado. Actualizando dependencias...\n');
    try {
      execSync('npm install', { 
        cwd: projectRoot, 
        stdio: 'inherit',
        env: { ...process.env, npm_config_loglevel: 'error' }
      });
      fs.writeFileSync(hashFile, packageHash);
      console.log('\n✅ Dependencias actualizadas correctamente\n');
    } catch (error) {
      console.error('\n❌ Error al actualizar dependencias:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Dependencias ya están instaladas\n');
  }
}

// Check Rust/Tauri
console.log('🔍 Verificando Rust...');
try {
  execSync('rustc --version', { stdio: 'pipe' });
  console.log('✅ Rust está instalado\n');
} catch {
  console.log('⚠️  Rust no está instalado. Tauri requiere Rust para compilar.');
  console.log('   Visita: https://tauri.app/start/prerequisites/\n');
  process.exit(1);
}

console.log('🚀 Todo listo. Iniciando Atelier...\n');
