const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Anti-Plagiarism API',
      version: '1.0.0',
      description: 'API documentation for the Anti-Plagiarism system',
    },
    servers: [{ url: 'http://localhost:5000/api' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password', 'role'],
          properties: {
            fullName:    { type: 'string', example: 'John Student' },
            email:       { type: 'string', example: 'john@example.com' },
            password:    { type: 'string', example: 'Password123!' },
            role:        { type: 'string', enum: ['student', 'lecturer', 'admin'], example: 'student' },
            phoneNumber: { type: 'string', example: '+1234567890' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', example: 'student@app.com' },
            password: { type: 'string', example: 'Password123!' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id:          { type: 'string' },
                fullName:    { type: 'string' },
                email:       { type: 'string' },
                role:        { type: 'string' },
                phoneNumber: { type: 'string' },
              },
            },
          },
        },
        Settings: {
          type: 'object',
          properties: {
            firstName:           { type: 'string' },
            lastName:            { type: 'string' },
            email:               { type: 'string' },
            emailNotifications:  { type: 'boolean' },
            plagiarismAlerts:    { type: 'boolean' },
            similarityThreshold: { type: 'integer' },
          },
        },
        Scan: {
          type: 'object',
          properties: {
            id:                { type: 'string' },
            userId:            { type: 'string' },
            fileName:          { type: 'string' },
            fileSize:          { type: 'integer' },
            fileType:          { type: 'string' },
            plagiarismPercent: { type: 'number' },
            originalPercent:   { type: 'number' },
            wordCount:         { type: 'integer' },
            status:            { type: 'string', enum: ['original', 'flagged'] },
            matchedSections:   { type: 'array', items: { type: 'object' } },
            createdAt:         { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id:          { type: 'string' },
            fullName:    { type: 'string' },
            email:       { type: 'string' },
            role:        { type: 'string' },
            phoneNumber: { type: 'string' },
            createdAt:   { type: 'string', format: 'date-time' },
          },
        },
        CreateUserRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password', 'role'],
          properties: {
            fullName:    { type: 'string', example: 'New Lecturer' },
            email:       { type: 'string', example: 'newlecturer@app.com' },
            password:    { type: 'string', example: 'Password123!' },
            role:        { type: 'string', enum: ['student', 'lecturer', 'admin'] },
            phoneNumber: { type: 'string', example: '+9876543210' },
          },
        },
        Error: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
        Document: {
          type: 'object',
          properties: {
            id:        { type: 'string' },
            userId:    { type: 'string' },
            fileType:  { type: 'string' },
            fileSize:  { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        DocumentWithContent: {
          type: 'object',
          properties: {
            id:        { type: 'string' },
            userId:    { type: 'string' },
            fileType:  { type: 'string' },
            fileSize:  { type: 'integer' },
            content:   { type: 'string', description: 'Base64 encoded file content' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./swagger/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
