require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
    try {
        console.log('Testing connection...');
        console.log('DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
        await prisma.$connect();
        console.log('Connected successfully!');
        await prisma.$disconnect();
    } catch (error) {
        console.error('Connection failed:', error.message);
    }
}

test();
