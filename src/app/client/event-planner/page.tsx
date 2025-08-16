
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader, PlusCircle, Trash2, Edit, Save, List } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { EventTask, SavedTimeline } from '@/lib/types';
import { generateTimeline } from '@/lib/timeline-generator';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveTimeline, getSavedTimelines, updateTimeline } from '@/lib/services';

const formSchema = z.object({
  eventType: z.string().min(3, 'Event type is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  location: z.string().min(3, 'Location is required'),
  guestCount: z.coerce.number().min(1, 'Guest count must be at least 1'),
  budget: z.coerce.number().min(1, 'Budget is required'),
});

// Mock user ID for demonstration. In a real app, this would come from auth.
const MOCK_USER_ID = 'user123';

function EventPlannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [timeline, setTimeline] = useState<EventTask[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [eventName, setEventName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskLabel, setEditedTaskLabel] = useState('');
  const [timelineId, setTimelineId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timelineIdToLoad = searchParams.get('timelineId');
    if (timelineIdToLoad) {
        const loadTimeline = async () => {
            setIsLoading(true);
            try {
                // In a real app we would check if the user owns this timeline
                const timelines = await getSavedTimelines(MOCK_USER_ID);
                const timelineToLoad = timelines.find(t => t.id === timelineIdToLoad);

                if (timelineToLoad) {
                    handleLoadTimeline(timelineToLoad);
                } else {
                    toast({ title: "Error", description: "Timeline not found.", variant: "destructive" });
                }
                 // Remove the query param from URL after loading
                router.replace('/client/event-planner', { scroll: false });
            } catch (error) {
                console.error("Could not load timeline from Firestore", error);
                toast({ title: "Error", description: "Could not load the timeline.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        loadTimeline();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

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
    setTimelineId(null);
    setEventName(`${values.eventType} in ${values.location}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const plan = generateTimeline(values);
      setTimeline(plan.tasks);
    } catch (error) {
      console.error('Failed to generate event plan:', error);
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

  const handleSaveTimeline = async () => {
    if (!timeline) return;
    setIsSaving(true);

    try {
        if (timelineId) {
            // Update existing timeline
            const timelineToUpdate: SavedTimeline = {
                id: timelineId,
                name: eventName,
                tasks: timeline,
                lastModified: new Date().toISOString(),
            };
            await updateTimeline(MOCK_USER_ID, timelineId, timelineToUpdate);
            toast({
                title: 'Timeline Updated!',
                description: `Your event plan "${eventName}" has been saved.`,
            });
        } else {
            // Create new timeline
            const newSavedTimeline: Omit<SavedTimeline, 'id'> = {
                name: eventName,
                tasks: timeline,
                lastModified: new Date().toISOString(),
            };
            const newId = await saveTimeline(MOCK_USER_ID, newSavedTimeline);
            setTimelineId(newId);
            toast({
                title: 'Timeline Saved!',
                description: `Your event plan "${eventName}" has been saved.`,
            });
        }
    } catch (error) {
        console.error("Failed to save timeline:", error);
        toast({ title: "Error", description: "Could not save the timeline.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleLoadTimeline = (timelineToLoad: SavedTimeline) => {
    setTimeline(timelineToLoad.tasks);
    setEventName(timelineToLoad.name);
    setTimelineId(timelineToLoad.id);
  }

  const completedTasksCount = timeline?.filter(t => t.completed).length || 0;
  const totalTasks = timeline?.length || 0;
  const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;

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
               <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
                    {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? 'Generating Plan...' : 'Generate New Plan'}
                </Button>
                <Link href="/client/event-planner/saved" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" asChild className="w-full">
                       <a><List className="mr-2 h-4 w-4" /> View My Timelines</a>
                    </Button>
                </Link>
              </div>
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
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <CardTitle>Your Plan: {eventName}</CardTitle>
                        <CardDescription>Here is your generated timeline. You can check off tasks, edit, and save your progress.</CardDescription>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                         <Button variant="outline" onClick={handleAddTask} className="flex-1 sm:flex-none">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                        <Button onClick={handleSaveTimeline} disabled={isSaving} className="flex-1 sm:flex-none">
                            {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSaving ? 'Saving...' : timelineId ? 'Save Changes' : 'Save Timeline'}
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
                <div className="relative mt-8">
                    {/* The timeline line */}
                    <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200 md:left-1/2 md:-translate-x-1/2"></div>
                    
                    {timeline.map((task, index) => (
                        <div key={task.id} className="relative mb-8 group">
                            <div className="flex md:grid md:grid-cols-2 items-center">
                                {/* Desktop: Date on the left for even, right for odd */}
                                <div className={cn(
                                    "hidden md:flex",
                                    index % 2 === 0 ? 'justify-end pr-8' : 'justify-start pl-8 col-start-2'
                                )}>
                                    <p className="font-semibold text-primary">{new Date(task.deadline).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</p>
                                </div>

                                {/* Connector dot */}
                                <div className="absolute top-1/2 -translate-y-1/2 left-6 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background md:left-1/2"></div>

                                {/* Task Card */}
                                <div className={cn(
                                    "relative ml-12 md:ml-0 w-full md:w-[300px] lg:w-[400px]",
                                    index % 2 === 0 ? 'md:col-start-2 md:pl-8' : 'md:col-start-1 md:text-right md:pr-8'
                                )}>
                                     {/* Mobile: Date above card */}
                                    <p className="font-semibold text-primary mb-1 md:hidden">{new Date(task.deadline).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</p>
                                    
                                    <div className={cn(
                                        "bg-card border rounded-lg shadow-md p-4 space-y-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                        task.completed && 'bg-muted/60 opacity-80'
                                    )}>
                                        <div className="flex items-start gap-3">
                                            <Checkbox 
                                                id={`task-${task.id}`}
                                                checked={task.completed}
                                                onCheckedChange={() => handleTaskCheck(task.id)}
                                                className="h-5 w-5 mt-1"
                                            />
                                            
                                            <div className="flex-1">
                                                 {editingTaskId === task.id ? (
                                                    <Input 
                                                        value={editedTaskLabel}
                                                        onChange={(e) => setEditedTaskLabel(e.target.value)}
                                                        className="flex-grow text-base h-8"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTask(task.id)}
                                                    />
                                                ) : (
                                                    <h4 className={cn("font-semibold", task.completed && 'line-through text-muted-foreground')}>
                                                        {task.task}
                                                    </h4>
                                                )}
                                                <p className="text-sm text-muted-foreground">${task.estimatedCost.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                             {editingTaskId === task.id ? (
                                                <Button size="icon" variant="ghost" onClick={() => handleSaveTask(task.id)} className="h-7 w-7 text-green-600 hover:bg-green-100 hover:text-green-700">
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button size="icon" variant="ghost" onClick={() => handleEditTask(task)} className="h-7 w-7">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="h-7 w-7 text-destructive hover:bg-red-100">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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


export default function EventPlannerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EventPlannerContent />
        </Suspense>
    )
}
