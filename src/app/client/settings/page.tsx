
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientSettingsPage() {
  return (
     <Card>
        <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Account preferences and notification settings will be available here.</p>
        </CardContent>
    </Card>
  )
}
