const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { User } = require('./models/user');
const common = require("./config/common");
const JWT_SECRET = common.config()["JWT_SECRET"]
const { Document, UserRole } = require('./models/document');

const wss = new WebSocket.Server({ noServer: true });

// Map to store the documentId to client connections
const documentClientsMap = new Map();

wss.on('connection', async (ws, req) => {
    const token = req.url.split('token=')[1];
    if (!token) {
        ws.close(4001, 'Access Denied');
        return;
    }
    try {
        const verified = jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    ws.close(4001, 'Access token expired');
                }
                ws.close(4001, 'Invalid access token');
            }
            return user;
        });
        const user = await User.findById(verified.id);
        if (!user) {
            ws.close(4001, 'Access Denied');
            return;
        }

        ws.on('message', async (message) => {
            const userId = verified.id
            const { documentId, content } = JSON.parse(message);

            // Add client to the document map
            if (!documentClientsMap.has(documentId)) {
                documentClientsMap.set(documentId, new Set());
            }
            documentClientsMap.get(documentId).add(ws);

            let userRole = await UserRole.findOne({ documentId, userId })
            let document = null
            if (!userRole || !userRole.name.includes("ADMIN", "EDITOR")) {
                console.log(`User don't have access to edit content`)
                document = await Document.findById(documentId)
            } else {
                document = await Document.findByIdAndUpdate(documentId, { content });
            }
            let newContent = document.content
            let userRoles = document.userRoles
            // Broadcast to only the clients related to the documentId
            documentClientsMap.get(documentId).forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ documentId, newContent, userRoles }));
                }
            });
        });

        // Handle client disconnect
        ws.on('close', () => {
            documentClientsMap.forEach((clients, documentId) => {
                if (clients.has(ws)) {
                    clients.delete(ws);
                    if (clients.size === 0) {
                        documentClientsMap.delete(documentId);
                    }
                }
            });
        });

    } catch (err) {
        ws.close(4001, 'Invalid Token');
    }
});

module.exports = wss;