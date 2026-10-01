# PAC-SMASH BURGER — web

Web estática (HTML + CSS + JS, con GSAP y Lenis por CDN). No hace falta compilar nada: se sube la carpeta tal cual. En local conviene servirla para que cargue el vídeo:

```bash
python -m http.server 5188
```

## Estructura

```
index.html
assets/
  css/style.css
  js/main.js
  img/      fotos del local y de la comida (webp), favicon.svg
  video/hero.mp4
```

## Paleta (sacada del local)

| Token | Valor | De dónde sale |
|---|---|---|
| `--bg` | `#06060c` | paredes negras de la sala |
| `--yellow` | `#ffe02e` | Pac-Man y el "burger" de la carta |
| `--pink` / `--cyan` / `--orange` / `--green` | neones de los fantasmas | rótulo de neón y logo |
| `--maze` | `#2f3cff` | líneas azules de la carta / laberinto |
| `--ring` | `#ff5a2e` | aro naranja del logo |

Cada burger de la carta usa el color de su nombre en la pizarra del local.

## Secciones

1. **Hero**: máquina recreativa que reproduce `hero.mp4`, fantasmas que se pueden "comer" (suman puntos al marcador 1UP) y fondo degradado que se funde con la sección siguiente.
2. **Menú hamburguesa (GSAP)**: un Pac-Man gigante cruza la pantalla y deja el menú detrás. Tres secciones: Sobre nosotros, La carta y Cómo trabajamos.
3. **Sobre nosotros**: collage del interior, fachada y neón.
4. **La carta**: recreada como la pizarra del local (marco con laterales INSERT €1.00 / GAME OVER, logo, camino de puntos que une las burgers, zona de entrantes y recuadros de opciones), con el texto transcrito de las fotos. Al pasar el ratón por las burgers que tienen foto aparece la imagen (en móvil, la foto va dentro de la fila).
5. **Carrusel 3D** de comida: arrastrable, con giro automático e inclinación ligada al scroll.
6. **Cómo trabajamos**: laberinto que Pac-Man recorre con el scroll, encendiendo cada paso. Cierra con el CTA "CONTINUE?" hacia Instagram y Linktree.
7. **Reseñas** (Google Maps, 4,8★ · 377): marcador de puntuación, tabla de récords y dos filas en movimiento.
8. **Visítanos**: dirección, horario con aviso de abierto/cerrado (hora de Madrid), teléfono, Uber Eats, Glovo y mapa.

## SEO

- Palabras clave principales: hamburguesería en Benidorm, smash burgers Benidorm, hamburguesas caseras / veganas / a domicilio en Benidorm.
- H1 con texto accesible (`.sr-only`) y H2 de cada sección con la palabra clave.
- Datos estructurados: `Restaurant` (dirección, horario, carta con precios, pedidos por Uber Eats y Glovo) y `FAQPage`, que coincide con las preguntas frecuentes visibles en Visítanos.
- **Al publicar:** añadir `<link rel="canonical">` con el dominio y poner `og:image` e `image` del JSON-LD con URL absoluta. Hay un comentario en el `<head>` como recordatorio.

## Pendiente de confirmar con el cliente

- **Vídeo del hero**: no venía ninguno, así que `hero.mp4` es un montaje con zoom suave hecho a partir de sus propias fotos. Si te pasan un vídeo real, sustituye `assets/video/hero.mp4` (mejor vertical 3:4, o se recorta solo).
- **Precios de los entrantes**: en las fotos de la pizarra salen cortados, así que no se muestran.
- **Dirección**: Google Maps dice Carrer de l'Alt, 2. En Linktree aparece C/ Martínez Oriola, 5 como punto de recogida.
- Las fotos de Spooky y Pokey no se distinguen con claridad, así que esas dos filas no muestran imagen al pasar el ratón.
