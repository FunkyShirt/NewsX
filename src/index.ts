import * as express from 'express'
import * as http from 'http'
import * as rp from 'request-promise'
import * as es from 'elasticsearch'
import { result2send } from './util'

const app = express();
let client = new es.Client({
    host: 'localhost:9200',
    log: 'trace'
});

app.get('/', (req, res)=>{
    res.send("helloworld");
})

app.get('/api/mainpage', async (req, res) => {
    
    let result = await client.search({
        index: 'newsx',
        type: 'article',
        from: 0, size: 9,
        body: {
            query: {
                function_score: {
                    query: { match_all: {}},
                    random_score: {}
                }
            }
        }

    });
    res.send(result2send(result));
})

app.get('/api/relevantnews', async (req, res) => {
    const newsid = req.param('newsid', 0);
    const method = req.param('method', 0);
    const keywords = req.param('keywords', 0);
    const limit = parseInt(req.param('size', '10'));
    // const result = await rp('http://www.google.com');
    // const result = await rp(`localhost:9200?newsid=${newsid}&method=${method}`);

    let result = await client.search({
        index: 'newsx',
        type: 'article',
        from: 0, size: limit,
        _source: ['title', 'meta_description', 'meta_img', 'source', 'phrase', 'phrases'],
        body: {
            query: {
                match: {
                    articlePhrases: keywords
                }
            }
        }
    });

    let dataToSend = result2send(result);
    dataToSend.sort((a, b)=> {
        return a.date < b.date ? 1: 0;
    })
    res.send(dataToSend);
})

app.get('api/fullarticle', async (req, res) => {
    const newsid = req.param('newsid', 0);
    let result = await client.get({
        index: 'newsx',
        type: 'article',
        id: newsid
    });
    res.send(result.hits.hits._source);

});

app.listen(3000, ()=>{
    console.log("listening on 3000!")
})