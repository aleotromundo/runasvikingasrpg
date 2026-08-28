# Dirección creativa — Runa de los Fiordos

## Tres rutas estilísticas consideradas

### Enfoque 1 — Saga de Hielo Tallado
**Very Brief Intro:** Fantasía nórdica editorial con piedra, madera quemada, mapas de navegación y luz de aurora. Busca una sensación de leyenda antigua, táctil y ceremonial.

**Probability:** 0.04

### Enfoque 2 — Sala de Guerra Ámbar
**Very Brief Intro:** Estrategia premium de alto contraste, con carbón, marfil frío y un ámbar de antorcha como señal de acción. La interfaz parece una mesa de mando tallada, mientras el combate se lee con claridad inmediata.

**Probability:** 0.07

### Enfoque 3 — Tinta de Skald
**Very Brief Intro:** Ilustración monocroma como manuscrito medieval, con manchas de tinta, trazos de grabado y acentos rojos de batalla. Más artístico y narrativo, con menor énfasis en una lectura competitiva rápida.

**Probability:** 0.02

## Enfoque seleccionado — Sala de Guerra Ámbar

### Design Movement
**Brutalismo editorial nórdico**, combinado con señalética de expedición y materiales de una sala de guerra: placas angulares, cortes de pergamino, metal ennegrecido y una jerarquía tipográfica contundente.

### Core Principles
1. **El contraste sirve a la decisión.** Carbón y azul glacial construyen el campo; el ámbar solo aparece donde hay acción, recurso o urgencia.
2. **La interfaz parece un objeto.** Los paneles se sienten como placas de madera, hierro y pergamino, no como tarjetas SaaS con esquinas idénticas.
3. **La asimetría orienta la mirada.** El HUD prioriza un mapa central amplio, un panel de estado izquierdo y un registro vertical derecho.
4. **La leyenda se cuenta con señales, no con ornamento.** Runas, astillas, brújulas y marcas de tiza aparecen como sistema visual funcional.

### Color Philosophy
El fondo azul carbón comunica frío, profundidad y concentración; el marfil glacial permite leer durante sesiones largas; el ámbar de antorcha es el color propio de la marca y se reserva para órdenes ejecutables, gloria y eventos decisivos. Un rojo hierro oxidado marca daño o peligro sin convertir toda la pantalla en alarma. La paleta debe parecer iluminada por fuego sobre piedra húmeda.

### Layout Paradigm
Una **mesa de mando oblicua**: el mapa ocupa el centro con una leve inclinación visual, el panel de clan se ancla a la izquierda y el registro de batalla flota a la derecha. La barra de habilidades se engancha al borde inferior como una placa de hierro. No se usará una cuadrícula simétrica de tarjetas; las áreas deben parecer piezas colocadas sobre un tablero de incursión.

### Signature Elements
- **Muescas de navegación:** pequeñas marcas angulares y líneas de rumbo que señalan corredores, objetivos y cooldowns.
- **Placas partidas:** paneles con bordes duros y una esquina recortada, como escudos o tablillas rúnicas.
- **Sello ámbar:** la runa propia de Runa de los Fiordos aparece como un símbolo circular de tres cortes, siempre sin texto dentro.

### Interaction Philosophy
Cada interacción debe sentirse como dar una orden a la tripulación. Los botones responden con un pequeño desplazamiento y un destello ámbar, sin rebotes juguetones. Las habilidades se activan al instante con teclado; el hover revela coste y consecuencia en lenguaje breve. Los eventos importantes dejan una muesca en el registro de batalla, reforzando que el jugador está leyendo una expedición viva.

### Animation
El mapa mantiene un movimiento ambiental lento: niebla, agua y partículas de nieve a baja opacidad. Las órdenes del jugador son secas y rápidas, entre 100 y 180 ms. Los impactos usan escala y opacidad, nunca desplazamientos que dificulten la lectura. La aparición del Jotun se reserva para una entrada de 420 ms con una vibración suave del sello central. Se respeta `prefers-reduced-motion` y se eliminan partículas decorativas si el usuario lo solicita.

### Typography System
- **Display:** `Cinzel` en mayúsculas, peso 700, para el nombre del clan, títulos de evento y números de nivel; aporta piedra tallada sin caer en una tipografía genérica.
- **UI y lectura:** `DM Sans`, pesos 400–700, para estadísticas, botones, tooltips y mensajes de combate.
- **Jerarquía:** títulos compactos de 12–16 px con tracking amplio; números de recurso de 20–28 px; mensajes de acción de 11–13 px en mayúsculas; narración opcional de 14 px en marfil.

### Brand Essence
**Runa de los Fiordos es una incursión táctica de navegador para quienes quieren tomar decisiones de asedio con la crudeza de una saga nórdica, sin perder legibilidad ni ritmo.**

Personalidad: **feroz, ritual, precisa**.

### Brand Voice
Los titulares suenan a proclamación breve; los CTAs son órdenes concretas; el microcopy habla de consecuencias, no de funcionalidades abstractas.

Ejemplos:

> **Abre el fiordo. Rompe el monolito.**

> **Llama a la tormenta**

### Wordmark & Logo
El logotipo será un símbolo sin texto: un círculo de runa ámbar atravesado por tres cortes como remos vistos desde arriba. El wordmark, cuando aparezca, usará `Cinzel` con una ligadura personalizada entre “R” y “F”, acompañado del símbolo a la izquierda. El favicon utilizará únicamente el sello ámbar sobre carbón.

### Signature Brand Color
**Ámbar de Antorcha — `#E3A83B`**. Es el color propio de la marca: la luz cálida que convierte una decisión fría en una orden visible.

## Regla de decisión
Ante cualquier elección visual o de interacción, preguntar: **¿Esto refuerza o diluye la idea de una sala de guerra nórdica donde cada señal ayuda a decidir?**
