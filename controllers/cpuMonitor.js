const os = require('os');

const cpuMonitor = () => {
    const checkInterval = 5000; // Check every 5 seconds
    const threshold = 70; // 70%

    setInterval(() => {
        const cpus = os.cpus();
        const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
        const totalTick = cpus.reduce((acc, cpu) => acc + cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq, 0);

        const idlePercentage = (totalIdle / totalTick) * 100;
        const usagePercentage = 100 - idlePercentage;

        console.log(`Current CPU Usage: ${usagePercentage.toFixed(2)}%`);

        if (usagePercentage > threshold) {
            console.warn(`CPU usage exceeded ${threshold}% threshold. Restarting server...`);
            process.exit(1);
        }
    }, checkInterval);
};

module.exports = cpuMonitor;