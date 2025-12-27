const bcrypt = require('bcryptjs');

async function generateHash(password) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
}

// Generate hashes for our passwords
async function generateAllHashes() {
    await generateHash('CTPC@admin2025');
    await generateHash('CSED@hod2025');
    await generateHash('MED@hod2025');
    await generateHash('TM1@ctpc2025');
}

generateAllHashes();