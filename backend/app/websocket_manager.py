import json
from typing import List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Broadcast real-time updates to all connected frontend clients
        if not self.active_connections:
            return
            
        json_msg = json.dumps(message, default=str)
        for connection in self.active_connections:
            try:
                await connection.send_text(json_msg)
            except Exception as e:
                # Connection might have dropped
                print(f"Failed to send to websocket: {e}")
                
manager = ConnectionManager()
