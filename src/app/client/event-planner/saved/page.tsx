
'use client';

import { useEffect, useState } from 'react';
import type { SavedTimeline } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { FileCheck, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function SavedTimelinesPage() {
    const [savedTimelines, setSavedTimelines] = useState<SavedTimeline[]>([]);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        try {
            const storedTimelines = localStorage.getItem('savedEventTimelines');
            if (storedTimelines) {
                setSavedTimelines(JSON.parse(storedTimelines));
            }
        } catch (error) {
            console.error("Could not load saved timelines from localStorage", error);
        }
    }, []);

    const handleDeleteSavedTimeline = (id: string) => {
        const newTimelines = savedTimelines.filter(st => st.id !== id);
        setSavedTimelines(newTimelines);
        localStorage.setItem('savedEventTimelines', JSON.stringify(newTimelines));
        toast({
            title: 'Timeline Deleted',
            description: 'The saved timeline has been removed.',
        });
    }

    const handleLoadTimeline = (id: string) => {
        router.push(`/client/event-planner?timelineId=${id}`);
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Link href="/client/event-planner">
                            <Button variant="outline" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <CardTitle>My Saved Timelines</CardTitle>
                            <CardDescription>
                                Load a previously saved event plan or delete ones you no longer need.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {savedTimelines.length > 0 ? (
                            <ul className="space-y-3">
                            {savedTimelines.sort((a,b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).map(st => {
                                const savedProgress = st.tasks.length > 0 ? (st.tasks.filter(t => t.completed).length / st.tasks.length) * 100 : 0;
                                return (
                                    <li key={st.id} className="p-4 border rounded-lg flex items-center justify-between gap-4 group">
                                        <div className="flex-grow">
                                            <p className="font-semibold">{st.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Last updated: {format(new Date(st.lastModified), "PPP p")}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Progress value={savedProgress} className="h-2 w-32" />
                                                <span className="text-xs text-muted-foreground">{Math.round(savedProgress)}%</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Button onClick={() => handleLoadTimeline(st.id)}>
                                                <FileCheck className="mr-2 h-4 w-4"/> Load
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={() => handleDeleteSavedTimeline(st.id)} className="text-destructive opacity-50 group-hover:opacity-100">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">You have no saved timelines yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
