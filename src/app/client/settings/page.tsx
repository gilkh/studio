
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Languages, Moon, Sun, KeyRound } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/use-theme';
import { useState } from 'react';
import { ChangePasswordDialog } from '@/components/change-password-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const translations = {
  en: {
    accountSettings: "Account Settings",
    manageAccount: "Manage your account preferences.",
    email: "Email",
    changePassword: "Change Password",
    appearanceSettings: "Appearance Settings",
    customizeAppearance: "Customize the look and feel of the application.",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    language: "Language",
    notificationSettings: "Notification Settings",
    howToNotify: "Choose how you want to be notified.",
    pushNotifications: "Push Notifications",
    pushDescription: "Get real-time updates on your mobile device.",
    emailNotifications: "Email Notifications",
    newMessages: "New messages from vendors",
    quoteUpdates: "Updates on your quote requests",
    bookingConfirmations: "Booking confirmations and reminders",
    promotions: "Promotions and special offers",
    dangerZone: "Danger Zone",
    dangerDescription: "These actions are permanent and cannot be undone.",
    deleteAccount: "Delete My Account",
  },
  fr: {
    accountSettings: "Paramètres du compte",
    manageAccount: "Gérez les préférences de votre compte.",
    email: "Email",
    changePassword: "Changer le mot de passe",
    appearanceSettings: "Paramètres d'apparence",
    customizeAppearance: "Personnalisez l'apparence de l'application.",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    language: "Langue",
    notificationSettings: "Paramètres de notification",
    howToNotify: "Choisissez comment vous souhaitez être notifié.",
    pushNotifications: "Notifications push",
    pushDescription: "Recevez des mises à jour en temps réel sur votre appareil mobile.",
    emailNotifications: "Notifications par email",
    newMessages: "Nouveaux messages des fournisseurs",
    quoteUpdates: "Mises à jour de vos demandes de devis",
    bookingConfirmations: "Confirmations et rappels de réservation",
    promotions: "Promotions et offres spéciales",
    dangerZone: "Zone de danger",
    dangerDescription: "Ces actions sont permanentes et ne peuvent pas être annulées.",
    deleteAccount: "Supprimer mon compte",
  },
  ar: {
    accountSettings: "إعدادات الحساب",
    manageAccount: "إدارة تفضيلات حسابك.",
    email: "البريد الإلكتروني",
    changePassword: "تغيير كلمة المرور",
    appearanceSettings: "إعدادات المظهر",
    customizeAppearance: "تخصيص شكل ومظهر التطبيق.",
    theme: "المظهر",
    light: "فاتح",
    dark: "داكن",
    language: "اللغة",
    notificationSettings: "إعدادات الإشعارات",
    howToNotify: "اختر كيف تريد أن يتم إعلامك.",
    pushNotifications: "إشعارات لحظية",
    pushDescription: "احصل على تحديثات في الوقت الفعلي على جهازك المحمول.",
    emailNotifications: "إشعارات البريد الإلكتروني",
    newMessages: "رسائل جديدة من البائعين",
    quoteUpdates: "تحديثات على طلبات عروض الأسعار الخاصة بك",
    bookingConfirmations: "تأكيدات الحجز والتذكيرات",
    promotions: "العروض الترويجية والعروض الخاصة",
    dangerZone: "منطقة الخطر",
    dangerDescription: "هذه الإجراءات دائمة ولا يمكن التراجع عنها.",
    deleteAccount: "حذف حسابي",
  }
};

export default function ClientSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { userId } = useAuth();
  const { toast } = useToast();
  const [lang, setLang] = useState<'en' | 'fr' | 'ar'>('en');
  const t = translations[lang];

  return (
    <div className="space-y-8 max-w-4xl mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Card>
            <CardHeader>
                <CardTitle>{t.accountSettings}</CardTitle>
                <CardDescription>{t.manageAccount}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">{t.email}</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" disabled/>
                </div>
                 {userId && (
                    <ChangePasswordDialog userId={userId}>
                        <Button variant="outline">
                            <KeyRound className="mr-2 h-4 w-4" />
                            {t.changePassword}
                        </Button>
                    </ChangePasswordDialog>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>{t.appearanceSettings}</CardTitle>
                <CardDescription>{t.customizeAppearance}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-2">
                    <Label>{t.theme}</Label>
                    <div className="flex gap-2">
                        <Button variant={theme === 'light' ? 'default' : 'outline'} className="w-full justify-start gap-2" onClick={() => setTheme('light')}>
                            <Sun className="h-5 w-5" />
                            {t.light}
                        </Button>
                        <Button variant={theme === 'dark' ? 'default' : 'outline'} className="w-full justify-start gap-2" onClick={() => setTheme('dark')}>
                            <Moon className="h-5 w-5" />
                            {t.dark}
                        </Button>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="language">{t.language}</Label>
                     <Select defaultValue="en" onValueChange={(value: 'en' | 'fr' | 'ar') => setLang(value)}>
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
                <CardTitle>{t.notificationSettings}</CardTitle>
                <CardDescription>{t.howToNotify}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                        <span>{t.pushNotifications}</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                        {t.pushDescription}
                        </span>
                    </Label>
                    <Switch id="push-notifications" defaultChecked />
                </div>
                 <Separator />
                <div className="space-y-4">
                    <h3 className="text-md font-medium">{t.emailNotifications}</h3>
                    <div className="space-y-3">
                         <div className="flex items-center gap-3">
                            <Checkbox id="notify-messages" defaultChecked />
                            <Label htmlFor="notify-messages" className="font-normal">{t.newMessages}</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="notify-quotes" defaultChecked />
                            <Label htmlFor="notify-quotes" className="font-normal">{t.quoteUpdates}</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="notify-bookings" defaultChecked />
                            <Label htmlFor="notify-bookings" className="font-normal">{t.bookingConfirmations}</Label>
                        </div>
                         <div className="flex items-center gap-3">
                            <Checkbox id="notify-promotions" />
                            <Label htmlFor="notify-promotions" className="font-normal">{t.promotions}</Label>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">{t.dangerZone}</CardTitle>
                <CardDescription>{t.dangerDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">{t.deleteAccount}</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action is permanent and cannot be undone. This will permanently delete your account and remove all your data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => toast({ title: "Action Canceled", description: "Account deletion is a placeholder."})}>{t.deleteAccount}</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    </div>
  )
}
