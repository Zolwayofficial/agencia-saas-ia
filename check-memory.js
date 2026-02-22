const { Client } = require('ssh2');

const conn = new Client();

const commands = `
echo "=== TOP PROCESSES BY MEMORY ==="
ps aux --sort=-%mem | awk 'NR<=15{printf "%-8s %-8s %-8s %-10s %s\\n", $1, $2, $4"%", $6/1024"MB", $11}'
echo ""
echo "=== DOCKER CONTAINERS MEMORY USAGE ==="
docker stats --no-stream --format "table {{.Name}}\\t{{.MemUsage}}\\t{{.MemPerc}}" | sort -k3 -h -r
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
