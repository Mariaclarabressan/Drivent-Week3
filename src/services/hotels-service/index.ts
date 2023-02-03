import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { notFoundError, conflictError, unauthorizedError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";

import ticketService from "../tickets-service";

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    throw unauthorizedError();  }

  const userTicked = await ticketService.getTicketByUserId(enrollment.id);  

  if(!userTicked) { //1
    throw notFoundError();
  }

  if(!userTicked.TicketType.includesHotel) throw notFoundError();
    
  if(userTicked.status === "RESERVED") throw conflictError("Paid firts engraçadinho! "); 
    
  if(userTicked.TicketType.isRemote) throw conflictError("Tá em casa!");

  const hotels = await hotelRepository.findHotels();
  return hotels;
}

async function getRoomByHotelId(hotelId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError;
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw notFoundError;
  }
  if (ticket.TicketType.isRemote !== false) {
    throw unauthorizedError;
  }
  if (ticket.TicketType.includesHotel !== true) {
    throw unauthorizedError;
  }
  const ticketType = await ticketRepository.findTicketTypes;
  if (!ticketType) {
    throw unauthorizedError;
  }
  if (ticket.status !== "PAID") {
    throw unauthorizedError;
  }

  const room = await hotelRepository.findRoomById(hotelId);

  if(!room) {
    throw notFoundError();
  }

  return room;
}

const hotelService = {
  getHotels,
  getRoomByHotelId
};

export default hotelService;
