
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState, Suspense, useTransition, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader, PlusCircle, Trash2, Edit, Save, List, Sparkles, Building, Link2, X, ArrowLeft, DollarSign, Wallet } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { EventTask, SavedTimeline, ServiceOrOffer, VendorProfile, GenerateEventPlanInput } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveTimeline, getSavedTimelines, updateTimeline, getServicesAndOffers } from '@/lib/services';
import { useAuth } from '@/hooks/use-auth';
import { generateTimeline } from '@/lib/timeline-generator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { eventTypes, getQuestionsForEventType } from '@/lib/timeline-generator';


const formSchema = z.object({
  eventType: z.string().min(1, 'Please select a valid event type'),
  eventDate: z.string().min(1, 'Event date is required'),
  guestCount: z.coerce.number().min(1, 'Guest count must be at least 1'),
  budget: z.coerce.number().min(1, 'Budget is required'),
});

function EventPlannerContent() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [timeline, setTimeline] = useState<EventTask[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [eventName, setEventName] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskLabel, setEditedTaskLabel] = useState('');
  const [timelineId, setTimelineId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // New state for multi-step form
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState<z.infer<typeof formSchema> | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  
  const [eventTypeInput, setEventTypeInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionBoxOpen, setIsSuggestionBoxOpen] = useState(false);
  const [initialBudget, setInitialBudget] = useState(0);

  const { toast } = useToast();

  const handleLoadTimeline = (timelineToLoad: SavedTimeline) => {
    setTimeline(timelineToLoad.tasks);
    setEventName(timelineToLoad.name);
    setTimelineId(timelineToLoad.id);
    setInitialBudget(timelineToLoad.initialBudget || 0); // Load budget
    setStep(3); // Go directly to the plan
  }

  useEffect(() => {
    const timelineIdToLoad = searchParams.get('timelineId');
    if (timelineIdToLoad && userId) {
        const loadTimeline = async () => {
            setIsLoading(true);
            try {
                // In a real app we would check if the user owns this timeline
                const timelines = await getSavedTimelines(userId);
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
  }, [searchParams, router, userId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: '',
      eventDate: '',
      guestCount: 100,
      budget: 5000,
    },
  });

  const handleEventTypeChange = (value: string) => {
    setEventTypeInput(value);
    if (value) {
        const filtered = eventTypes.filter(type => type.toLowerCase().includes(value.toLowerCase()));
        setSuggestions(filtered);
        setIsSuggestionBoxOpen(true);
    } else {
        setSuggestions([]);
        setIsSuggestionBoxOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setEventTypeInput(suggestion);
    form.setValue('eventType', suggestion);
    setIsSuggestionBoxOpen(false);
  };

  function onFirstStepSubmit(values: z.infer<typeof formSchema>) {
    setFormValues(values);
    setInitialBudget(values.budget);
    setStep(2);
  }

  function generatePlan() {
    if (!formValues) return;
    setIsLoading(true);
    setTimeline(null);
    setTimelineId(null);
    setEventName(`${formValues.eventType}`);

    try {
      const planInput = {
        ...formValues,
        answers,
      };

      const plan = generateTimeline(planInput as GenerateEventPlanInput);
      
      if (plan?.tasks) {
        setTimeline(plan.tasks);
      } else {
        toast({ title: "Error", description: "Could not generate a plan. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to generate event plan:', error);
       toast({ title: "Error", description: "An error occurred while generating the plan.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setStep(3);
    }
  }

  const handleTaskCheck = (taskId: string) => {
    setTimeline(prev => 
      prev!.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const handleAddTask = (index?: number) => {
    const newTask: EventTask = {
      id: `custom-${Date.now()}`,
      task: 'New Task - Click edit to change',
      deadline: new Date().toISOString().split('T')[0],
      estimatedCost: 0,
      completed: false,
    };
    
    startTransition(() => {
      setTimeline(prev => {
        const newTasks = [...(prev || [])];
        if (index !== undefined) {
            newTasks.splice(index, 0, newTask);
        } else {
            newTasks.push(newTask);
        }
        return newTasks;
      });
    })
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
  
  const handleActualCostChange = (taskId: string, value: string) => {
    const cost = value ? parseFloat(value) : undefined;
    setTimeline(prev => 
      prev!.map(task => 
        task.id === taskId ? { ...task, actualCost: cost } : task
      )
    );
  }

  const handleSaveTimeline = async () => {
    if (!timeline || !userId) return;
    setIsSaving(true);

    try {
        if (timelineId) {
            // Update existing timeline
            const timelineToUpdate: SavedTimeline = {
                id: timelineId,
                name: eventName,
                tasks: timeline,
                lastModified: new Date().toISOString(),
                initialBudget: initialBudget,
            };
            await updateTimeline(userId, timelineId, timelineToUpdate);
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
                initialBudget: initialBudget,
            };
            const newId = await saveTimeline(userId, newSavedTimeline);
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

  const completedTasksCount = timeline?.filter(t => t.completed).length || 0;
  const totalTasks = timeline?.length || 0;
  const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
  
  const totalEstimatedCost = timeline?.reduce((acc, task) => acc + (task.estimatedCost || 0), 0) || 0;
  const totalActualCost = timeline?.reduce((acc, task) => acc + (task.actualCost || 0), 0) || 0;
  const budgetRemaining = initialBudget - totalActualCost;
  const budgetProgress = initialBudget > 0 ? (totalActualCost / initialBudget) * 100 : 0;

  
  const taskVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
      },
    }),
  };

  const questions = formValues?.eventType ? getQuestionsForEventType(formValues.eventType) : [];

  return (
    <div className="space-y-8">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Event Planner</CardTitle>
            <CardDescription>Describe your event, and we'll generate a customized planning timeline for you.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onFirstStepSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                                placeholder="e.g., Wedding, Birthday..." 
                                value={eventTypeInput}
                                onChange={(e) => handleEventTypeChange(e.target.value)}
                                onFocus={() => setIsSuggestionBoxOpen(true)}
                                onBlur={() => setTimeout(() => setIsSuggestionBoxOpen(false), 150)}
                                autoComplete="off"
                            />
                            {isSuggestionBoxOpen && suggestions.length > 0 && (
                                <div className="absolute z-10 w-full bg-card border rounded-md shadow-lg mt-1">
                                    {suggestions.map(suggestion => (
                                        <div 
                                            key={suggestion} 
                                            className="p-2 hover:bg-muted cursor-pointer"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                          </div>
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
                   <Button type="submit" size="lg" className="w-full sm:w-auto">
                      Next Step
                  </Button>
                  <Link href="/client/event-planner/saved" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" asChild className="w-full">
                        <div><List className="mr-2 h-4 w-4" /> View My Timelines</div>
                      </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === 2 && formValues && (
          <Card>
              <CardHeader>
                  <Button variant="ghost" onClick={() => setStep(1)} className="self-start px-2 mb-2">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <CardTitle>Tell us more about your {formValues.eventType}</CardTitle>
                  <CardDescription>Answering these questions will help us create a more detailed plan.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-6">
                      {questions.map(q => (
                          <div key={q.id}>
                              <Label className="text-base font-semibold">{q.question}</Label>
                               <div className="mt-2 space-y-2">
                                  {q.options.map(option => (
                                    <div key={option} className="flex items-center">
                                      <Checkbox 
                                        id={`${q.id}-${option}`}
                                        onCheckedChange={(checked) => setAnswers(prev => ({...prev, [option]: !!checked }))}
                                      />
                                      <label htmlFor={`${q.id}-${option}`} className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {option}
                                      </label>
                                    </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                      <Button onClick={generatePlan} size="lg">
                          <Sparkles className="mr-2 h-4 w-4" /> Generate Plan
                      </Button>
                  </div>
              </CardContent>
          </Card>
      )}


      {isLoading && (
        <div className="text-center p-8">
          <Loader className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Crafting your personalized event plan...</p>
        </div>
      )}

      {step === 3 && timeline && (
        <>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                      <Button variant="ghost" onClick={() => { setTimeline(null); setStep(1); }} className="self-start px-0 mb-2 h-auto hover:bg-transparent">
                          <ArrowLeft className="mr-2 h-4 w-4" /> Start Over
                      </Button>
                    <CardTitle>Your Plan: {eventName}</CardTitle>
                    <CardDescription>Here is your generated timeline. You can check off tasks, edit, and save your progress.</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" onClick={() => handleAddTask()} className="flex-1 sm:flex-none">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Task
                    </Button>
                    <Button onClick={handleSaveTimeline} disabled={isSaving || !userId} className="flex-1 sm:flex-none">
                        {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isSaving ? 'Saving...' : timelineId ? 'Save Changes' : 'Save Timeline'}
                    </Button>
                </div>
            </div>
          </CardHeader>
           <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                     <Label>Task Progress</Label>
                    <Progress value={progress} className="h-3" />
                    <p className="text-sm text-muted-foreground">{completedTasksCount} of {totalTasks} tasks completed</p>
                </div>
                 <div className="space-y-4">
                    <Label>Budget Tracker</Label>
                    <Progress value={budgetProgress} className="h-3 [&>div]:bg-green-500" />
                     <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Spent: ${totalActualCost.toLocaleString()}</span>
                        <span>Remaining: ${budgetRemaining.toLocaleString()}</span>
                    </div>
                </div>
           </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                 <CardTitle>Event Checklist</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative mt-8">
                    {/* The timeline line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-border"></div>
                    
                    <AnimatePresence>
                    {timeline.map((task, index) => (
                       <motion.div 
                        key={task.id}
                        variants={taskVariants}
                        initial="hidden"
                        animate="visible"
                        custom={index}
                        exit="hidden"
                        >
                        <div className="relative mb-8 group">
                            <div className="grid grid-cols-2 items-start gap-x-8">
                                {/* Date / Deadline */}
                                <div className={cn(
                                    "text-right",
                                    index % 2 === 0 ? "text-right" : "col-start-2 text-left"
                                )}>
                                   
                                </div>

                                {/* Connector dot */}
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary/30 border-4 border-background flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                </div>

                                {/* Task Card */}
                                <div className={cn(
                                    "col-start-2",
                                    index % 2 === 0 ? 'col-start-2' : 'col-start-1 row-start-1'
                                )}>
                                    <motion.div
                                        animate={{ 
                                            background: task.completed ? 'linear-gradient(to right, hsl(var(--primary) / 0.1), hsl(var(--background)))' : 'hsl(var(--card))',
                                            opacity: task.completed ? 0.7 : 1
                                        }}
                                        className={cn(
                                        "bg-card border rounded-xl shadow-sm p-4 space-y-3 transition-all duration-300 hover:shadow-lg relative"
                                    )}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className='flex items-start gap-4'>
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
                                                            className="flex-grow text-base h-8"
                                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTask(task.id)}
                                                        />
                                                    ) : (
                                                        <h4 className={cn("font-semibold", task.completed && 'line-through text-muted-foreground')}>
                                                            {task.task}
                                                        </h4>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                         <p className="font-semibold text-primary">{new Date(task.deadline).toLocaleDateString(undefined, {month: 'long', day: 'numeric'})}, {new Date(task.deadline).getFullYear()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                             <div className="hidden sm:flex items-center gap-1">
                                                 {editingTaskId === task.id ? (
                                                    <Button size="icon" variant="ghost" onClick={() => handleSaveTask(task.id)} className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700">
                                                        <Save className="h-5 w-5" />
                                                    </Button>
                                                ) : (
                                                    <Button size="icon" variant="ghost" onClick={() => handleEditTask(task)} className="h-8 w-8">
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 text-destructive hover:bg-red-100">
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-2 left-2 flex flex-col sm:hidden items-center gap-1">
                                            {editingTaskId === task.id ? (
                                                <Button size="icon" variant="ghost" onClick={() => handleSaveTask(task.id)} className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700">
                                                    <Save className="h-5 w-5" />
                                                </Button>
                                            ) : (
                                                <Button size="icon" variant="ghost" onClick={() => handleEditTask(task)} className="h-8 w-8">
                                                    <Edit className="h-5 w-5" />
                                                </Button>
                                            )}
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="h-8 w-8 text-destructive hover:bg-red-100">
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                         <div className="pt-2 border-t border-dashed flex gap-4">
                                            <div className="flex-1">
                                                <Label className="text-xs">Est. Cost</Label>
                                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                                  <DollarSign className="h-4 w-4" />
                                                  <span>{task.estimatedCost.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                               <Label htmlFor={`actual-cost-${task.id}`} className="text-xs">Actual Cost</Label>
                                               <div className="relative">
                                                  <DollarSign className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                                  <Input 
                                                    id={`actual-cost-${task.id}`}
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={task.actualCost ?? ''}
                                                    onChange={(e) => handleActualCostChange(task.id, e.target.value)}
                                                    className="pl-7 h-9"
                                                  />
                                               </div>
                                            </div>
                                         </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                        {/* "Add Task" button between items */}
                        <div className="relative h-8">
                             <div className="absolute left-1/2 w-0.5 h-full -translate-x-1/2 bg-border"></div>
                             <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
                                <Button size="icon" variant="secondary" className="rounded-full h-8 w-8 z-10" onClick={() => handleAddTask(index + 1)}>
                                    <PlusCircle className="h-5 w-5" />
                                </Button>
                             </div>
                        </div>
                       </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
      </>
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
