# klikenstuurop
Website to klik en verstuur

## Hortos API key ophalen

1. Kopieer `hortos_credentials.example.json` naar:
   `hortos_credentials.json`
2. Vul in `hortos_credentials.json` je `username` en `password` in, plus de juiste API endpoints.
3. Start de lokale server:
   ```bash
   python hortos_key_server.py
   ```
4. Open `http://127.0.0.1:8000/index.html` en klik op knop **API key ophalen**.
