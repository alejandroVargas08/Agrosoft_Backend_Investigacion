#!/bin/bash
#   ./chat.sh "tu pregunta"
# Uso con imagen:
#   ./chat.sh ruta/a/imagen.jpg "tu pregunta sobre la imagen"

if [ -f "$1" ]; then
  #Este es para analizar la imagen
  IMAGEN_PATH="$1"
  PROMPT="${2:-Analiza esta imagen de un cultivo agrícola. Indica el estado de las hojas, posibles plagas o enfermedades, y recomendaciones.}"
  BASE64_IMG=$(base64 -i "$IMAGEN_PATH")

  curl -s -X POST http://localhost:3000/api/ia/analizar-imagen \
    -H "Content-Type: application/json" \
    -d "{\"imagen\":\"$BASE64_IMG\",\"prompt\":\"$PROMPT\"}" | jq -r '.respuesta'
else
 #Este es para el texto
  curl -s -X POST http://localhost:3000/api/ia/chat \
    -H "Content-Type: application/json" \
    -d "{\"mensaje\":\"$1\"}" | jq -r '.respuesta'
fi