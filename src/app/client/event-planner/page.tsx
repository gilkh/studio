
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
import { Loader, PlusCircle, Trash2, Edit, Save, List, Sparkles, Building, Link2, X, ArrowLeft } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';


const formSchema = z.object({
  eventType: z.string().min(3, 'Event type is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  location: z.string().min(3, 'Location is required'),
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
  const [services, setServices] = useState<ServiceOrOffer[]>([]);
  const [isPending, startTransition] = useTransition();

  const { toast } = useToast();

  const handleLoadTimeline = (timelineToLoad: SavedTimeline) => {
    setTimeline(timelineToLoad.tasks);
    setEventName(timelineToLoad.name);
    setTimelineId(timelineToLoad.id);
    // Fetch services when loading a timeline as well
    getServicesAndOffers().then(setServices);
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

    try {
      // Generate the plan first
      const plan = generateTimeline(values as GenerateEventPlanInput);
      
      if (plan?.tasks) {
        // Set timeline and then fetch associated vendor data
        setTimeline(plan.tasks);
        getServicesAndOffers().then(setServices);
      } else {
        toast({ title: "Error", description: "Could not generate a plan. Please try again.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Failed to generate event plan:', error);
       toast({ title: "Error", description: "An error occurred while generating the plan.", variant: "destructive" });
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

  const handleLinkVendor = (taskId: string, vendor: ServiceOrOffer) => {
    setTimeline(prev => 
        prev!.map(task => 
            task.id === taskId ? { 
                ...task, 
                assignedVendor: {
                    id: vendor.id,
                    name: vendor.vendorName,
                    avatar: vendor.vendorAvatar
                }
            } : task
        )
    )
  }

  const handleUnlinkVendor = (taskId: string) => {
    setTimeline(prev =>
        prev!.map(task => 
            task.id === taskId ? { ...task, assignedVendor: undefined } : task
        )
    )
  }
  
  const completedTasksCount = timeline?.filter(t => t.completed).length || 0;
  const totalTasks = timeline?.length || 0;
  const progress = totalTasks > 0 ? (completedTasksCount / totalTasks) * 100 : 0;
  
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

  return (
    <div className="space-y-8">
      {!timeline && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Event Planner</CardTitle>
            <CardDescription>Describe your event, and we'll generate a customized planning timeline for you.</CardDescription>
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
                      {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      {isLoading ? 'Generating Plan...' : 'Generate Plan'}
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
                         <Link href="/client/event-planner/saved" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Timelines
                        </Link>
                        <CardTitle>Your Plan: {eventName}</CardTitle>
                        <CardDescription>Here is your generated timeline. You can check off tasks, edit, and save your progress.</CardDescription>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                         <Button variant="outline" onClick={() => handleAddTask()} className="flex-1 sm:flex-none">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Task to End
                        </Button>
                        <Button onClick={handleSaveTimeline} disabled={isSaving || !userId} className="flex-1 sm:flex-none">
                            {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSaving ? 'Saving...' : timelineId ? 'Save Changes' : 'Save Timeline'}
                        </Button>
                    </div>
                </div>
                 <div className="mt-4 space-y-2">
                    <Label>Progress</Label>
                    <Progress value={progress} className="h-4" />
                    <p className="text-sm text-muted-foreground">{completedTasksCount} of {totalTasks} tasks completed</p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative mt-8 px-4">
                    {/* Desktop timeline line - straight down the middle */}
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary/50 via-primary to-primary/50"></div>
                    
                    {/* Mobile S-curve timeline */}
                    <svg className="lg:hidden absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                        <defs>
                            <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                            </linearGradient>
                        </defs>
                        <path
                            d={`M 20 0 Q 80 ${timeline.length > 0 ? 100 : 50} 20 ${timeline.length > 1 ? 200 : 100} Q 80 ${timeline.length > 2 ? 300 : 200} 20 ${timeline.length > 3 ? 400 : 300} Q 80 ${timeline.length > 4 ? 500 : 400} 20 ${timeline.length * 120}`}
                            stroke="url(#timelineGradient)"
                            strokeWidth="3"
                            fill="none"
                            className="drop-shadow-sm"
                        />
                    </svg>
                    
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
                        <div className="relative mb-12 group">
                            {/* Desktop Layout - Alternating sides */}
                            <div className="hidden lg:grid lg:grid-cols-2 items-start gap-x-8">
                                {/* Connector dot for desktop */}
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 border-4 border-background flex items-center justify-center shadow-lg z-10">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                </div>

                                {/* Task Card for desktop */}
                                <div className={cn(
                                    "col-start-2",
                                    index % 2 === 0 ? 'col-start-2' : 'col-start-1 row-start-1'
                                )}>
                                    <motion.div
                                        animate={{ 
                                            background: task.completed ? 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--background)))' : 'hsl(var(--card))',
                                            opacity: task.completed ? 0.8 : 1,
                                            scale: task.completed ? 0.98 : 1
                                        }}
                                        className={cn(
                                        "bg-card border-2 rounded-2xl shadow-lg p-6 space-y-4 transition-all duration-500 hover:shadow-2xl hover:border-primary/30 relative overflow-hidden group/card",
                                        task.completed && "border-primary/30"
                                    )}>
                                        {/* Gradient overlay for completed tasks */}
                                        {task.completed && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                                        )}
                                        
                                        <div className="flex items-start justify-between gap-4 relative z-10">
                                            <div className='flex items-start gap-4'>
                                                <div className="relative">
                                                    <Checkbox 
                                                        id={`task-${task.id}`}
                                                        checked={task.completed}
                                                        onCheckedChange={() => handleTaskCheck(task.id)}
                                                        className="h-6 w-6 mt-1 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                    {task.completed && (
                                                        <div className="absolute -inset-1 bg-primary/20 rounded-full animate-ping" />
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1">
                                                     {editingTaskId === task.id ? (
                                                        <Input 
                                                            value={editedTaskLabel}
                                                            onChange={(e) => setEditedTaskLabel(e.target.value)}
                                                            className="flex-grow text-lg h-10 font-semibold border-primary/50 focus:border-primary"
                                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTask(task.id)}
                                                        />
                                                    ) : (
                                                        <h4 className={cn("font-bold text-lg leading-tight", task.completed && 'line-through text-muted-foreground')}>
                                                            {task.task}
                                                        </h4>
                                                    )}
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                                         <p className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                                                            {new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                                                        </p>
                                                        {task.estimatedCost > 0 && (
                                                            <p className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                                                ${task.estimatedCost.toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                             <div className="flex items-center gap-1">
                                                 {editingTaskId === task.id ? (
                                                    <Button size="icon" variant="ghost" onClick={() => handleSaveTask(task.id)} className="h-10 w-10 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-full">
                                                        <Save className="h-5 w-5" />
                                                    </Button>
                                                ) : (
                                                    <Button size="icon" variant="ghost" onClick={() => handleEditTask(task)} className="h-10 w-10 hover:bg-primary/10 rounded-full">
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="h-10 w-10 text-destructive hover:bg-red-100 rounded-full">
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {task.suggestedVendorCategory && !task.assignedVendor && (
                                            <div className="pt-4 border-t border-dashed border-primary/20 relative z-10">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                         <Button variant="outline" size="sm" className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50">
                                                            <Building className="mr-2 h-4 w-4" />
                                                            Find a {task.suggestedVendorCategory}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        {services.filter(s => s.category === task.suggestedVendorCategory).map(vendor => (
                                                             <DropdownMenuItem key={vendor.id} onSelect={() => handleLinkVendor(task.id, vendor)}>
                                                                <Avatar className="h-6 w-6 mr-2">
                                                                    <AvatarImage src={vendor.vendorAvatar} />
                                                                    <AvatarFallback>{vendor.vendorName.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <span>{vendor.vendorName}</span>
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                        {task.assignedVendor && (
                                            <div className="pt-4 border-t border-dashed border-green-200 flex items-center justify-between relative z-10">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                                        <Link2 className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-foreground">{task.assignedVendor.name}</p>
                                                        <p className="text-xs text-green-600">Vendor linked</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100" onClick={() => handleUnlinkVendor(task.id)}>
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>

                            {/* Mobile Layout - S-curve with alternating sides */}
                            <div className="lg:hidden">
                                {/* Mobile connector dot */}
                                <div className={cn(
                                    "absolute top-6 w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 border-4 border-background flex items-center justify-center shadow-lg z-20",
                                    index % 2 === 0 ? "left-4" : "right-4"
                                )}>
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                </div>

                                {/* Mobile Task Card */}
                                <div className={cn(
                                    "w-full",
                                    index % 2 === 0 ? "pl-16 pr-4" : "pr-16 pl-4"
                                )}>
                                    <motion.div
                                        animate={{ 
                                            background: task.completed ? 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--background)))' : 'hsl(var(--card))',
                                            opacity: task.completed ? 0.8 : 1,
                                            scale: task.completed ? 0.98 : 1
                                        }}
                                        className={cn(
                                        "bg-card border-2 rounded-2xl shadow-lg p-6 space-y-4 transition-all duration-500 hover:shadow-2xl hover:border-primary/30 relative overflow-hidden group/card",
                                        task.completed && "border-primary/30"
                                    )}>
                                        {/* Gradient overlay for completed tasks */}
                                        {task.completed && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                                        )}
                                        
                                        <div className="flex items-start justify-between gap-4">
                                            <div className='flex items-start gap-4'>
                                                <div className="relative">
                                                    <Checkbox 
                                                        id={`task-${task.id}-mobile`}
                                                        checked={task.completed}
                                                        onCheckedChange={() => handleTaskCheck(task.id)}
                                                        className="h-6 w-6 mt-1 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                    {task.completed && (
                                                        <div className="absolute -inset-1 bg-primary/20 rounded-full animate-ping" />
                                                    )}
                                                </div>
                                                
                                                <div className="flex-1">
                                                     {editingTaskId === task.id ? (
                                                        <Input 
                                                            value={editedTaskLabel}
                                                            onChange={(e) => setEditedTaskLabel(e.target.value)}
                                                            className="flex-grow text-lg h-10 font-semibold border-primary/50 focus:border-primary"
                                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTask(task.id)}
                                                        />
                                                    ) : (
                                                        <h4 className={cn("font-bold text-lg leading-tight", task.completed && 'line-through text-muted-foreground')}>
                                                            {task.task}
                                                        </h4>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-2">
                                                         <p className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-full text-xs">
                                                            {new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                                                        </p>
                                                        {task.estimatedCost > 0 && (
                                                            <p className="font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs">
                                                                ${task.estimatedCost.toLocaleString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                             <div className="flex items-center gap-1">
                                                 {editingTaskId === task.id ? (
                                                    <Button size="icon" variant="ghost" onClick={() => handleSaveTask(task.id)} className="h-10 w-10 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-full">
                                                        <Save className="h-5 w-5" />
                                                    </Button>
                                                ) : (
                                                    <Button size="icon" variant="ghost" onClick={() => handleEditTask(task)} className="h-10 w-10 hover:bg-primary/10 rounded-full">
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" onClick={() => handleDeleteTask(task.id)} className="h-10 w-10 text-destructive hover:bg-red-100 rounded-full">
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {task.suggestedVendorCategory && !task.assignedVendor && (
                                            <div className="pt-4 border-t border-dashed border-primary/20">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                         <Button variant="outline" size="sm" className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50">
                                                            <Building className="mr-2 h-4 w-4" />
                                                            Find a {task.suggestedVendorCategory}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        {services.filter(s => s.category === task.suggestedVendorCategory).map(vendor => (
                                                             <DropdownMenuItem key={vendor.id} onSelect={() => handleLinkVendor(task.id, vendor)}>
                                                                <Avatar className="h-6 w-6 mr-2">
                                                                    <AvatarImage src={vendor.vendorAvatar} />
                                                                    <AvatarFallback>{vendor.vendorName.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <span>{vendor.vendorName}</span>
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                        {task.assignedVendor && (
                                            <div className="pt-4 border-t border-dashed border-green-200 flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-sm">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                                        <Link2 className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-foreground">{task.assignedVendor.name}</p>
                                                        <p className="text-xs text-green-600">Vendor linked</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-100" onClick={() => handleUnlinkVendor(task.id)}>
                                                    <X className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                            </div>
                        
                        {/* "Add Task" button between items - Desktop */}
                        <div className="hidden lg:block relative h-12">
                             <div className="absolute left-1/2 w-0.5 h-full -translate-x-1/2 bg-gradient-to-b from-primary to-primary/50"></div>
                             <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2">
                                <Button size="icon" variant="secondary" className="rounded-full h-10 w-10 z-10 border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/10" onClick={() => handleAddTask(index + 1)}>
                                    <PlusCircle className="h-5 w-5 text-primary" />
                                </Button>
                             </div>
                        </div>
                        
                        {/* "Add Task" button between items - Mobile */}
                        <div className="lg:hidden relative h-8 flex justify-center">
                             <Button size="icon" variant="secondary" className="rounded-full h-8 w-8 z-20 border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/10" onClick={() => handleAddTask(index + 1)}>
                                <PlusCircle className="h-4 w-4 text-primary" />
                            </Button>
                        </div>
                       </motion.div>
                    ))}
                    </AnimatePresence>
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
