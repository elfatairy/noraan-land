import { Application } from "express";

import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Noraan API Documentation",
            description: "API endpoints for the Noraan Website",
            version: "1.0.0",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
            },
        ],
        security: [{ Authorization: [] }],
    },
    apis: ["./routes/*.ts"],
    customCss: `
        .swagger-ui .topbar-wrapper svg {
            display: none;
        }
        #swagger-ui > section > div.topbar > div > div > a > svg{
            display: none !important;
        }
        #swagger-ui > section > div.topbar > div > div > a::after{
            content: "API Docs";
            font-size: 1.5rem;
            font-weight: 700;
            color: #fff;
            margin-left: 10px;
        }
    `,
};
const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app: Application, port: Number) => {
    app.use(
        "/docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec)
    );
}
