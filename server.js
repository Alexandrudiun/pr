const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware pentru servirea fișierelor statice
app.use(express.static('public'));

app.get('/get-ip', async (req, res) => {
  try {
    // Preia adresa IP a clientului
    const clientIp = req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     req.connection.socket.remoteAddress;

    // Curăță IP-ul de prefixe IPv6 
    const cleanIp = clientIp.replace(/^::ffff:/, '');

    // Caută informații de localizare
    const geoResponse = await axios.get(`https://ipapi.co/${cleanIp}/json/`);
    const geoData = geoResponse.data;

    // Înregistrează informațiile complete în consolă
    console.log('Detalii IP și Locație:');
    console.log('-------------------');
    console.log(`IP: ${cleanIp}`);
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

// Rută principală care servește pagina HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});
