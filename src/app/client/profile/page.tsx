
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera } from 'lucide-react';


export default function ClientProfilePage() {
  return (
     <Card>
        <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>View and edit your public profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src="https://i.pravatar.cc/150?u=profile" alt="User" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 rounded-full bg-background h-8 w-8">
                        <Camera className="h-4 w-4"/>
                        <span className="sr-only">Change photo</span>
                    </Button>
                </div>
                <div>
                    <h2 className="text-2xl font-bold">John Doe</h2>
                    <p className="text-muted-foreground">Client since May 2024</p>
                </div>
            </div>

            <form className="grid md:grid-cols-2 gap-6 max-w-3xl">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" />
                </div>
                 <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="(123) 456-7890" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <Button>Save Changes</Button>
                </div>
            </form>
        </CardContent>
    </Card>
  )
}
