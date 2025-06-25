document.getElementById('searchForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const query = document.getElementById('searchInput').value.trim();
            const resultDiv = document.getElementById('result');
            const countText = document.getElementById('result-count');
            // Prendi la categoria selezionata
            const categorySelect = document.getElementById('categorySelect');
            const category = categorySelect.value;
            const categoryName = categorySelect.options[categorySelect.selectedIndex].text;
            let baseApiUrl = `/api/${category}`;
            resultDiv.textContent = "Sto cercando...";
            countText.textContent = ""; // Resetta il conteggio dei risultati

            // Funzione di filtro per input sicuro
            function sanitizeInput(input) {
                // Permetti solo lettere, numeri, spazi e pochi simboli comuni
                return input.replace(/[^a-zA-Z0-9àèéìòùç\s\-_']/gi, '');
            }

            try {
                if (typeof query !== 'string') throw new Error('Il termine di ricerca deve essere una stringa.');
                if (!query) throw new Error('Nessun termine di ricerca inserito.');
                if (query.length < 2) throw new Error('Il termine di ricerca deve essere lungo almeno 2 caratteri.');

                const safeQuery = sanitizeInput(query);
                if (safeQuery.length < 2) throw new Error('Il termine di ricerca contiene caratteri non validi.');

                // Sostituisci l'URL con quello della tua API
                const response = await fetch(`${baseApiUrl}/search?name=${encodeURIComponent(safeQuery)}`);
                if (!response.ok) throw new Error('Errore nella richiesta');
                const data = await response.json();
                
                // Personalizza la visualizzazione dei risultati
                if(data["message"]) {
                    resultDiv.textContent = data["message"];
                    return;
                }
                // Se ci sono risultati, crea una tabella moderna
                if (Array.isArray(data) && data.length > 0) {
                    // Raccogli tutte le chiavi uniche dai risultati
                    const allKeys = Array.from(
                        data.reduce((set, item) => {
                            Object.keys(item).forEach(k => set.add(k));
                            return set;
                        }, new Set())
                    );

                    const foundObjects = data.length;
                    countText.textContent = `Trovati ${foundObjects} risultati per "${safeQuery}" in ${categoryName}.`;

                    // Ordina le chiavi: image, name, price prima, poi le altre
                    const orderedKeys = ['image', 'name', 'price', ...allKeys.filter(k => !['image', 'name', 'price'].includes(k))];

                    const fieldsResponse = await fetch(`${baseApiUrl}/fields`);
                    const fieldLabels = await fieldsResponse.json();

                    // Crea l'header della tabella
                    let table = `<table style="
                        border-collapse: collapse;
                        width: 100%;
                        background: #f8fafc;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 16px rgba(44,62,80,0.10);
                    ">
                        <thead>
                            <tr>
                                ${orderedKeys.map(key => `<th style="padding: 0.75em 1em; background: #667eea; color: #fff; font-weight:700; text-align:left;">${fieldLabels[key]}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(item => `
                                <tr>
                                    ${orderedKeys.map(key => {
                                        let value = item[key];
                                        if (key === 'image' && value) {
                                            return `<td style="padding:0.5em 1em;"><img src="${value}" alt="img" style="max-width:60px;max-height:60px;border-radius:8px;box-shadow:0 2px 8px #0001;"></td>`;
                                        }
                                        if (key === 'image' && !value) {
                                            return `<td style="padding:0.5em 1em;">Non disponibile</td>`;
                                        }
                                        if (key === 'price') {
                                            return value
                                                ? `<td style="padding:0.5em 1em;">${value} €</td>`
                                                : `<td style="padding:0.5em 1em;">Non disponibile</td>`;
                                        }
                                        return `<td style="padding:0.5em 1em;">${value ? value : 'Non disponibile'}</td>`;
                                    }).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>`;
                    resultDiv.innerHTML = table;
                } else {
                    resultDiv.textContent = "Nessun risultato trovato.";
                }
            } catch (err) {
                resultDiv.textContent = err;
            }
        });