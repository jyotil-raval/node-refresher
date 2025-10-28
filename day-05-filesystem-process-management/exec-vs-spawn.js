const { exec, spawn } = require('child_process');

// exec: buffers entire output
exec('ls -lh', (err, stdout, stderr) => {
  if (err) return console.error('Exec error:', err);
  console.log('Exec output:\n', stdout);
});

// spawn: streams output as it arrives
const child = spawn('ls', ['-lh']);

child.stdout.on('data', (chunk) => console.log('Spawn chunk:', chunk.toString()));
child.on('close', (code) => console.log(`Spawn exited with code ${code}`));
