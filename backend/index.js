const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {sequelize} = require('./dataBase');
const auth = require("./auth")
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json()); 
app.use(cors()); 


app.use("/auth",auth)


app.get('*', (req, res) => {
    res.status(404).json({error: "Invalid endpoint"})
});

app.listen(PORT, async () => {
    
    try {
        
        require("./models")
        await sequelize.authenticate();
        await sequelize.sync({
            force: false // adatbázis újra generálása
        })
        
        console.log('Connection to the database has been established successfully.');
        console.log(`Server is running on http://localhost:${PORT}`);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }

   
});
