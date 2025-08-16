
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export default function ClientSettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                <Button variant="outline">Change Password</Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Choose how you want to be notified.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                        <span>Push Notifications</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                        Get real-time updates on your mobile device.
                        </span>
                    </Label>
                    <Switch id="push-notifications" defaultChecked />
                </div>
                 <Separator />
                <div className="space-y-4">
                    <h3 className="text-md font-medium">Email Notifications</h3>
                    <div className="space-y-3">
                         <div className="flex items-center gap-3">
                            <Checkbox id="notify-messages" defaultChecked />
                            <Label htmlFor="notify-messages" className="font-normal">New messages from vendors</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="notify-quotes" defaultChecked />
                            <Label htmlFor="notify-quotes" className="font-normal">Updates on your quote requests</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="notify-bookings" defaultChecked />
                            <Label htmlFor="notify-bookings" className="font-normal">Booking confirmations and reminders</Label>
                        </div>
                         <div className="flex items-center gap-3">
                            <Checkbox id="notify-promotions" />
                            <Label htmlFor="notify-promotions" className="font-normal">Promotions and special offers</Label>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>These actions are permanent and cannot be undone.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="destructive">Delete My Account</Button>
            </CardContent>
        </Card>
    </div>
  )
}
