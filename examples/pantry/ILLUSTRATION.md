# Pantry · lenguaje de ilustración

> El documento que leitmotiv deja en el proyecto. Si vas a agregar o cambiar una ilustración, leelo primero.

## El mundo

La casa vista desde la alacena. Pantry no dibuja teléfonos ni listas: dibuja lo que se termina en una casa compartida. Frascos, cartones de leche, botellas de detergente, bananas, frutas, pan, bolsas de café, latas, el estante donde viven.

## La mano

Riso: color plano con grano color papel (donde la tinta no llegó a cubrir), un trazo apenas tembloroso y un contorno de tinta verde oscuro impreso un poco fuera de registro. Cálido y hecho a mano, como la app.

- **Papel** `#f5f0e6` · **Tinta** `#2b4636`: los mismos del fondo y del texto de la interfaz.
- **Acentos**: tomate `#e8603c`, mostaza `#eab246`, cielo `#7fb2dc`, menta `#62b49f`, rosa `#f0a59a`, avena `#e3cfa8`. Solo como rellenos.
- **Modo oscuro**: papel `#1f2620`, tinta `#efe7d6`, mismos acentos, sin multiplicar. Las etiquetas siguen siendo de papel, con marcas en tinta oscura.

## Dónde aparece

| Lugar | Qué muestra | Semilla |
|---|---|---|
| Cada producto de la lista (40 px) | El objeto del producto, según su nombre (`kindOf`) | Nombre del producto |
| Cada conviviente (28–30 px) | Una fruta con ojos. Color y forma distintos para cada persona de la casa | Nombre, más la casa (`among`) |
| Lista vacía | Un estante con un frasco, un hueco punteado con "+" y un tomate. El hueco apunta al botón "Agregar lo primero" | Nombre de la lista |
| Todo comprado | El estante lleno | Nombre de la lista |
| Historial | Collage de lo que se compró esa semana | Título de la semana y sus productos |
| Invitación (OG, PNG) | "Pantry" y quién invita a la izquierda, la alacena a la derecha | Título e invitación |
| 404 | Un frasco caído con los granos desparramados | Fijo |

## Reglas

- Una sola tinta para contornos y detalles. Los acentos son rellenos.
- Todo se apoya en algo (el estante, el piso) o está desparramado con intención (portadas).
- Sin texto dentro de las ilustraciones; en la imagen para compartir, el título va al costado.
- Lo que cambia con la semilla: qué acento lleva cada objeto, la tapa, la inclinación (±14°) y la disposición en las portadas. Lo que no cambia: las proporciones de cada objeto, la tinta y la paleta.
- Los avatares acompañan siempre al nombre, nunca lo reemplazan del todo.

## Cómo agregar un objeto

1. Una función en `pantry-art.mjs` que lo dibuje dentro de una caja `{x, y, w, h}` con `c.shape`, `c.stroke` y `c.dot`, igual que `jar` o `carton`. Las proporciones van relativas a la caja.
2. Sumala a `MOTIFS` y una regla en `KINDS` con las palabras que la nombran, sin tildes y en castellano e inglés.
3. `node specimen.mjs pantry-art.mjs` y miralo junto a los demás: ¿parece de la misma mano?
