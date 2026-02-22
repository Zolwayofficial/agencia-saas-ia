const { Client } = require('ssh2');

const conn = new Client();

const commands = `
echo "=== VPS HOSTING AUDIT ==="
echo "- RAM Usage:"
free -h | awk 'NR==2{printf "Memory: %s / %s (%.2f%%)", $3, $2, $3*100/$2}'
echo ""
echo "- Disk Usage:"
df -h / | awk 'NR==2{print $5" used ("$3"/"$2")"}'
echo ""
echo "=== DOCKER SERVICES ==="
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "=== APP PROCESSES (PM2) ==="
pm2 status 2>/dev/null | grep -v '─' || echo "PM2 not found or empty"
echo ""
echo "=== SYSTEM APIS ==="
curl -s http://localhost:3000/api/v1/health || echo "API /health not running on port 3000"
echo ""
`;

conn.on('ready', () => {
    conn.exec(commands, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            process.stdout.write(data);
        }).stderr.on('data', (data) => {
            process.stderr.write(data);
        });
    });
}).connect({
    host: '161.97.127.222',
    port: 22,
    username: 'root',
    password: 'e4wY53MS4ePay9VZ'
});
