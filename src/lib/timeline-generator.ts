
import { add, format, sub } from 'date-fns';
import type { EventTask, GenerateEventPlanInput } from './types';

// Helper to create a deadline by subtracting a duration from the event date
const createDeadline = (eventDate: Date, duration: Duration) => {
  return format(sub(eventDate, duration), 'yyyy-MM-dd');
};

// Base tasks that are common to most events
const baseTasks = (eventDate: Date, budget: number, guestCount: number) => [
  {
    task: 'Define event goals and objectives',
    deadline: createDeadline(eventDate, { months: 6 }),
    estimatedCost: 0,
  },
  {
    task: 'Set a budget',
    deadline: createDeadline(eventDate, { months: 6 }),
    estimatedCost: 0,
  },
  {
    task: 'Select a date and time',
    deadline: createDeadline(eventDate, { months: 6 }),
    estimatedCost: 0,
  },
  {
    task: 'Create a guest list',
    deadline: createDeadline(eventDate, { months: 5 }),
    estimatedCost: 0,
  },
  {
    task: 'Research and book a venue',
    deadline: createDeadline(eventDate, { months: 5 }),
    estimatedCost: budget * 0.3, // 30% of budget
  },
  {
    task: 'Hire a caterer',
    deadline: createDeadline(eventDate, { months: 4 }),
    estimatedCost: budget * 0.25, // 25% of budget
  },
  {
    task: 'Send out invitations',
    deadline: createDeadline(eventDate, { months: 2 }),
    estimatedCost: guestCount * 5, // $5 per guest for invites
  },
  {
    task: 'Plan the menu and arrange for tastings',
    deadline: createDeadline(eventDate, { months: 2 }),
    estimatedCost: 0, // Included in catering cost
  },
  {
    task: 'Arrange transportation and accommodation if needed',
    deadline: createDeadline(eventDate, { months: 2 }),
    estimatedCost: budget * 0.05,
  },
  {
    task: 'Finalize the guest list based on RSVPs',
    deadline: createDeadline(eventDate, { weeks: 3 }),
    estimatedCost: 0,
  },
  {
    task: 'Create a seating chart',
    deadline: createDeadline(eventDate, { weeks: 2 }),
    estimatedCost: 0,
  },
  {
    task: 'Confirm details with all vendors',
    deadline: createDeadline(eventDate, { weeks: 1 }),
    estimatedCost: 0,
  },
  {
    task: 'Create a day-of timeline for the event',
    deadline: createDeadline(eventDate, { days: 5 }),
    estimatedCost: 0,
  },
  {
    task: 'Send final payment to vendors',
    deadline: createDeadline(eventDate, { days: 3 }),
    estimatedCost: budget * 0.4, // Remaining vendor costs
  },
  {
    task: 'Send thank-you notes to guests and vendors',
    deadline: format(add(eventDate, { weeks: 2 }), 'yyyy-MM-dd'),
    estimatedCost: guestCount * 3,
  },
];

// Specific tasks for a 'Wedding'
const weddingTasks = (eventDate: Date, budget: number, guestCount: number) => [
  {
    task: 'Book a photographer/videographer',
    deadline: createDeadline(eventDate, { months: 5 }),
    estimatedCost: budget * 0.1,
  },
  {
    task: 'Shop for wedding attire',
    deadline: createDeadline(eventDate, { months: 4 }),
    estimatedCost: budget * 0.08,
  },
  {
    task: 'Book entertainment (DJ or band)',
    deadline: createDeadline(eventDate, { months: 3 }),
    estimatedCost: budget * 0.07,
  },
  {
    task: 'Arrange for floral and decor',
    deadline: createDeadline(eventDate, { months: 3 }),
    estimatedCost: budget * 0.1,
  },
  {
    task: 'Obtain marriage license',
    deadline: createDeadline(eventDate, { weeks: 3 }),
    estimatedCost: 50,
  },
];

// Specific tasks for a 'Corporate' event
const corporateTasks = (eventDate: Date, budget: number, guestCount: number) => [
  {
    task: 'Define agenda and content',
    deadline: createDeadline(eventDate, { months: 4 }),
    estimatedCost: 0,
  },
  {
    task: 'Arrange for speakers or presenters',
    deadline: createDeadline(eventDate, { months: 3 }),
    estimatedCost: budget * 0.15,
  },
  {
    task: 'Set up event registration page',
    deadline: createDeadline(eventDate, { months: 3 }),
    estimatedCost: 200,
  },
  {
    task: 'Organize A/V equipment and support',
    deadline: createDeadline(eventDate, { months: 1 }),
    estimatedCost: budget * 0.05,
  },
];

export const generateTimeline = (input: GenerateEventPlanInput) => {
  const { eventType, eventDate, budget, guestCount } = input;
  const date = new Date(eventDate);

  let tasks: Omit<EventTask, 'id' | 'completed'>[] = baseTasks(date, budget, guestCount);

  // Add tasks based on event type
  if (eventType.toLowerCase().includes('wedding')) {
    tasks = [...tasks, ...weddingTasks(date, budget, guestCount)];
  } else if (eventType.toLowerCase().includes('corporate') || eventType.toLowerCase().includes('conference')) {
    tasks = [...tasks, ...corporateTasks(date, budget, guestCount)];
  }

  // Sort tasks by deadline and add unique IDs
  const sortedTasks = tasks
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .map((task, index) => ({
      ...task,
      id: `task-${index + 1}`,
      completed: false,
    }));

  return { tasks: sortedTasks };
};
