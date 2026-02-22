const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const commands = `
echo "=== DEPLOYING IN OPT DIRECTORY ==="
cd /opt/fulllogin || exit 1
echo "[+] Folders matched:"
pwd
echo "[+] Pulling Git..."
git pull origin main
echo "[+] Starting Docker Compose..."
docker compose -f infrastructure/production/docker-compose.yml up -d --build --remove-orphans
echo "[+] Final Container List:"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -i twenty
echo "=== DONE ==="
`;

conn.on('ready', () => {
    let output = '';
    conn.exec(commands, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            fs.writeFileSync('deploy-log.txt', output, 'utf8');
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
