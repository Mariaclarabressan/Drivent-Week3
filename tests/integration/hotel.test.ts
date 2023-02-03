import app, { init } from "@/app";
import faker from "@faker-js/faker";
import { createHotel, createRoom } from "../factories/hotel-factory";
import { createTicket, createUser, createTicketType, createEnrollmentWithAddress, createTicketValue } from "../factories";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import httpStatus from "http-status";
import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";


beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and list all hotels", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketValue(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);

      expect(response.body).toEqual([
        {
          id:hotel.id,
          name:hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString()
        },
      ]);
    });
    
    it("should respond with status 402 when user doesnt have a paid ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketValue(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);      

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    
    it("should respond with status 404 when ticket is remote ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketValue(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 401 when user have a paid ticket, but does not includes Hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketValue(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("shoul respond with [] if any hotel was found ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketValue(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual([]);
    });

  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/:hotelId");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when ticket is remote ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketValue(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      

      const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 401 when user have a paid ticket, but does not includes Hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketValue(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      

      const response = await server.get("/hotels/:hotelId").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 200 and list all rooms in the hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketValue(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const rooms = await createRoom(hotel.id)

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);

      expect(response.body).toEqual([
        {
          id:hotel.id,
          name:hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: [{
            id: rooms.id,
            name: rooms.name,
            capacity: rooms.capacity,
            hotelId: rooms.hotelId,
            createdAt: rooms.createdAt.toISOString(),
            updatedAt: rooms.updatedAt.toISOString()
          }]
        },
      ]);
    });
    it("shoul respond with [] if any room was found ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketValue(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual([{
        id:hotel.id,
          name:hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: []
      }]);
    });
  })
})
