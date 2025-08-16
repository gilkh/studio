
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
import { Loader, PlusCircle, Trash2, Edit, Save, Check as CheckIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { EventTask } from '@/lib/types';
import { generateTimeline } from '@/lib/timeline-generator';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

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

  const completedTasksCount = timeline?.filter(t => t.completed).length || 0;
  const totalTasks = timeline?.length || 0;
  const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

  const priorityColors = {
      High: 'bg-red-500',
      Medium: 'bg-yellow-500',
      Low: 'bg-green-500',
  }

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
                 <div className="mt-4 space-y-2">
                    <Label>Progress</Label>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground">{completedTasksCount} of {totalTasks} tasks completed</p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* The timeline line */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-300 hidden md:block"></div>
                     <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 md:hidden"></div>

                    {timeline.map((task, index) => (
                        <div key={task.id} className="relative md:grid md:grid-cols-2 md:gap-x-12 items-start my-8 group">
                            <div className="md:col-start-1 md:col-end-2 md:pr-8 md:text-right">
                                {/* Date for Desktop - alternating */}
                                <p className={cn(
                                    'font-semibold text-primary hidden md:block',
                                    index % 2 === 1 && 'md:text-left md:pl-8'
                                )}>{new Date(task.deadline).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</p>
                            </div>
                            
                            {/* Connector dot and line */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background hidden md:block"></div>
                            <div className="absolute top-1/2 -translate-y-1/2 left-6 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background md:hidden"></div>

                            <div className={cn(
                                "md:col-start-2 md:col-end-3",
                                index % 2 === 1 && 'md:col-start-1 md:col-end-2 md:row-start-1'
                            )}>
                                 {/* Date for Mobile */}
                                <p className="font-semibold text-primary mb-2 md:hidden">{new Date(task.deadline).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</p>
                                
                                <div className={cn(
                                    "relative w-full md:w-[300px] bg-card border rounded-lg shadow-md p-4 space-y-2 ml-0 md:ml-0 group-hover:shadow-lg transition-shadow",
                                    task.completed && 'bg-muted/60',
                                    index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'
                                )}>
                                    <Badge className={cn(
                                        "absolute top-2 right-2 text-white", 
                                        priorityColors[task.priority],
                                        task.completed && 'opacity-50'
                                    )}>{task.priority}</Badge>
                                    
                                    <div className="flex items-start gap-3">
                                        <Checkbox 
                                            id={`task-${task.id}`}
                                            checked={task.completed}
                                            onCheckedChange={() => handleTaskCheck(task.id)}
                                            className="h-5 w-5 mt-0.5"
                                        />
                                        
                                        <div className="flex-1">
                                             {editingTaskId === task.id ? (
                                                <Input 
                                                    value={editedTaskLabel}
                                                    onChange={(e) => setEditedTaskLabel(e.target.value)}
                                                    className="flex-grow text-base"
                                                />
                                            ) : (
                                                <h4 className={cn("font-semibold", task.completed && 'line-through text-muted-foreground')}>
                                                    {task.task}
                                                </h4>
                                            )}
                                            <p className="text-sm text-muted-foreground">${task.estimatedCost.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-2 left-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         {editingTaskId === task.id ? (
                                            <Button size="icon" variant="ghost" onClick={() => handleSaveTask(task.id)} className="h-7 w-7 text-green-600">
                                                <Save className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button size="icon" variant="ghost" onClick={() => handleEditTask(task)} className="h-7 w-7">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="h-7 w-7 text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
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

    