import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { Task } from './task.entity';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let tasksService: TasksService;
  let mockRepository: Partial<Repository<Task>>;

  const mockUser: User = {
    id: '1',
    username: 'TestUser',
    password: 'password',
    tasks: [],
  } as User;

  const mockTask = { id: '1', title: 'Test Task', description: 'Test Desc' };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockTask]),
  } as unknown as SelectQueryBuilder<Task>;

  beforeEach(async () => {
    mockRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
  });

  describe('getTasks', () => {
    it('calls getTasks and returns tasks', async () => {
      const mockFilter: GetTasksFilterDto = {
        search: 'Test',
        status: TaskStatus.OPEN,
      };

      const result = await tasksService.getTasks(mockFilter, mockUser);

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith({ user: mockUser });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual([mockTask]);
    });
  });
});
