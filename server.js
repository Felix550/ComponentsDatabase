const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});


{// Endpoint per le CPU
    app.get('/api/cpu/search', (req, res) => {
        const queryName = req.query.name ? req.query.name.toLowerCase() : '';
        const queryWords = queryName.split(/\s+/).filter(Boolean);

        const filePath = path.join(__dirname, 'database', 'json', 'cpu.json');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Errore nella lettura del file.' });
            }
            let cpus;
            try {
                cpus = JSON.parse(data);
            } catch (e) {
                return res.status(500).json({ error: 'Errore nel parsing del file JSON.' });
            }
            const results = cpus.filter(cpu =>
                queryWords.every(word =>
                    Object.keys(cpu).some(key =>
                        key !== 'image' &&
                        cpu[key] &&
                        cpu[key].toString().toLowerCase().includes(word)
                    )
                )
            );
            if (results.length === 0) {
                return res.json({ message: 'Nessun risultato trovato.' });
            }
            res.json(results);
        });
    });

    // Mappa chiavi tecniche in etichette italiane
    const cpuFieldLabels = {
        image: "Immagine",
        name: "Nome",
        price: "Prezzo (€)",
        core_count: "Cores",
        core_clock: "Frequenza Base",
        boost_clock: "Frequenza Boost",
        microarchitecture: "Microarchitettura",
        tdp: "TDP",
        graphics: "Grafica Integrata",
    };

    app.get('/api/cpu/fields', (req, res) => {
        res.json(cpuFieldLabels);
    });
}

{// Endpoint per le GPU
    app.get('/api/gpu/search', (req, res) => {
        const queryName = req.query.name ? req.query.name.toLowerCase() : '';
        const queryWords = queryName.split(/\s+/).filter(Boolean);

        const filePath = path.join(__dirname, 'database', 'json', 'video-card.json');
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: 'Errore nella lettura del file.' });
            }
            let gpus;
            try {
                gpus = JSON.parse(data);
            } catch (e) {
                return res.status(500).json({ error: 'Errore nel parsing del file JSON.' });
            }
            const results = gpus.filter(gpu =>
                queryWords.every(word =>
                    Object.keys(gpu).some(key =>
                        key !== 'image' &&
                        gpu[key] &&
                        gpu[key].toString().toLowerCase().includes(word)
                    )
                )
            );
            if (results.length === 0) {
                return res.json({ message: 'Nessun risultato trovato.' });
            }
            res.json(results);
        });
    });

    // Mappa chiavi tecniche in etichette italiane
    const gpuFieldLabels = {
        image: "Immagine",
        name: "Nome",
        price: "Prezzo (€)",
        chipset: "Chipset",
        core_count: "Cores",
        memory: "Memoria (Gb)",
        core_clock: "Frequenza Base (GHz)",
        boost_clock: "Frequenza Boost (GHz)",
        color: "Colore ",
        length: "Lunghezza (mm)",
    };

    app.get('/api/gpu/fields', (req, res) => {
        res.json(gpuFieldLabels);
    });
}

const PORT = process.env.PORT || 80;

const server = app.listen(PORT, () => {
    console.log("server is running on port", server.address().port);
});