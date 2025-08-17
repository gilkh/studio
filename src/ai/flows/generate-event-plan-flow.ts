'use server';
/**
 * @fileOverview An AI flow for generating a customized event plan timeline.
 *
 * - generateEventPlan - A function that takes event details and returns a structured task list.
 * - GenerateEventPlanInput - The input type for the generateEventPlan function.
 * - EventTask - The structure for an individual task in the generated plan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { GenerateEventPlanInput, EventTask } from '@/lib/types';

// We re-define schemas here for the AI flow, but they are based on the main types.
const GenerateEventPlanInputSchema = z.object({
  eventType: z.string().describe('The type of event being planned (e.g., Wedding, Corporate Conference).'),
  eventDate: z.string().describe('The date of the event in YYYY-MM-DD format.'),
  location: z.string().describe('The city or general location of the event.'),
  guestCount: z.coerce.number().describe('The estimated number of guests attending.'),
  budget: z.coerce.number().describe('The total estimated budget for the event in USD.'),
});

const EventTaskSchema = z.object({
    id: z.string().describe("A unique identifier for the task, like 'task-1'."),
    task: z.string().describe('A clear, actionable description of the task.'),
    deadline: z.string().describe('The suggested completion date for the task in YYYY-MM-DD format, calculated relative to the event date.'),
    estimatedCost: z.coerce.number().describe('A rough estimate of the cost for this task in USD.'),
    completed: z.boolean().describe('The completion status of the task, which should always be `false` initially.'),
    suggestedVendorCategory: z.string().optional().describe("If this task requires a specific type of vendor (e.g., 'Catering', 'Photography'), specify the category here. This is used to suggest vendors to the user."),
});

const EventPlanOutputSchema = z.object({
  tasks: z.array(EventTaskSchema).describe('The generated list of event tasks, sorted chronologically by deadline.'),
});

// This is the main exported function that the UI will call.
export async function generateEventPlan(input: GenerateEventPlanInput): Promise<{ tasks: EventTask[] }> {
  return generateEventPlanFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateEventPlanPrompt',
  input: { schema: GenerateEventPlanInputSchema },
  output: { schema: EventPlanOutputSchema },
  prompt: `You are an expert event planner. Your goal is to generate a comprehensive and actionable timeline of tasks for planning an event based on the user's specifications.

The event details are:
- Event Type: {{{eventType}}}
- Date: {{{eventDate}}}
- Location: {{{location}}}
- Guests: {{{guestCount}}}
- Budget: \${{{budget}}}

Generate a list of tasks. For each task, provide a clear description, a deadline calculated by working backwards from the event date, an estimated cost, and an initial completion status of 'false'.

Crucially, for tasks that require hiring a professional, you MUST include a 'suggestedVendorCategory'. The valid categories are: "Catering", "Photography", "Decor & Floral", "Music & Entertainment", and "Venue".

For example, for a task like "Book a photographer", you must set suggestedVendorCategory to "Photography". For "Hire a caterer", set it to "Catering". Only use these specific categories.

Return the tasks as a sorted list, with the earliest deadlines first.
`,
});

const generateEventPlanFlow = ai.defineFlow(
  {
    name: 'generateEventPlanFlow',
    inputSchema: GenerateEventPlanInputSchema,
    outputSchema: EventPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    // The output from the prompt is already structured according to our Zod schema.
    // We just need to return it. If output is null, return an empty task list.
    return output ?? { tasks: [] };
  }
);
