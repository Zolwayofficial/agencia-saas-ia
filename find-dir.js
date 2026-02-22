const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const commands = `
echo "=== DOCKER COMPOSE LOCATIONS ==="
find /root /var /home /opt -maxdepth 4 -type f -name "docker-compose.yml" 
echo "=== DEPLOYMENT CHECK ==="
pwd
`;

conn.on('ready', () => {
    let output = '';
    conn.exec(commands, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            fs.writeFileSync('locations.txt', output, 'utf8');
            conn.end();
        }).on('data', (data) => {
            output += data.toString();
        }).stderr.on('data', (data) => {
            output += data.toString();
        });
    });
}).connect({
    host: '161.97.127.222',
    port: 22,
    username: 'root',
    password: 'e4wY53MS4ePay9VZ'
});
