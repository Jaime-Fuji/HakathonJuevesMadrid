"""
Flask Backend - Servidor para Tres en Raya Multijugador Online
"""

from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import uuid
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Almacenar salas de juego activas
game_rooms = {}
player_sessions = {}

class GameRoom:
    def __init__(self, room_id, player1_name):
        self.room_id = room_id
        self.player1_id = None
        self.player1_name = player1_name
        self.player2_id = None
        self.player2_name = None
        self.board = [None] * 9
        self.current_player = 'X'  # X = Jugador 1, O = Jugador 2
        self.game_active = True
        self.created_at = datetime.now()
        self.moves = []

    def add_player2(self, player2_id, player2_name):
        self.player2_id = player2_id
        self.player2_name = player2_name

    def make_move(self, index, player_id):
        """Realiza un movimiento en el tablero"""
        if not self.game_active or self.board[index] is not None:
            return False

        player = 'X' if player_id == self.player1_id else 'O'
        if player != self.current_player:
            return False

        self.board[index] = player
        self.moves.append({'index': index, 'player': player, 'timestamp': datetime.now().isoformat()})

        # Verificar ganador
        if self.check_winner():
            self.game_active = False
            return True

        # Cambiar turno
        self.current_player = 'O' if self.current_player == 'X' else 'X'
        return True

    def check_winner(self):
        """Verifica si hay un ganador"""
        winning_combinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ]

        for combo in winning_combinations:
            if (self.board[combo[0]] and 
                self.board[combo[0]] == self.board[combo[1]] == self.board[combo[2]]):
                return True

        # Verificar empate
        if all(cell is not None for cell in self.board):
            return 'draw'

        return False

    def to_dict(self):
        return {
            'room_id': self.room_id,
            'player1_name': self.player1_name,
            'player2_name': self.player2_name,
            'board': self.board,
            'current_player': self.current_player,
            'game_active': self.game_active,
            'moves': len(self.moves)
        }


@app.route('/')
def index():
    return jsonify({'status': 'Backend Tres en Raya Online activo'})


@app.route('/api/rooms', methods=['GET'])
def get_available_rooms():
    """Obtiene las salas disponibles para unirse"""
    available = []
    for room_id, room in game_rooms.items():
        if room.player2_id is None and room.game_active:
            available.append({
                'room_id': room_id,
                'player1_name': room.player1_name,
                'created_at': room.created_at.isoformat()
            })
    return jsonify(available)


@app.route('/api/create-room', methods=['POST'])
def create_room():
    """Crea una nueva sala de juego"""
    data = request.json
    player_name = data.get('playerName', 'Jugador')
    
    room_id = str(uuid.uuid4())[:8]
    room = GameRoom(room_id, player_name)
    game_rooms[room_id] = room
    
    return jsonify({
        'status': 'success',
        'room_id': room_id,
        'message': f'Sala creada. Esperando jugador 2...'
    })


@socketio.on('connect')
def handle_connect():
    """Manejador de conexión"""
    player_id = str(uuid.uuid4())
    player_sessions[request.sid] = player_id
    emit('connection_response', {'data': 'Conectado al servidor', 'player_id': player_id})


@socketio.on('disconnect')
def handle_disconnect():
    """Manejador de desconexión"""
    if request.sid in player_sessions:
        del player_sessions[request.sid]


@socketio.on('join_game')
def on_join_game(data):
    """Se une a una sala de juego"""
    room_id = data.get('room_id')
    player_name = data.get('player_name')
    player_id = player_sessions.get(request.sid)

    if room_id not in game_rooms:
        emit('error', {'message': 'Sala no encontrada'})
        return

    room = game_rooms[room_id]

    if room.player2_id is not None:
        emit('error', {'message': 'Sala llena'})
        return

    if room.player1_id is None:
        room.player1_id = player_id
    else:
        room.add_player2(player_id, player_name)

    join_room(room_id)
    emit('game_state', room.to_dict(), room=room_id)
    emit('player_joined', {
        'message': f'{player_name} se unió a la partida',
        'room_state': room.to_dict()
    }, room=room_id)


@socketio.on('make_move')
def on_make_move(data):
    """Realiza un movimiento en el juego"""
    room_id = data.get('room_id')
    index = data.get('index')
    player_id = player_sessions.get(request.sid)

    if room_id not in game_rooms:
        emit('error', {'message': 'Sala no encontrada'})
        return

    room = game_rooms[room_id]

    if not room.make_move(index, player_id):
        emit('error', {'message': 'Movimiento inválido'})
        return

    emit('game_state', room.to_dict(), room=room_id)

    if not room.game_active:
        winner = 'draw'
        if room.check_winner() == True:
            winner = 'X' if room.current_player == 'O' else 'O'

        emit('game_over', {
            'winner': winner,
            'final_board': room.board
        }, room=room_id)


@socketio.on('reset_game')
def on_reset_game(data):
    """Reinicia el juego"""
    room_id = data.get('room_id')

    if room_id not in game_rooms:
        emit('error', {'message': 'Sala no encontrada'})
        return

    room = game_rooms[room_id]
    room.board = [None] * 9
    room.current_player = 'X'
    room.game_active = True
    room.moves = []

    emit('game_state', room.to_dict(), room=room_id)


@socketio.on('chat_message')
def on_chat_message(data):
    """Maneja mensajes de chat durante el juego"""
    room_id = data.get('room_id')
    message = data.get('message')
    player_id = player_sessions.get(request.sid)

    if room_id not in game_rooms:
        return

    room = game_rooms[room_id]
    player_name = room.player1_name if player_id == room.player1_id else room.player2_name

    emit('new_message', {
        'player_name': player_name,
        'message': message,
        'timestamp': datetime.now().isoformat()
    }, room=room_id)


if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
