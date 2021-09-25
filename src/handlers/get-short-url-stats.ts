import { Request, Response } from "express"
import { BaseSuccessResponseBody, FailResponseBody, StatisticsResponseData } from "../dto/response"
import { getShortenedUrlFromId } from "../helpers/url"
import { DatabaseService } from "../services/database"

interface GetShortUrlStatisticsRequestPathParameters {
    id: string
  }
  
  type GetShortUrlStatisticsResponseBody = BaseSuccessResponseBody<StatisticsResponseData> | FailResponseBody
  

export default async function getShortUrlStatsHandler (
    req: Request<GetShortUrlStatisticsRequestPathParameters, GetShortUrlStatisticsResponseBody, never>, 
    res: Response<GetShortUrlStatisticsResponseBody>
    ) {
    const { id } = req.params
  
    const url = await DatabaseService.instance.getUrl(id)
  
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
        shortenedUrl: getShortenedUrlFromId(id),
        visitCount: url.visitCount,
      }
    })
    }