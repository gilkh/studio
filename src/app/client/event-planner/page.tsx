
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { BadgeDollarSign, Calendar, CheckSquare, ListTodo, PlusCircle, Users } from 'lucide-react';
import React from 'react';

const tasks = [
    { id: 'task1', label: 'Book photographer', completed: true },
    { id: 'task2', label: 'Send out invitations', completed: true },
    { id: 'task3', label: 'Finalize catering menu', completed: false },
    { id: 'task4', label: 'Arrange floral decorations', completed: false },
    { id: 'task5', label: 'Confirm guest RSVPs', completed: false },
];

export default function EventPlannerPage() {
    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = (completedTasks / tasks.length) * 100;

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>My Wedding Plan</CardTitle>
                <CardDescription>Your all-in-one dashboard for planning the big day.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label>Overall Progress</Label>
                        <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} />
                 </div>
            </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                            <ListTodo className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>To-Do List</CardTitle>
                            <CardDescription>Stay on top of your tasks.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tasks.map(task => (
                             <div key={task.id} className="flex items-center gap-3">
                                <Checkbox id={task.id} checked={task.completed} />
                                <Label htmlFor={task.id} className={`flex-grow ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.label}
                                </Label>
                            </div>
                        ))}
                    </div>
                    <form className="mt-6 flex gap-2">
                        <Input placeholder="Add a new task..." />
                        <Button><PlusCircle className="h-4 w-4" /></Button>
                    </form>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                            <BadgeDollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Budget Tracker</CardTitle>
                            <CardDescription>Manage your event expenses.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">Total Budget</p>
                                <p className="text-2xl font-bold text-primary">$15,000</p>
                            </div>
                             <div>
                                <p className="font-medium text-right">Spent</p>
                                <p className="text-2xl font-bold">$8,250</p>
                            </div>
                        </div>
                        <Progress value={(8250/15000) * 100} />
                         <Separator className="my-4"/>
                         <div className="space-y-3">
                             <div className="flex justify-between items-center">
                                 <p>Venue</p>
                                 <p className="font-medium">$4,500</p>
                             </div>
                             <div className="flex justify-between items-center">
                                 <p>Catering</p>
                                 <p className="font-medium">$2,500</p>
                             </div>
                             <div className="flex justify-between items-center">
                                 <p>Photography</p>
                                 <p className="font-medium">$1,250</p>
                             </div>
                         </div>
                    </div>
                </CardContent>
            </Card>
             <Card className="md:col-span-2">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Guest List</CardTitle>
                            <CardDescription>Keep track of your attendees and RSVPs.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                   <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-2xl font-bold">150</p>
                            <p className="text-sm text-muted-foreground">Invited</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold text-green-600">128</p>
                            <p className="text-sm text-muted-foreground">Attending</p>
                        </div>
                         <div>
                            <p className="text-2xl font-bold text-red-600">22</p>
                            <p className="text-sm text-muted-foreground">Declined</p>
                        </div>
                   </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}
