import { prisma } from "@/config";

async function enrollmentUser(userId: number) {
  return prisma.enrollment.findFirst({
    where: {
      userId,
    }
  });
}

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findHotelById(hotelId: number) {
  return prisma.hotel.findFirst({
    where: { id: hotelId }
  });
}

async function findRoomById(hotelId: number) {
  return prisma.hotel.findFirst({
    where: { id: hotelId },
    include: {
      Rooms: true
    }
  });
}

const hotelRepository = {
  enrollmentUser,
  findHotelById,
  findHotels,
  findRoomById
};

export default hotelRepository;
