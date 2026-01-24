const axios = require('axios');

async function testGenerate() {
    const API_URL = 'http://localhost:3001/api';

    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'teste@1pra1.com',
            password: 'test123'
        });
        const token = loginRes.data.token;
        console.log('Login successful, token obtained.');

        // 2. Create Dummy Project
        console.log('Creating dummy project...');
        const projectRes = await axios.post(`${API_URL}/projects`, {
            name: 'Test Project ' + Date.now(),
            description: 'Test Description',
            controller: 'Test Controller',
            dpoName: 'Test DPO',
            dpoEmail: 'dpo@test.com',
            hasSensitiveData: true, // Should trigger risks
            hasBiometricData: false
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const projectId = projectRes.data.id;
        console.log('Project created:', projectId);

        // 3. Test Generate Risks
        console.log('Testing Generate Risks...');
        const riskRes = await axios.post(`${API_URL}/risks/generate`, {
            projectId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Generate Risks Result:', riskRes.status, riskRes.data.length, 'risks generated');

        // 4. Test Generate Actions
        console.log('Testing Generate Actions...');
        const actionRes = await axios.post(`${API_URL}/actions/generate`, {
            projectId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Generate Actions Result:', actionRes.status, actionRes.data.length, 'actions generated');

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testGenerate();
