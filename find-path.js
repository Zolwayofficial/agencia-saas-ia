const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const commands = `
echo "=== FINDING DEPLOYMENT PATH ==="
docker inspect production-saas-api-1 production-caddy-1 | grep '"Source"' | head -n 5
`;

conn.on('ready', () => {
    let output = '';
    conn.exec(commands, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            fs.writeFileSync('project-path.txt', output, 'utf8');
            conn.end();
        }).on('data', (data) => {
            output += data.toString();
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            output += data.toString();
            process.stderr.write(data);
        });
    });
}).connect({
    host: '161.97.127.222',
    port: 22,
    username: 'root',
    password: 'e4wY53MS4ePay9VZ'
});
