
import { add, format, sub } from 'date-fns';
import type { EventTask, GenerateEventPlanInput } from './types';

export const eventTypes = [
    'Wedding', 'Engagement', 'Anniversary',
    'Birthday', 'Graduation', 'Newborn Welcoming',
    'Family Reunion', 'New Year\'s Celebration', 'Christmas',
    'Eid al-Fitr', 'Eid al-Adha', 'Easter',
    'Mother’s Day', 'Father’s Day', 'Corporate Conference', 'Product Launch'
];


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
    suggestedVendorCategory: 'Venue',
  },
  {
    task: 'Hire a caterer',
    deadline: createDeadline(eventDate, { months: 4 }),
    estimatedCost: budget * 0.25, // 25% of budget
    suggestedVendorCategory: 'Catering',
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
const weddingTasks = (eventDate: Date, budget: number, guestCount: number, answers: Record<string, any>) => {
    const tasks = [];
    if(answers['Photography/Videography Services']) {
         tasks.push({
            task: 'Book a photographer/videographer',
            deadline: createDeadline(eventDate, { months: 5 }),
            estimatedCost: budget * 0.1,
            suggestedVendorCategory: 'Photography',
        });
    }
     if(answers['Live Band or DJ']) {
        tasks.push({
            task: 'Book entertainment (DJ or band)',
            deadline: createDeadline(eventDate, { months: 3 }),
            estimatedCost: budget * 0.07,
            suggestedVendorCategory: 'Music & Entertainment',
        });
    }
     if(answers['Floral Arrangements and Decor']) {
        tasks.push({
            task: 'Arrange for floral and decor',
            deadline: createDeadline(eventDate, { months: 3 }),
            estimatedCost: budget * 0.1,
            suggestedVendorCategory: 'Decor & Floral',
        });
    }
    tasks.push({
        task: 'Shop for wedding attire',
        deadline: createDeadline(eventDate, { months: 4 }),
        estimatedCost: budget * 0.08,
    });
    tasks.push({
        task: 'Obtain marriage license',
        deadline: createDeadline(eventDate, { weeks: 3 }),
        estimatedCost: 50,
    });
    return tasks;
};

// Specific tasks for a 'Corporate' event
const corporateTasks = (eventDate: Date, budget: number, guestCount: number, answers: Record<string, any>) => {
    const tasks = [];
    if(answers['Keynote Speakers']) {
        tasks.push({
            task: 'Arrange for speakers or presenters',
            deadline: createDeadline(eventDate, { months: 3 }),
            estimatedCost: budget * 0.15,
        });
    }
     if(answers['Audio/Visual Equipment']) {
        tasks.push({
            task: 'Organize A/V equipment and support',
            deadline: createDeadline(eventDate, { months: 1 }),
            estimatedCost: budget * 0.05,
            suggestedVendorCategory: 'Music & Entertainment',
        });
    }
    tasks.push({
        task: 'Define agenda and content',
        deadline: createDeadline(eventDate, { months: 4 }),
        estimatedCost: 0,
    });
    tasks.push({
        task: 'Set up event registration page',
        deadline: createDeadline(eventDate, { months: 3 }),
        estimatedCost: 200,
    });
    return tasks;
};

const birthdayTasks = (eventDate: Date, budget: number, guestCount: number, answers: Record<string, any>) => {
    const tasks = [];
    if (answers['Birthday Cake']) {
         tasks.push({
            task: 'Order a custom birthday cake',
            deadline: createDeadline(eventDate, { weeks: 2 }),
            estimatedCost: budget * 0.05,
            suggestedVendorCategory: 'Catering & Sweets',
        });
    }
    if(answers['Themed Decorations']) {
        tasks.push({
            task: 'Purchase themed decorations and party supplies',
            deadline: createDeadline(eventDate, { weeks: 1 }),
            estimatedCost: budget * 0.1,
            suggestedVendorCategory: 'Decoration',
        });
    }
    if(answers['Entertainment (e.g., clown, magician)']) {
         tasks.push({
            task: 'Book entertainment (magician, clown, etc.)',
            deadline: createDeadline(eventDate, { months: 1 }),
            estimatedCost: budget * 0.15,
            suggestedVendorCategory: 'Entertainment',
        });
    }
    return tasks;
}


const questionMap: Record<string, { id: string, question: string, options: string[] }[]> = {
    'Wedding': [
        { id: 'q1', question: 'What services are you looking for?', options: ['Photography/Videography Services', 'Live Band or DJ', 'Floral Arrangements and Decor'] },
    ],
    'Corporate Conference': [
        { id: 'q1', question: 'What will your conference include?', options: ['Keynote Speakers', 'Breakout Sessions', 'Catering Services', 'Audio/Visual Equipment'] },
    ],
     'Birthday': [
        { id: 'q1', question: 'What are the essentials for this birthday party?', options: ['Birthday Cake', 'Themed Decorations', 'Entertainment (e.g., clown, magician)'] },
    ],
    // Add other event types here
}

export function getQuestionsForEventType(eventType: string) {
    for (const key in questionMap) {
        if (eventType.toLowerCase().includes(key.toLowerCase())) {
            return questionMap[key];
        }
    }
    return [];
}


export const generateTimeline = (input: GenerateEventPlanInput) => {
  const { eventType, eventDate, budget, guestCount, answers } = input;
  const date = new Date(eventDate);

  let tasks: Omit<EventTask, 'id' | 'completed'>[] = baseTasks(date, budget, guestCount);

  // Add tasks based on event type
  if (eventType.toLowerCase().includes('wedding')) {
    tasks = [...tasks, ...weddingTasks(date, budget, guestCount, answers)];
  } else if (eventType.toLowerCase().includes('corporate') || eventType.toLowerCase().includes('conference')) {
    tasks = [...tasks, ...corporateTasks(date, budget, guestCount, answers)];
  } else if (eventType.toLowerCase().includes('birthday')) {
    tasks = [...tasks, ...birthdayTasks(date, budget, guestCount, answers)];
  }

  // Sort tasks by deadline and add unique IDs
  const sortedTasks = tasks
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .map((task, index) => ({
      ...task,
      id: `task-${Date.now()}-${index}`,
      completed: false,
    }));

  return { tasks: sortedTasks };
};
