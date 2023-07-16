////API DOCUMENTATION
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from 'swagger-jsdoc';
//package import
import express from "express";
import dotenv from 'dotenv';
import colors from "colors";
import cors from 'cors';
import morgan from "morgan";
import "express-async-errors";

//files import
import connectDB from "./config/db.js";
//securty packges

import xss from "xss-clean";

//routes import
import testRoutes from './routes/testRoutes.js';
import authRoutes from './routes/authRoutes.js';
import errorMiddleware from "./middlewares/errorMiddleware.js";
import userRoutes from './routes/userRoutes.js';
import jobsRoutes from './routes/userRoutes.js';

dotenv.config();

connectDB();

//swagger api config
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Job Portal Application",
            description: "Node Expressjs Job Portal Application",
        },
        servers: [
            {
                //         url: "http://localhost:8080",
                url: "https://nodejs-job-portal-app.onrender.com"
            },
        ],
    },
    apis: ["./routes/*.js"],
};
const spec = swaggerDoc(options);

const app = express();

//middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));


//routes
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/job', jobsRoutes);

//homeroute root
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(spec));

//validation middleware

app.use(xss());
app.use(errorMiddleware);


const PORT = process.env.PORT || 8080

app.listen(8080, () => {

});