import express, { Response, Request, application } from 'express'
import fs from 'fs'
import { register } from 'ts-node'
import { generateRandomId, validateCustomId } from './helpers/id'
import { DatabaseService } from './services/database'
// const express = require('express') 
// const fs = require('fs')

const app = express()
const db = new DatabaseService()

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

app.use(express.json())


interface CreateShortUrlRequestBody {
  id?: string
  originalUrl: string
}

interface SuccessCreateShortUrlResponseBody {
  code: 'success'
  originalUrl: string
  shortenedUrl: string
}

interface FailCreateShortUrlResponseBody {
  code: 'fail'
  error: { message: string }
}

type CreateShortUrlResponseBody = SuccessCreateShortUrlResponseBody | FailCreateShortUrlResponseBody

app.post('/short-urls', async (
  req: Request<{}, CreateShortUrlResponseBody, CreateShortUrlRequestBody>,
  res: Response<CreateShortUrlResponseBody>,
) => {

  if (typeof req.body.originalUrl !== 'string') {
    res.status(400).send({
      code: 'fail',
      error: { message: 'invalid-original-url' }
    })
    return
  }

  if (typeof req.body.id === 'string'){
    if (req.body.id.length < 5) {
      res.status(400).send({
        code: 'fail',
        error: { message: 'id-is-too-short'}
      })
      return
    } else if (req.body.id.length > 128) {
      res.status(400).send({
        code: 'fail',
        error: { message: 'id-is-too-long'}
      })
      return
    } else if (!validateCustomId(req.body.id)) {
      res.status(400).send({
        code: 'fail',
        error: { message: 'id-must-be-alphanumeric'}
      })
      return
    }
  }

  try {
    const isCustom = typeof req.body.id === 'string'
    const id = typeof req.body.id === 'string' ? req.body.id : generateRandomId()

    await db.insertUrl({ id, isCustom, originalUrl: req.body.originalUrl })

    res.status(201).send({
      code: 'success',
      originalUrl: req.body.originalUrl,
      shortenedUrl: `http://localhost:8000/${id}`
    })
  } catch (e) {
    res.status(500).send({
      code: 'fail',
      error: { message: e instanceof Error ? e.message : 'unhandled-exception' }
    })
  }
})

interface AccessShortUrlRequestPathParameter {
  id: string
}

interface FailAccessShortUrlRequestPathParameter {
  code: 'fail'
  error: { message: string }
}

app.get('/:id', async (
  req: Request<AccessShortUrlRequestPathParameter, FailAccessShortUrlRequestPathParameter, never>, 
  res: Response<FailAccessShortUrlRequestPathParameter>
) => {
  // const id = req.params.id
  const { id } = req.params // --> it's called "destructuring pattern"
  
  const url = await db.getUrl(id)

  if ( url === null){
    res.status(404).send({
      code: 'fail',
      error: { message: 'not-found' }
    })
    return
  } 
  
  await db.incrementUrlVisitCount(id)

  res.status(303).header('Location', url.originalUrl).send()
})

interface GetShortUrlStatisticsRequestPathParameters {
  id: string
}

interface SuccessGetShortUrlStatisticsResponseBody {
  code: 'success'
  data: {
    createdAt: string
    isCustom: boolean
    originalUrl: string
    shortUrl: string
    visitCount: number
  }
}

interface FailGetShortUrlStatisticsResponseBody {
  code: 'fail'
  error: { message: string }
}

type GetShortUrlStatisticsResponseBody = SuccessGetShortUrlStatisticsResponseBody | FailGetShortUrlStatisticsResponseBody

app.get('/:id/stats', async (
  req: Request<GetShortUrlStatisticsRequestPathParameters, GetShortUrlStatisticsResponseBody, never>, 
  res: Response<GetShortUrlStatisticsResponseBody>
  ) => {
  const { id } = req.params

  const url = await db.getUrl(id)

  if ( url === null){
    res.status(404).send({
      code: 'fail',
      error: { message: 'not-found' }
    })
    return
  } 

  res.status(200).send({
    code: 'success',
    data: {
      createdAt: url.createdAt.toString(),
      isCustom: url.isCustom,
      originalUrl: url.originalUrl,
      shortUrl: `http://localhost:8000/${id}`,
      visitCount: url.visitCount,
    }
  })
  }
)


// * NOTES
// The get method not intent to read the body
// Request<
//    the parsing result of the path parameter and the type is always string, 
//    Response Body, 
//    Request Body,
//    the parsing result of the query parameter ("?") and it can be string or string array,
//    locales or languages>
// Response<
//    Response Body,
//    locales >
// never --> never caught any type
// any --> caught every type

app.listen(8000) 
