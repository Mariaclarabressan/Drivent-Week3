import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";

import hotelService from "@/services/hotels-service";
import ticketService from "@/services/tickets-service";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const hotels = await hotelService.getHotels(userId);

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if(error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if(error.message === "Paid firts engraçadinho!"){
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if(error.message === "Ta em casa"){
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
  }
}

export async function getRooms(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotelId  = req.params.hotelId;

  try {
    const userRoom = await hotelService.getRoomByHotelId(Number(hotelId), Number(userId));

    return res.status(httpStatus.OK).send(userRoom);
  } catch (error) {
    if (error.name === "notFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "unauthorizedError") {
      return res.sendStatus(httpStatus.UNAUTHORIZED);
    }

    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
