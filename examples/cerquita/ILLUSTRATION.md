# Cerquita · lenguaje de ilustración

> El documento que motif deja en el proyecto. Si vas a agregar o cambiar una ilustración, leelo primero.

## El mundo

Lo que viaja entre dos personas que viven lejos. Cerquita no dibuja teléfonos ni mapas: dibuja dos tazas en la misma mesa, un pasaje, una valija, una carta, un calendario y la flor del logo.

## La mano

La de los íconos de la app: una línea verde oscuro, pareja y apenas temblorosa, con rellenos planos y suaves. Sin textura, sin sombras, sin fuera de registro. Es una mano propia (`HAND` en `cerquita-art.mjs`), no una de las tres del motor.

- **Papel** `#fdf7ec` · **Tinta** `#1d4a3a`: los del fondo y del texto.
- **Acentos**: manteca `#fde3a0`, flor `#f5c518`, rosa `#f4d2cc`, salvia `#cfe0c9`, cielo `#d6e6f2`. Solo como rellenos.
- **Tipografía** en la imagen para compartir: Georgia, la serif de los títulos.

## Dónde aparece

| Lugar | Qué muestra | Semilla |
|---|---|---|
| Contador de la home | Dos tazas en una mesa. La distancia entre ellas es proporcional a los días que faltan (30 o más: en las puntas). Un punto por semana, hasta cuatro. El día del encuentro se inclinan y brindan, con la flor arriba | Los días |
| Cada lugar guardado | El objeto del tipo de lugar (café, parque, cine, restaurante) sobre una mancha de color, con un pin | Nombre del lugar |
| Recuerdos vacíos | Un sobre abierto y el marco punteado de la primera foto, con "+" | Fijo |
| Viajes vacíos | Una valija, un pasaje y el calendario | Fijo |
| Cada uno de los dos | Una flor del logo, de un color distinto para cada uno | Nombre, más la pareja (`among`) |
| Compartir el contador (OG, PNG) | "Faltan N días" y el contador de ese día | Los días |

## Reglas

- Una sola tinta para contornos y detalles. Los acentos son rellenos.
- Donde hay un dato que importa, el dibujo lo muestra y no lo decora: la distancia entre las tazas es los días que faltan. No sumar números dentro del dibujo; el texto está al lado.
- La flor es el premio: aparece el día del encuentro, en los avatares y como detalle. No usarla de relleno en todos lados.
- Lo que cambia con la semilla: el color de fondo de cada lugar, la forma de la mancha, el giro de las flores. Lo que no cambia: las proporciones de cada objeto, la tinta y la paleta.

## Cómo agregar un objeto

1. Una función en `cerquita-art.mjs` que lo dibuje dentro de una caja `{x, y, w, h}`, igual que `mug` o `ticket`. Proporciones relativas a la caja.
2. Si es un tipo de lugar, sumá una regla en `PLACE` con las palabras que lo nombran.
3. `node ../../scripts/specimen.mjs cerquita-art.mjs` y miralo junto a los demás: ¿parece de la misma mano?
