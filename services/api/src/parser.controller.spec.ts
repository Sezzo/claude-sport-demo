import { Test, TestingModule } from '@nestjs/testing';
import { ParserController } from './parser.controller';
import { PrismaService } from './prisma.service';

describe('ParserController', () => {
  let controller: ParserController;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    videoCue: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParserController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<ParserController>(ParserController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('parseDescription', () => {
    it('should parse emoji color codes', async () => {
      const description = `
0:00 ⚪ White warm-up
5:00 🔵 Blue easy pace
10:00 🟢 Green tempo
`;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          videoCue: {
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        });
      });

      const result = await controller.parse({
        videoId: 'test123',
        description,
        duration: 1800,
      });

      expect(result.cues).toHaveLength(3);
      expect(result.cues[0].zoneCode).toBe('white');
      expect(result.cues[0].startS).toBe(0);
      expect(result.cues[1].zoneCode).toBe('blue');
      expect(result.cues[1].startS).toBe(300);
      expect(result.cues[2].zoneCode).toBe('green');
      expect(result.cues[2].startS).toBe(600);
    });

    it('should parse text color codes', async () => {
      const description = `
0:00 white Warm-up
5:00 blue Easy
10:00 green Tempo
`;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          videoCue: {
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        });
      });

      const result = await controller.parse({
        videoId: 'test123',
        description,
        duration: 1800,
      });

      expect(result.cues).toHaveLength(3);
      expect(result.cues[0].zoneCode).toBe('white');
      expect(result.cues[1].zoneCode).toBe('blue');
      expect(result.cues[2].zoneCode).toBe('green');
    });

    it('should auto-calculate end times', async () => {
      const description = `
0:00 ⚪ White
5:00 🔵 Blue
10:00 🟢 Green
`;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          videoCue: {
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        });
      });

      const result = await controller.parse({
        videoId: 'test123',
        description,
        duration: 1800,
      });

      expect(result.cues[0].endS).toBe(300); // Until next segment
      expect(result.cues[1].endS).toBe(600); // Until next segment
      expect(result.cues[2].endS).toBe(1800); // Until video end
    });

    it('should handle MM:SS and HH:MM:SS formats', async () => {
      const description = `
0:00 ⚪ White
1:30 🔵 Blue
1:00:00 🟢 Green
`;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          videoCue: {
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        });
      });

      const result = await controller.parse({
        videoId: 'test123',
        description,
        duration: 7200,
      });

      expect(result.cues[0].startS).toBe(0);
      expect(result.cues[1].startS).toBe(90); // 1:30
      expect(result.cues[2].startS).toBe(3600); // 1:00:00
    });

    it('should sort cues by start time', async () => {
      const description = `
10:00 🟢 Green
0:00 ⚪ White
5:00 🔵 Blue
`;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          videoCue: {
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        });
      });

      const result = await controller.parse({
        videoId: 'test123',
        description,
        duration: 1800,
      });

      expect(result.cues[0].startS).toBe(0);
      expect(result.cues[1].startS).toBe(300);
      expect(result.cues[2].startS).toBe(600);
    });

    it('should extract labels', async () => {
      const description = `
0:00 ⚪ White warm-up stretch
5:00 🔵 Blue easy pace building
`;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          videoCue: {
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        });
      });

      const result = await controller.parse({
        videoId: 'test123',
        description,
        duration: 1800,
      });

      expect(result.cues[0].label).toContain('warm-up');
      expect(result.cues[1].label).toContain('easy pace');
    });

    it('should return zone definitions', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          videoCue: {
            deleteMany: jest.fn(),
            create: jest.fn(),
          },
        });
      });

      const result = await controller.parse({
        videoId: 'test123',
        description: '0:00 ⚪ White',
        duration: 1800,
      });

      expect(result.zones).toBeDefined();
      expect(result.zones.white).toEqual([0, 50]);
      expect(result.zones.grey).toEqual([50, 59]);
      expect(result.zones.blue).toEqual([60, 69]);
      expect(result.zones.green).toEqual([70, 79]);
      expect(result.zones.yellow).toEqual([80, 89]);
      expect(result.zones.red).toEqual([90, 100]);
    });
  });
});
