
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Star } from 'lucide-react';


export default function VendorProfilePage() {
  return (
     <Card>
        <CardHeader>
            <CardTitle>My Vendor Profile</CardTitle>
            <CardDescription>This is how your profile appears to potential clients. Keep it up-to-date!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="relative flex-shrink-0">
                    <Avatar className="h-32 w-32 border-4 border-primary/50">
                        <AvatarImage src="https://i.pravatar.cc/150?u=timeless" alt="User" data-ai-hint="company logo" />
                        <AvatarFallback>TS</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 rounded-full bg-background h-8 w-8">
                        <Camera className="h-4 w-4"/>
                        <span className="sr-only">Change logo</span>
                    </Button>
                </div>
                <div className="flex-grow">
                    <h2 className="text-3xl font-bold">Timeless Snaps</h2>
                    <p className="text-muted-foreground">Creative Wedding & Portrait Photography</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-base">5.0</span>
                        <span>(150 reviews)</span>
                    </div>
                </div>
            </div>

            <form className="space-y-6 max-w-4xl">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input id="businessName" defaultValue="Timeless Snaps" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                         <Select name="category" defaultValue="Photography">
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Catering">Catering</SelectItem>
                                <SelectItem value="Photography">Photography</SelectItem>
                                <SelectItem value="Decor & Floral">Decor & Floral</SelectItem>
                                <SelectItem value="Music & Entertainment">Music & Entertainment</SelectItem>
                                <SelectItem value="Venue">Venue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline / Short Description</Label>
                    <Input id="tagline" defaultValue="Creative Wedding & Portrait Photography" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Full Business Description</Label>
                    <Textarea
                        id="description"
                        rows={6}
                        defaultValue="Capturing your special moments with artistry and passion. We offer a range of packages including full-day coverage, engagement shoots, and custom-designed printed albums to make your memories last a lifetime."
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="email">Public Email Address</Label>
                        <Input id="email" type="email" defaultValue="contact@timeless-snaps.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Public Phone Number</Label>
                        <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button size="lg">Save All Changes</Button>
                </div>
            </form>
        </CardContent>
    </Card>
  )
}
