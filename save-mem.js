const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

const commands = `
echo "=== TOP PROCESSES ==="
ps aux --sort=-%mem | awk 'NR<=15{printf "%-10s %-8s %-10s %s\\n", $1, $4"%", $6/1024" MB", substr($11, 1, 30)}'
echo "=== DOCKER CONTAINERS MEMORY USAGE ==="
docker stats --no-stream --format "table {{.Name}}\\t{{.MemUsage}}\\t{{.MemPerc}}" | sort -k3 -h -r
`;

conn.on('ready', () => {
    let output = '';
    conn.exec(commands, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            fs.writeFileSync('mem-report.txt', output, 'utf8');
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
