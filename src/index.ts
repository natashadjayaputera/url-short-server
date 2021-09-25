import express from 'express'
import accessShortUrlHandler from './handlers/access-short-url'
import createShortUrlHandler from './handlers/create-short-url'
import getShortUrlStatsHandler from './handlers/get-short-url-stats'
import { DatabaseService } from './services/database'
// const express = require('express') 
// const fs = require('fs')

const app = express()

DatabaseService.instance

app.use(express.json())

app.post('/short-urls', createShortUrlHandler)

app.get('/:id', accessShortUrlHandler)

app.get('/:id/stats', getShortUrlStatsHandler)

app.listen(8000) 


// * EXAMPLES
// app.get('/', (req, res) => {
//   try {
//     const responseBody = { greetings: 'Hello, World!'}
//     res.set('Content-Type', 'application/json')
//     res.status(200) // indicates successful HTTP responds
//     res.send(responseBody)
//   } catch {
//     res.set('Content-Type', 'application/json')
//     res.status(500) 
//     res.send({error: 'Server Error'}) 
//   }
//   })

// app.get('/about', (req, res) => {
//     fs.readFile('src/pages/about.html', null, (err, fileContent) => {
//       if (err) {
//         res.set('Content-Type', 'application/json')
//         res.status(500) 
//         res.send({error: 'Server Error'}) 
//       } else {
//         res.set('Content-Type', 'text/html') // set the responds HTTP header, with (key <>, to the value of <>)
//         res.status(200)
//         res.send(fileContent)
//       }
//     })
//   })