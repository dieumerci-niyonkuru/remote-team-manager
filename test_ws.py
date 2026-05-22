import websocket

ws = websocket.WebSocket()
ws.connect("ws://127.0.0.1:8000/ws/chat/1/")

ws.send("hello")
print(ws.recv())

ws.close()