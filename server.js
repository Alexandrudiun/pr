const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Funcție pentru a selecta primul IP public
function getPublicIP(ipString) {
  // Desparte IP-urile
  const ips = ipString.split(',').map(ip => ip.trim());
  
  // Liste de prefixe pentru IP-uri private/locale
  const privateIPPrefixes = [
    '10.',     // Rețele private clasa A
    '172.16.', // Rețele private clasa B
    '192.168.',// Rețele private clasa C
    '127.0.0', // Localhost
    '::1',     // Localhost IPv6
  ];

  // Caută primul IP care nu este privat
  for (let ip of ips) {
    if (!privateIPPrefixes.some(prefix => ip.startsWith(prefix))) {
      return ip;
    }
  }

  // Dacă nu găsim niciun IP public, returnăm primul IP
  return ips[0];
}

app.use(express.static('public'));

app.get('/get-ip', async (req, res) => {
  try {
    // Metode multiple de preluare a IP-ului
    const clientIp = 
      req.headers['x-forwarded-for'] || 
      req.headers['x-real-ip'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress || 
      req.connection.socket.remoteAddress || 
      req.ip;

    // Selectează IP-ul public
    const cleanIp = getPublicIP(clientIp);

    // Caută informații de localizare
    const geoResponse = await axios.get(`https://ipapi.co/${cleanIp}/json/`);
    const geoData = geoResponse.data;

    // Înregistrează informațiile complete în consolă
    console.log('Detalii IP și Locație:');
    console.log('-------------------');
    console.log(`IP Original: ${clientIp}`);
    console.log(`IP Selectat: ${cleanIp}`);
    console.log(`Oraș: ${geoData.city || 'Necunoscut'}`);
    console.log(`Regiune: ${geoData.region || 'Necunoscut'}`);
    console.log(`Țară: ${geoData.country_name || 'Necunoscut'}`);
    console.log(`Cod Țară: ${geoData.country_code || 'Necunoscut'}`);
    console.log(`Continent: ${geoData.continent_code || 'Necunoscut'}`);
    console.log(`Latitudine: ${geoData.latitude || 'Necunoscut'}`);
    console.log(`Longitudine: ${geoData.longitude || 'Necunoscut'}`);
    console.log(`Organizație: ${geoData.org || 'Necunoscută'}`);
    console.log(`Fus Orar: ${geoData.timezone || 'Necunoscut'}`);
    console.log('-------------------\n');

    // Trimite datele înapoi către client
    res.json({
      ip: cleanIp,
      city: geoData.city || 'Necunoscut',
      region: geoData.region || 'Necunoscut',
      country: geoData.country_name || 'Necunoscut',
      latitude: geoData.latitude,
      longitude: geoData.longitude
    });

  } catch (error) {
    console.error('Eroare la preluarea informațiilor:', error);
    res.status(500).json({ error: 'Nu s-au putut prelua informațiile' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});
