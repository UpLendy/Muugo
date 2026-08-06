const axios = require('axios');
axios.post('http://localhost:3010/api/v1/auth/login', { email: 'test@dismanet.com', password: '12345678' })
  .then(res => {
    const token = res.data.token;
    return axios.get('http://localhost:3010/api/v1/products', { headers: { Authorization: `Bearer ${token}` } });
  })
  .then(res => console.log(res.data))
  .catch(err => console.error(err.response ? err.response.data : err.message));
