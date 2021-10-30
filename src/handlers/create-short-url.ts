import { Request, Response } from "express";
import { ValidationError } from "sequelize";
import {
  SuccessResponseBody,
  FailResponseBody,
  ShortUrlResponseData,
} from "../dto/response";
import { generateRandomId, validateCustomId } from "../helpers/id";
import { getShortenedUrlFromId } from "../helpers/url";
import { DatabaseService } from "../services/database";

interface CreateShortUrlRequestBody {
  id?: string;
  originalUrl: string;
}

type CreateShortUrlResponseBody =
  | SuccessResponseBody<ShortUrlResponseData>
  | FailResponseBody;

// NOTES: Parameters of Request<> and Response<>
// The get method intent to not read the body
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

export default async function createShortUrlHandler(
  req: Request<
    Record<never, never>,
    CreateShortUrlResponseBody,
    CreateShortUrlRequestBody
  >,
  res: Response<CreateShortUrlResponseBody>
) {
  if (typeof req.body.originalUrl !== "string") {
    res.status(400).send({
      code: "fail",
      error: { message: "invalid-original-url" },
    });
    return;
  }

  if (typeof req.body.id === "string") {
    if (req.body.id.length < 5) {
      res.status(400).send({
        code: "fail",
        error: { message: "id-is-too-short" },
      });
      return;
    } else if (req.body.id.length > 128) {
      res.status(400).send({
        code: "fail",
        error: { message: "id-is-too-long" },
      });
      return;
    } else if (!validateCustomId(req.body.id)) {
      res.status(400).send({
        code: "fail",
        error: { message: "id-must-be-alphanumeric" },
      });
      return;
    }
  }

  try {
    const isCustom = typeof req.body.id === "string";
    const id =
      typeof req.body.id === "string" ? req.body.id : generateRandomId();

    await DatabaseService.instance.insertUrl({
      id,
      isCustom,
      originalUrl: req.body.originalUrl,
    });

    res.status(201).send({
      code: "success",
      data: {
        originalUrl: req.body.originalUrl,
        shortenedUrl: getShortenedUrlFromId(id),
      },
    });
    return;
  } catch (e) {
    if (
      e instanceof ValidationError &&
      e.errors[0].message === "id must be unique"
    ) {
      res.status(409).send({
        code: "fail",
        error: { message: "id-reserved" },
      });
      return;
    }

    res.status(500).send({
      code: "fail",
      error: {
        message: e instanceof Error ? e.message : "unhandled-exception",
      },
    });
    return;
  }
}
