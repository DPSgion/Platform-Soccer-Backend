const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Platform Soccer API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
apis: ["./src/swagger/**/*.yaml"]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;