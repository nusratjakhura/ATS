import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN
    }
));

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true, limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser())

//high-level routes
import hrRoute from './routes/hr.route.js'
import authRoute from './routes/auth.route.js'

app.use('/api/hr', hrRoute)
app.use('/api/auth',authRoute)


export {app};