
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ChangePasswordDialog } from '@/components/change-password-dialog';
import { useAuth } from '@/hooks/use-auth';
import { KeyRound, Languages, Moon, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function VendorSettingsPage() {
  const { userId } = useAuth();
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <Card>
            <CardHeader>
                <CardTitle>Vendor Account Settings</CardTitle>
                <CardDescription>Manage your login and primary contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="owner-name">Owner Full Name</Label>
                        <Input id="owner-name" defaultValue="Jane Smith" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Login Email</Label>
                        <Input id="email" type="email" defaultValue="jane.smith@timeless-snaps.com" disabled/>
                    </div>
                </div>
                {userId && (
                    <ChangePasswordDialog userId={userId}>
                        <Button variant="outline">
                            <KeyRound className="mr-2 h-4 w-4" />
                            Change Password
                        </Button>
                    </ChangePasswordDialog>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex gap-2">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <Sun className="h-5 w-5" />
                            Light
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Moon className="h-5 w-5" />
                            Dark
                        </Button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                     <Select defaultValue="en">
                        <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="ar">العربية</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Choose how you want to be notified about client activity.</CardDescription>
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
                            <Label htmlFor="notify-messages" className="font-normal">New messages from clients</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="notify-quotes" defaultChecked />
                            <Label htmlFor="notify-quotes" className="font-normal">New quote requests</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="notify-bookings" defaultChecked />
                            <Label htmlFor="notify-bookings" className="font-normal">New bookings and cancellations</Label>
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
                <Button variant="destructive">Deactivate My Vendor Profile</Button>
            </CardContent>
        </Card>
    </div>
  )
}
