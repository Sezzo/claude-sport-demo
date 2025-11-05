import { Test, TestingModule } from '@nestjs/testing';
import { SessionsController } from './sessions.controller';
import { PrismaService } from './prisma.service';

describe('SessionsController', () => {
  let controller: SessionsController;
  let prismaService: PrismaService;

  const mockPrismaService = {
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    sessionMember: {
      create: jest.fn(),
    },
    videoCue: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new session', async () => {
      const mockSession = {
        id: 'session-123',
        youtubeVideoId: 'dQw4w9WgXcQ',
        title: 'Test Session',
        hostUserId: 'user-123',
        status: 'waiting',
        createdAt: new Date(),
      };

      mockPrismaService.session.create.mockResolvedValue(mockSession);

      const result = await controller.create({
        youtubeVideoId: 'dQw4w9WgXcQ',
        title: 'Test Session',
      });

      expect(result).toEqual(mockSession);
      expect(mockPrismaService.session.create).toHaveBeenCalledWith({
        data: {
          youtubeVideoId: 'dQw4w9WgXcQ',
          title: 'Test Session',
        },
      });
    });

    it('should create session without title', async () => {
      const mockSession = {
        id: 'session-123',
        youtubeVideoId: 'dQw4w9WgXcQ',
        title: null,
        hostUserId: 'user-123',
        status: 'waiting',
        createdAt: new Date(),
      };

      mockPrismaService.session.create.mockResolvedValue(mockSession);

      const result = await controller.create({
        youtubeVideoId: 'dQw4w9WgXcQ',
      });

      expect(result.title).toBeNull();
    });
  });

  describe('join', () => {
    it('should join a session', async () => {
      mockPrismaService.sessionMember.create.mockResolvedValue({
        sessionId: 'session-123',
        userId: 'user-456',
        role: 'participant',
        joinedAt: new Date(),
      });

      const result = await controller.join('session-123', {
        userId: 'user-456',
      });

      expect(result).toEqual({ ok: true });
      expect(mockPrismaService.sessionMember.create).toHaveBeenCalledWith({
        data: {
          sessionId: 'session-123',
          userId: 'user-456',
          role: 'participant',
        },
      });
    });

    it('should join as host with role', async () => {
      mockPrismaService.sessionMember.create.mockResolvedValue({
        sessionId: 'session-123',
        userId: 'user-456',
        role: 'host',
        joinedAt: new Date(),
      });

      await controller.join('session-123', {
        userId: 'user-456',
        role: 'host',
      });

      expect(mockPrismaService.sessionMember.create).toHaveBeenCalledWith({
        data: {
          sessionId: 'session-123',
          userId: 'user-456',
          role: 'host',
        },
      });
    });
  });

  describe('get', () => {
    it('should get session with members', async () => {
      const mockSession = {
        id: 'session-123',
        youtubeVideoId: 'dQw4w9WgXcQ',
        title: 'Test Session',
        hostUserId: 'user-123',
        status: 'active',
        createdAt: new Date(),
        members: [
          {
            userId: 'user-123',
            role: 'host',
            joinedAt: new Date(),
          },
          {
            userId: 'user-456',
            role: 'participant',
            joinedAt: new Date(),
          },
        ],
      };

      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);

      const result = await controller.get('session-123');

      expect(result).toEqual(mockSession);
      expect(mockPrismaService.session.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        include: { members: true },
      });
    });
  });

  describe('cues', () => {
    it('should get cues for session', async () => {
      const mockSession = {
        id: 'session-123',
        youtubeVideoId: 'dQw4w9WgXcQ',
      };

      const mockCues = [
        {
          id: 'cue-1',
          youtubeVideoId: 'dQw4w9WgXcQ',
          segmentIndex: 0,
          startS: 0,
          endS: 300,
          zoneCode: 'white',
          label: 'Warm-up',
        },
        {
          id: 'cue-2',
          youtubeVideoId: 'dQw4w9WgXcQ',
          segmentIndex: 1,
          startS: 300,
          endS: 600,
          zoneCode: 'blue',
          label: 'Easy pace',
        },
      ];

      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.videoCue.findMany.mockResolvedValue(mockCues);

      const result = await controller.cues('session-123');

      expect(result).toEqual(mockCues);
      expect(mockPrismaService.videoCue.findMany).toHaveBeenCalledWith({
        where: { youtubeVideoId: 'dQw4w9WgXcQ' },
        orderBy: { startS: 'asc' },
      });
    });

    it('should return empty array if session not found', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      const result = await controller.cues('nonexistent');

      expect(result).toEqual([]);
    });
  });
});
