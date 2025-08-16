
'use server';
/**
 * @fileOverview An AI flow to generate a detailed event plan.
 *
 * - generateEventPlan - A function that creates an event plan based on user inputs.
 * - GenerateEventPlanInput - The input type for the generateEventPlan function.
 * - GenerateEventPlanOutput - The return type for the generateEventPlan function.
 * - EventTask - The schema for an individual task within the event plan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const GenerateEventPlanInputSchema = z.object({
  eventType: z.string().describe('The type of event being planned (e.g., Wedding, Corporate Conference).'),
  eventDate: z.string().describe('The date of the event in YYYY-MM-DD format.'),
  location: z.string().describe('The city or general location of the event.'),
  guestCount: z.number().describe('The estimated number of guests attending.'),
  budget: z.number().describe('The total estimated budget for the event in USD.'),
});
export type GenerateEventPlanInput = z.infer<typeof GenerateEventPlanInputSchema>;

export const EventTaskSchema = z.object({
    id: z.string().describe("A unique identifier for the task, e.g., 'task-1'."),
    task: z.string().describe('A clear and concise description of the task to be completed.'),
    deadline: z.string().describe("The suggested completion date for the task in 'YYYY-MM-DD' format, relative to the main event date."),
    priority: z.enum(['High', 'Medium', 'Low']).describe('The priority level of the task.'),
    estimatedCost: z.number().describe('A rough estimate of the cost associated with this task in USD.'),
    completed: z.boolean().describe('Whether the task is completed. Always false initially.')
});
export type EventTask = z.infer<typeof EventTaskSchema>;

export const GenerateEventPlanOutputSchema = z.object({
  tasks: z.array(EventTaskSchema).describe('A chronological list of tasks to be completed for the event planning.'),
});
export type GenerateEventPlanOutput = z.infer<typeof GenerateEventPlanOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateEventPlanPrompt',
  input: { schema: GenerateEventPlanInputSchema },
  output: { schema: GenerateEventPlanOutputSchema },
  prompt: `You are an expert event planner. A user has provided details for an upcoming event. Your goal is to generate a detailed, chronological timeline of tasks.

The tasks should be logical and cover all major aspects of planning this type of event, from initial concept to post-event wrap-up.
Derive sensible deadlines for each task based on the provided event date. For example, booking a venue should be done many months in advance, while confirming final guest counts is closer to the date.
Assign a priority and an estimated cost for each task, considering the overall budget and event type.

Event Details:
- Event Type: {{eventType}}
- Event Date: {{eventDate}}
- Location: {{location}}
- Guest Count: {{guestCount}}
- Budget: \${{budget}}

Generate a comprehensive list of tasks. Ensure each task has a unique ID, a clear description, a calculated deadline, a priority, an estimated cost, and its completed status is set to false.
The list should be ordered chronologically from the task that should be done first to the last.
`,
});

const generateEventPlanFlow = ai.defineFlow(
  {
    name: 'generateEventPlanFlow',
    inputSchema: GenerateEventPlanInputSchema,
    outputSchema: GenerateEventPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a plan.');
    }
    // Ensure tasks are sorted chronologically by deadline
    const sortedTasks = output.tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    return { tasks: sortedTasks };
  }
);


export async function generateEventPlan(input: GenerateEventPlanInput): Promise<GenerateEventPlanOutput> {
    return generateEventPlanFlow(input);
}
