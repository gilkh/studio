
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader, PlusCircle, Trash2, Edit, Save, ArrowUp, ArrowDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import type { EventTask, GenerateEventPlanInput } from '@/lib/types';
import { generateTimeline } from '@/lib/timeline-generator';

const formSchema = z.object({
  eventType: z.string().min(3, 'Event type is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  location: z.string().min(3, 'Location is required'),
  guestCount: z.coerce.number().min(1, 'Guest count must be at least 1'),
  budget: z.coerce.number().min(1, 'Budget is required'),
});

export default function EventPlannerPage() {
  const [timeline, setTimeline] = useState<EventTask[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eventName, setEventName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskLabel, setEditedTaskLabel] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: '',
      eventDate: '',
      location: '',
      guestCount: 100,
      budget: 5000,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTimeline(null);
    setEventName(`${values.eventType} in ${values.location}`);
    
    // Simulate a short delay for a better user experience
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const plan = generateTimeline(values);
      setTimeline(plan.tasks);
    } catch (error) {
      console.error('Failed to generate event plan:', error);
      // You can add a toast notification here to inform the user
    } finally {
      setIsLoading(false);
    }
  }

  const handleTaskCheck = (taskId: string) => {
    setTimeline(prev => 
      prev!.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const handleAddTask = () => {
    const newTask: EventTask = {
      id: `custom-${Date.now()}`,
      task: 'New Task - Click edit to change',
      deadline: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      estimatedCost: 0,
      completed: false,
    };
    setTimeline(prev => [...(prev || []), newTask]);
  };
  
  const handleDeleteTask = (taskId: string) => {
    setTimeline(prev => prev!.filter(task => task.id !== taskId));
  };
  
  const handleEditTask = (task: EventTask) => {
    setEditingTaskId(task.id);
    setEditedTaskLabel(task.task);
  };
  
  const handleSaveTask = (taskId: string) => {
    setTimeline(prev => 
      prev!.map(task => 
        task.id === taskId ? { ...task, task: editedTaskLabel } : task
      )
    );
    setEditingTaskId(null);
    setEditedTaskLabel('');
  };

  const handleMoveTask = (index: number, direction: 'up' | 'down') => {
    if (!timeline) return;
    const newTimeline = [...timeline];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTimeline.length) return;

    [newTimeline[index], newTimeline[targetIndex]] = [newTimeline[targetIndex], newTimeline[index]];
    setTimeline(newTimeline);
  };

  const completedTasks = timeline?.filter(t => t.completed).length || 0;
  const progress = timeline ? (completedTasks / timeline.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Event Planner</CardTitle>
          <CardDescription>Describe your event, and we'll generate a customized timeline for you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Wedding, Corporate Retreat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., San Francisco, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="guestCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Count</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Budget ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} size="lg">
                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Generating Plan...' : 'Start Planning'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center p-8">
          <Loader className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Crafting your personalized event plan...</p>
        </div>
      )}

      {timeline && (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Your Plan: {eventName}</CardTitle>
                        <CardDescription>Here is your generated timeline. You can check off tasks, edit, and save your progress.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="outline" onClick={handleAddTask}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                        <Button>
                            <Save className="mr-2 h-4 w-4" />
                            Save Timeline
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-6 relative">
                    {/* The "snake" line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border -z-10"></div>
                    
                    {timeline.map((task, index) => (
                        <div key={task.id} className="flex items-start gap-4 pl-12 relative group">
                            <div className="absolute left-0 top-1.5 flex items-center">
                               <div className="h-6 w-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                               </div>
                            </div>

                            <div className="flex-grow bg-muted/50 p-4 rounded-lg">
                                <div className="flex items-center gap-4">
                                     <Checkbox 
                                        id={`task-${task.id}`}
                                        checked={task.completed}
                                        onCheckedChange={() => handleTaskCheck(task.id)}
                                        className="h-5 w-5"
                                    />
                                    {editingTaskId === task.id ? (
                                        <Input 
                                            value={editedTaskLabel}
                                            onChange={(e) => setEditedTaskLabel(e.target.value)}
                                            className="flex-grow"
                                        />
                                    ) : (
                                        <Label htmlFor={`task-${task.id}`} className={`flex-grow text-base ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                            {task.task}
                                        </Label>
                                    )}

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {editingTaskId === task.id ? (
                                            <Button size="icon" variant="ghost" onClick={() => handleSaveTask(task.id)} className="h-8 w-8 text-green-600">
                                                <Save className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button size="icon" variant="ghost" onClick={() => handleEditTask(task)} className="h-8 w-8">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Separator orientation="vertical" className="h-6"/>
                                        <Button size="icon" variant="ghost" onClick={() => handleMoveTask(index, 'up')} disabled={index === 0} className="h-8 w-8">
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleMoveTask(index, 'down')} disabled={index === timeline.length - 1} className="h-8 w-8">
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="pl-9 mt-2 flex items-center gap-6 text-sm text-muted-foreground">
                                    <p><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</p>
                                    <p><strong>Priority:</strong> {task.priority}</p>
                                    <p><strong>Cost:</strong> ${task.estimatedCost.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
