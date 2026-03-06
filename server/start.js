const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- STARTING BACKEND (Node.js Wrapper) ---');
console.log(`PORT: ${process.env.PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

let appProcess;

// Forward signals to child process
function forwardSignal(signal) {
    if (appProcess) {
        console.log(`Forwarding signal ${signal} to app process`);
        appProcess.kill(signal);
    } else {
        console.log(`Received signal ${signal} but app process is not running. Exiting.`);
        process.exit(0);
    }
}

process.on('SIGTERM', () => forwardSignal('SIGTERM'));
process.on('SIGINT', () => forwardSignal('SIGINT'));

function runCommand(command, args, timeoutMs) {
    return new Promise((resolve) => {
        console.log(`Running: ${command} ${args.join(' ')}`);
        // Use shell: true to support npx command resolution
        const child = spawn(command, args, { stdio: 'inherit', shell: true });
        
        let timeout;
        if (timeoutMs) {
            timeout = setTimeout(() => {
                console.log(`Command timed out after ${timeoutMs}ms`);
                // On Windows, child.kill() might not kill the whole tree, but in Docker (Linux) it usually works for direct children.
                // However, shell: true creates a shell process.
                child.kill(); 
                resolve(false);
            }, timeoutMs);
        }

        child.on('close', (code) => {
            if (timeout) clearTimeout(timeout);
            if (code === 0) {
                console.log('Command succeeded');
                resolve(true);
            } else {
                console.log(`Command failed with code ${code}`);
                resolve(false);
            }
        });
        
        child.on('error', (err) => {
            if (timeout) clearTimeout(timeout);
            console.error('Command error:', err);
            resolve(false);
        });
    });
}

function startFallback() {
    console.log('--- STARTING FALLBACK SERVER ---');
    try {
        require('./fallback.js');
    } catch (err) {
        console.error('Failed to start fallback server:', err);
        // Keep container alive even if fallback fails, so logs can be inspected
        setInterval(() => {}, 3600000);
    }
}

async function main() {
    // 1. Run migrations
    console.log('--- RUNNING MIGRATIONS ---');
    // We use a simple timeout approach
    // We assume 'npx' is available in the PATH (it comes with node)
    const migrationSuccess = await runCommand('npx', ['prisma', 'migrate', 'deploy'], 15000);
    
    if (!migrationSuccess) {
        console.log('Migration failed or timed out. Continuing to start app anyway...');
    }

    // 2. Check for dist/index.js
    if (!fs.existsSync('dist/index.js')) {
        console.error('Error: dist/index.js not found! Build might have failed.');
        console.log('Current directory contents:', fs.readdirSync('.'));
        if (fs.existsSync('dist')) {
            console.log('dist directory contents:', fs.readdirSync('dist'));
        }
        startFallback();
        return;
    }

    // 3. Start App
    console.log('--- STARTING APP ---');
    // Spawn node process directly to avoid shell overhead
    appProcess = spawn('node', ['dist/index.js'], { stdio: 'inherit' });
    
    appProcess.on('close', (code) => {
        console.log(`App exited with code ${code}. Starting fallback server...`);
        appProcess = null;
        startFallback();
    });
    
    appProcess.on('error', (err) => {
        console.error('App failed to start:', err);
        appProcess = null;
        startFallback();
    });
}

main().catch(err => {
    console.error('Unhandled error in start script:', err);
    startFallback();
});
