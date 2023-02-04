import hotelRepository from "@/repositories/hotel-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { notFoundError, conflictError, unauthorizedError } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";

import ticketService from "../tickets-service";
import { userInfo } from "os";

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  
  if (!enrollment) {
    throw unauthorizedError();  }

  const userTicked = await ticketService.getTicketByUserId(userId);  
  
 
  if(!userTicked) { 
    throw notFoundError();
  }

  if(!userTicked.TicketType.includesHotel) throw notFoundError();
    
  if(userTicked.status === "RESERVED") throw conflictError("Paid firts engraçadinho!"); 
    
  if(userTicked.TicketType.isRemote) throw conflictError("Ta em casa");



  const hotels = await hotelRepository.findHotels();
  
  
  return hotels;
  
}

async function getRoomByHotelId(hotelId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    console.log("entrou 6")
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    console.log("entrou 1")
    throw notFoundError();
    
  }
  if (ticket.TicketType.isRemote !== false) {
    console.log("entrou 2")
    throw unauthorizedError();
  }
  if (ticket.TicketType.includesHotel !== true) {
    console.log("entrou 3")
    throw unauthorizedError();
  }
  const ticketType = await ticketRepository.findTicketTypes();
  if (!ticketType) {
    console.log("entrou 4")
    throw unauthorizedError();
  }
  if (ticket.status !== "PAID") {
    console.log("entrou 5")
    throw unauthorizedError();
  }

  const room = await hotelRepository.findRoomById(hotelId);

  if(!room) {
    throw notFoundError();
  }

  console.log(room)

  return room;
}

const hotelService = {
  getHotels,
  getRoomByHotelId
};

export default hotelService;
