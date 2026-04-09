# 🎮 Tres en Raya (Tic Tac Toe)

Un juego interactivo de Tres en Raya para web donde puedes jugar contra una IA con tres niveles de dificultad.

## 🚀 Características

- **Juega contra la máquina**: IA inteligente con 3 niveles de dificultad
- **Máximo 3 fichas activas**: Cada jugador puede tener solo 3 fichas en el tablero. La ficha más antigua se reemplaza cuando colocas una nueva ♻️
- **Dificultades disponibles**:
  - **Fácil**: Movimientos aleatorios
  - **Medio**: 70% estrategia inteligente, 30% aleatorio
  - **Difícil**: Algoritmo Minimax (casi invencible)
- **Seguimiento de puntuación**: Estadísticas guardadas en el navegador
- **Interfaz moderna**: Diseño responsivo y atractivo
- **Animaciones suaves**: Experiencia de usuario fluida

## 📁 Estructura del Proyecto

```
project/
├── index.html                 # Archivo principal
├── README.md                  # Este archivo
└── src/
    ├── app/
    │   ├── app.js            # Controlador principal
    │   ├── game-logic.js     # Lógica del juego
    │   └── ai-player.js      # Inteligencia artificial
    └── assets/
        └── styles.css        # Estilos
```

## 🎮 Cómo Jugar

1. Abre `index.html` en tu navegador
2. Elige la dificultad deseada
3. Haz clic en cualquier celda para jugar (Eres X)
4. **Máximo 3 fichas activas**: Cada jugador solo puede tener 3 fichas en el tablero. Cuando intentas colocar la 4ª ficha, la más antigua se mueve automáticamente a la nueva posición. ♻️
5. La máquina jugará automáticamente (O)
6. Gana formando tres de tus símbolos en línea (horizontal, vertical o diagonal)
7. Usa "Nuevo Juego" para jugar de nuevo
8. Usa "Reiniciar Puntuación" para borrar las estadísticas

## 📋 Reglas del Juego

- **Fichas limitadas**: Cada jugador puede tener máximo 3 fichas activas en el tablero
- **Movimiento automático**: Cuando alcanzas 3 fichas y colocas una nueva, la más antigua desaparece
- **Victoria**: Forma tres símbolos iguales en línea (horizontal, vertical o diagonal)
- **Empatate si se llena el tablero sin ganador (9 fichas totales)
- **Indicador de fichas**: La interfaz muestra cuántas fichas activas tienes (●) o si vas a mover una ficha (♻️)

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura del documento
- **CSS3**: Diseño responsivo y animaciones
- **JavaScript Vanilla**: Lógica pura sin dependencias
- **LocalStorage**: Almacenamiento de estadísticas

## 🤖 Algoritmo de IA

### Nivel Fácil
- Elige movimientos completamente al azar

### Nivel Medio
- 70% de probabilidad de usar estrategia inteligente
- 30% de probabilidad de movimiento aleatorio
- Estrategia inteligente:
  1. Intenta ganar
  2. Bloquea al jugador
  3. Toma el centro
  4. Toma una esquina
  5. Toma cualquier posición

### Nivel Difícil
- Implementa el algoritmo **Minimax**
- Analiza todos los movimientos posibles
- Elige el movimiento óptimo
- Prácticamente imposible de vencer

## 💾 Datos Guardados

El juego guarda automáticamente las puntuaciones en `localStorage`:
- Victorias del jugador
- Victorias de la máquina
- Empates

Los datos persisten entre sesiones del navegador.

## 🎨 Personalización

### Cambiar Colores
Edita las variables CSS en `styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #ec4899;
    /* ... más colores ... */
}
```

### Ajustar Dificultad
Modifica en `ai-player.js` el método `getMoveDelay()` para cambiar la velocidad de respuesta.

## 🌐 Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Navegadores móviles

## 📱 Responsive Design

El juego es completamente responsivo y se adapta a:
- Pantallas de escritorio
- Tablets
- Teléfonos móviles

## 🔐 Privacidad

- No requiere conexión a internet (excepto para cargar archivos)
- Todos los datos se guardan localmente en tu navegador
- No se envía información a servidores

## 🎓 Estructura del Código

### GameLogic.js
Gestiona la lógica del juego:
- Validación de movimientos
- Detección de ganadores
- Algoritmo Minimax

### AIPlayer.js
Implementa la inteligencia artificial:
- Estrategias por dificultad
- Búsqueda de movimientos ganadores
- Algoritmo Minimax

### App.js
Controlador principal:
- Manejo de eventos
- Actualización de UI
- Gestión de estadísticas

## 💡 Mejoras Futuras

- [ ] Multijugador en línea
- [ ] Historial de partidas
- [ ] Temas personalizables
- [ ] Sonidos y efectos
- [ ] Rankings

## 📄 Licencia

Este proyecto es de código abierto y libre para usar y modificar.

## 🤝 Contribuciones

¿Encontraste un bug o tienes una sugerencia? ¡Siéntete libre de reportarlo!

---

¡Disfruta jugando! 🎉
