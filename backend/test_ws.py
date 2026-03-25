import asyncio
import websockets
import json

async def test_ws():
    uri = "ws://localhost:8080/api/logs/ws"
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket")
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            print(f"Received: {data.get('type')}")
            if data.get('type') == 'NEW_ALERT':
                print(f"ALERT: {data.get('data').get('rule_name')}")

if __name__ == "__main__":
    try:
        asyncio.run(test_ws())
    except KeyboardInterrupt:
        pass
