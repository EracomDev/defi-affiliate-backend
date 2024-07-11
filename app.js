require('dotenv').config();
require('./connections')
require('./MODALS/wallets')
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const cors = require('cors');
const corsOptions = {
    origin: '*', // Replace with your React app's URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static('public'));
const crypto = require('crypto');
const bodyParser = require('body-parser');
const GAME = require('./API/GAME/gameClass');
const u_router = require('./ROUTES/usreRoutes');
const project_setup = require('./utils/project-setup');
const {getAllRoutes} = require('./utils/get-all-routes');
const authenticator = require('./utils/authuser');
const runGame = require('./SERVICES/game');
const admin = require('./ROUTES/adminRoutes');
const { default: axios } = require('axios');
const port = process.env.PORT;
var jsonParser = bodyParser.json();
app.use(jsonParser)
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/user',u_router)
app.use('/admin',admin)
app.use(express.static(__dirname + '/uploads/'))
const merchantKey = process.env.MERCHANT_KEY;
// app.get('/',async (req,res)=>{
//     res.send('hello')
// });
const clients = {};
function sendDataToUser(userId, data) {
    const client = clients[userId];
    if (client) {
        client.send(JSON.stringify(data));
    } else {
        console.log(` ${userId} is not connected.`);
    }
}
wss.on('connection', function connection(ws) {
    console.log('Client connected');
    
    // Handle messages from clients
    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        // Assuming userId is sent along with the message
        const userId = data.userId;
        clients[userId] = ws; // Store client reference by userId
    });

    // Handle closing of connection
    ws.on('close', function close() {
        console.log('Client disconnected');
        // Clean up client reference
        Object.keys(clients).forEach((userId) => {
            if (clients[userId] === ws) {
                delete clients[userId];
            }
        });
    });
});

// app.get('/get_games/:page',async (req,res)=>{
//     const page = req.params.page;
// //  for (let index = 1; index < 78; index++) {
//      const RESULT = await GAME.game1(page)
// //  }
//     res.json({DATA:'RES'})
// });

app.post('/webhooks/slotegrator/v1/transactions/execute',(req,res,next)=>{
    const userId = req.body.player_id;
    const client = clients[userId];
    if (client) {
        req.client = client;
    } else {
        console.log(`Client with userId ${userId} is not connected.`);
    }
    next()
},authenticator.SlotegratorAuth,runGame.play_game);
app.get('/self-validate',GAME.self_validation)
app.get('/project_setup',async (req,res)=>{
     const RESULT = await project_setup.save_advance()
     const user = await project_setup.save_first_user()
    res.json({DATA:'RES',RESULT,user})
});
app.get('/active_games',async (req,res)=>{
    const RESULT = await GAME.active_game();
      res.json({DATA:'RES',RESULT});
  });
//   app.get('/api/crypto', async (req, res) => {
//     console.log('object')
//     try {
//         const response = await axios.get(
//             'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest',
//             {
//               headers: {
//                 'X-CMC_PRO_API_KEY': 'a426ff5f-f4fd-499f-8a79-2870e3cb470c'
//               },
//               params: {
//                 convert: 'USD'
//               }
//             }
//           );
//       res.json(response.data);
//     } catch (error) {
//       console.error('Error fetching data:', error.message);
//       res.status(500).json({ error: 'Something went wrong' });
//     }
//   });
//   app.get('/api/crypto/history', async (req, res) => {
//     const { cryptoId } = req.query;
//     console.log(cryptoId);
//     try {
//         const response = await axios.get(
//             `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical`,
//             {
//                 headers: {
//                     'X-CMC_PRO_API_KEY': 'a426ff5f-f4fd-499f-8a79-2870e3cb470c',
//                     'Content-Type': 'application/json'
//                 },
//                 params: {
//                     id: cryptoId,
//                     time_start: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60), // 7 days ago
//                     time_end: Math.floor(Date.now() / 1000), // current time
//                     interval: 'daily'
//                 }
//             }
//         );
//         res.json(response.data);
//     } catch (error) {
//         console.error('Error fetching data:', error.response ? error.response.data : error.message);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });


//   app.get('/testweb',(req,res)=>sendDataToUser("player",100));
//   const routes = getAllRoutes(app)



//   console.log(routes)
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});