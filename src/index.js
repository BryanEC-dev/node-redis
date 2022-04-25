const express = require("express")
const axios = require("axios");
const responseTime = require("response-time");
const {createClient} = require("redis"); 


let client

(async () => {
     client = createClient();
  
    client.on('error', (err) => console.log('Redis Client Error', err));
  
    await client.connect();

  })();

const app = express();

app.use(responseTime())

app.get('/character', async (req,res) => {
    
    try {
        const value = await client.get('character');

    if (!value){
        const response = await  axios.get("https://rickandmortyapi.com/api/character")
        const save = await client.set('character', JSON.stringify(response.data), {
            EX: 1296000,
            NX: true
          });

        console.log(save);
        return res.json(response.data)
    }

    console.log("ya esta guardado");
    return res.json(JSON.parse(value))

    } catch (error) {
       console.log(error) 
    }
    
})


app.get("/character/:id", async(req, res) => {
    try {

        const value = await client.get(req.originalUrl)

        if (!value){
            const response = await  axios.get("https://rickandmortyapi.com/api/character/"+ req.params.id)
            const save = await client.set(req.originalUrl, JSON.stringify(response.data));
    
            console.log(save);
            return res.json(response.data)
        }

        console.log("ya esta guardado");
        return res.json(JSON.parse(value))

       
    } catch (error) {
        log.error(`Error ${error}`)
    }
});


app.listen(3000)
console.log("app iniciada");


