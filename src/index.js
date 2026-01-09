import express from 'express'
import morgan from 'morgan';
import {PORT} from './config.js'
import FlowersRoutes from './routes/flowers.routes.js'
import Credentials from './routes/login.routes.js';

const app = express();

app.use(express());
app.use(morgan('dev'));
app.use(express.json());

app.use((err, req, res, next) =>{
    return res.status(500).json({message : err.message})
});
app.use('/api', FlowersRoutes, Credentials);

app.get('/api', (req, res)=>{
    return res.send('Bienvenido a la florería')
})


app.listen(PORT);

console.log(`Servidor corriendo en http://localhost:${PORT}`);