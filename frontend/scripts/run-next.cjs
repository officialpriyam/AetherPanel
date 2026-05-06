const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const mode = process.argv[2];
const extraArgs = process.argv.slice(3);

if (!mode || !['dev', 'build'].includes(mode)) {
    console.error('Usage: node scripts/run-next.cjs <dev|build>');
    process.exit(1);
}

const cwd = path.join(__dirname, '..');
const nextDir = path.join(cwd, '.next');
const shouldClean = mode === 'build' || process.env.AETHERPANEL_NEXT_CLEAN === '1';
const hasBundlerOverride = extraArgs.includes('--webpack') || extraArgs.includes('--turbopack');
const runtimeArgs = mode === 'dev' && !hasBundlerOverride ? ['--turbopack', ...extraArgs] : extraArgs;

if (shouldClean && fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
}

const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), mode, ...runtimeArgs], {
    cwd,
    stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 1));
