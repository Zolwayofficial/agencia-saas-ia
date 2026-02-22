const { Client } = require('ssh2');

const conn = new Client();

const commands = `
echo "=== RAM ==="
free -h
echo "---"
grep MemTotal /proc/meminfo
echo "=== CPU ==="
lscpu | grep 'Model name\|CPU(s)'
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
