/**
 * نظام إدارة المشتركين — Moshtarikeen Hub v2.0
 * لوحة تحكم إدارية متقدمة | بيانات محلية فقط (localStorage)
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Users, TrendingUp, Wallet, Search, LayoutDashboard, Settings,
  Bell, LogOut, CheckCircle2, AlertCircle, CreditCard, Phone, User,
  Shield, ClipboardList, Plus, Pencil, Trash2, X, Save, ChevronDown,
  Hash, Building2, UserPlus, ChevronLeft, ChevronRight, Activity,
  ArrowUpRight, ArrowDownRight, Clock, RefreshCw, Download, Filter,
  Eye, EyeOff, AlertTriangle, CheckCheck, Lock, Database, Calendar,
  FileText, Banknote, Star, PanelLeftClose, PanelLeftOpen, SlidersHorizontal,
  Globe, Cpu, BarChart3, Edit3, Type, CalendarClock, Sparkles, Zap, Layers,
  Crown, Rocket, TrendingDown, DollarSign, PieChart as PieChartIcon, LineChart,
  Moon, Sun, Command, FileDown, Upload, RotateCcw, HardDrive, PrinterIcon,
  ChevronUp, BarChart2, BookOpen, Keyboard, Film,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Subscriber {
  id: string;
  name: string;
  phone: string;
  iban: string;
  subscriptionAmount: number;
  profits: number;
  systemFees: number;
  systemAccount: string;
  walletAddress: string;
  bankName: string;
  joinDate: string;
  subscriberStatus: string;
  notes: string;
  currency: string;
  platform: string;
}

interface Operation {
  id: string;
  subscriberName: string;
  operation: string;
  amount: string;
  date: string;
  status: string;
}

interface Stats {
  totalSubscribers: string;
  totalProfits: string;
  activeSubscriptions: string;
  pendingRequests: string;
}

interface SystemConfig {
  sectionNames: {
    dashboard: string;
    admin: string;
    addOperations: string;
    addSubscriber: string;
    systemAdmin: string;
  };
  cardOverrides: {
    totalSubscribers: string;
    activeCount: string;
    totalProfits: string;
    completedOps: string;
    activeSubscriptions: string;
    totalSubsCount: string;
    pendingFees: string;
    activationOps: string;
  };
  queryCardOverrides: {
    totalSubscribers: string;
    activeCount: string;
    pendingFees: string;
  };
  institutionalText: string;
  systemDate: string;
}

// ─────────────────────────────────────────────────────────────
// World Currencies
// ─────────────────────────────────────────────────────────────

interface Currency {
  code: string;
  symbol: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
}

const WORLD_CURRENCIES: Currency[] = [
  // خليج وعرب
  { code: 'SAR', symbol: '﷼', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia' },
  { code: 'AED', symbol: 'د.إ', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', countryAr: 'الإمارات العربية المتحدة', countryEn: 'UAE' },
  { code: 'KWD', symbol: 'د.ك', nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar', countryAr: 'الكويت', countryEn: 'Kuwait' },
  { code: 'QAR', symbol: 'ر.ق', nameAr: 'ريال قطري', nameEn: 'Qatari Riyal', countryAr: 'قطر', countryEn: 'Qatar' },
  { code: 'BHD', symbol: 'د.ب', nameAr: 'دينار بحريني', nameEn: 'Bahraini Dinar', countryAr: 'البحرين', countryEn: 'Bahrain' },
  { code: 'OMR', symbol: 'ر.ع', nameAr: 'ريال عُماني', nameEn: 'Omani Rial', countryAr: 'عُمان', countryEn: 'Oman' },
  { code: 'EGP', symbol: 'ج.م', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound', countryAr: 'مصر', countryEn: 'Egypt' },
  { code: 'JOD', symbol: 'د.أ', nameAr: 'دينار أردني', nameEn: 'Jordanian Dinar', countryAr: 'الأردن', countryEn: 'Jordan' },
  { code: 'LBP', symbol: 'ل.ل', nameAr: 'ليرة لبنانية', nameEn: 'Lebanese Pound', countryAr: 'لبنان', countryEn: 'Lebanon' },
  { code: 'IQD', symbol: 'ع.د', nameAr: 'دينار عراقي', nameEn: 'Iraqi Dinar', countryAr: 'العراق', countryEn: 'Iraq' },
  { code: 'DZD', symbol: 'دج', nameAr: 'دينار جزائري', nameEn: 'Algerian Dinar', countryAr: 'الجزائر', countryEn: 'Algeria' },
  { code: 'MAD', symbol: 'د.م', nameAr: 'درهم مغربي', nameEn: 'Moroccan Dirham', countryAr: 'المغرب', countryEn: 'Morocco' },
  { code: 'TND', symbol: 'د.ت', nameAr: 'دينار تونسي', nameEn: 'Tunisian Dinar', countryAr: 'تونس', countryEn: 'Tunisia' },
  { code: 'LYD', symbol: 'ل.د', nameAr: 'دينار ليبي', nameEn: 'Libyan Dinar', countryAr: 'ليبيا', countryEn: 'Libya' },
  { code: 'SDG', symbol: 'ج.س', nameAr: 'جنيه سوداني', nameEn: 'Sudanese Pound', countryAr: 'السودان', countryEn: 'Sudan' },
  { code: 'SYP', symbol: 'ل.س', nameAr: 'ليرة سورية', nameEn: 'Syrian Pound', countryAr: 'سوريا', countryEn: 'Syria' },
  { code: 'YER', symbol: 'ر.ي', nameAr: 'ريال يمني', nameEn: 'Yemeni Rial', countryAr: 'اليمن', countryEn: 'Yemen' },
  { code: 'MRU', symbol: 'أ.م', nameAr: 'أوقية موريتانية', nameEn: 'Mauritanian Ouguiya', countryAr: 'موريتانيا', countryEn: 'Mauritania' },
  { code: 'SOS', symbol: 'Sh', nameAr: 'شلن صومالي', nameEn: 'Somali Shilling', countryAr: 'الصومال', countryEn: 'Somalia' },
  { code: 'DJF', symbol: 'Fdj', nameAr: 'فرنك جيبوتي', nameEn: 'Djiboutian Franc', countryAr: 'جيبوتي', countryEn: 'Djibouti' },
  { code: 'KMF', symbol: 'CF', nameAr: 'فرنك جزر القمر', nameEn: 'Comorian Franc', countryAr: 'جزر القمر', countryEn: 'Comoros' },
  // أوروبا
  { code: 'USD', symbol: '$', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', countryAr: 'الولايات المتحدة', countryEn: 'United States' },
  { code: 'EUR', symbol: '€', nameAr: 'يورو', nameEn: 'Euro', countryAr: 'منطقة اليورو', countryEn: 'Eurozone' },
  { code: 'GBP', symbol: '£', nameAr: 'جنيه إسترليني', nameEn: 'British Pound', countryAr: 'المملكة المتحدة', countryEn: 'United Kingdom' },
  { code: 'CHF', symbol: 'Fr', nameAr: 'فرنك سويسري', nameEn: 'Swiss Franc', countryAr: 'سويسرا', countryEn: 'Switzerland' },
  { code: 'SEK', symbol: 'kr', nameAr: 'كرون سويدي', nameEn: 'Swedish Krona', countryAr: 'السويد', countryEn: 'Sweden' },
  { code: 'NOK', symbol: 'kr', nameAr: 'كرون نرويجي', nameEn: 'Norwegian Krone', countryAr: 'النرويج', countryEn: 'Norway' },
  { code: 'DKK', symbol: 'kr', nameAr: 'كرون دنماركي', nameEn: 'Danish Krone', countryAr: 'الدنمارك', countryEn: 'Denmark' },
  { code: 'PLN', symbol: 'zł', nameAr: 'زلوتي بولندي', nameEn: 'Polish Złoty', countryAr: 'بولندا', countryEn: 'Poland' },
  { code: 'CZK', symbol: 'Kč', nameAr: 'كورونا تشيكية', nameEn: 'Czech Koruna', countryAr: 'التشيك', countryEn: 'Czech Republic' },
  { code: 'HUF', symbol: 'Ft', nameAr: 'فورنت مجري', nameEn: 'Hungarian Forint', countryAr: 'المجر', countryEn: 'Hungary' },
  { code: 'RON', symbol: 'lei', nameAr: 'ليو روماني', nameEn: 'Romanian Leu', countryAr: 'رومانيا', countryEn: 'Romania' },
  { code: 'BGN', symbol: 'лв', nameAr: 'ليف بلغاري', nameEn: 'Bulgarian Lev', countryAr: 'بلغاريا', countryEn: 'Bulgaria' },
  { code: 'HRK', symbol: 'kn', nameAr: 'كونا كرواتية', nameEn: 'Croatian Kuna', countryAr: 'كرواتيا', countryEn: 'Croatia' },
  { code: 'RUB', symbol: '₽', nameAr: 'روبل روسي', nameEn: 'Russian Ruble', countryAr: 'روسيا', countryEn: 'Russia' },
  { code: 'UAH', symbol: '₴', nameAr: 'هريفنيا أوكرانية', nameEn: 'Ukrainian Hryvnia', countryAr: 'أوكرانيا', countryEn: 'Ukraine' },
  { code: 'TRY', symbol: '₺', nameAr: 'ليرة تركية', nameEn: 'Turkish Lira', countryAr: 'تركيا', countryEn: 'Turkey' },
  { code: 'ISK', symbol: 'kr', nameAr: 'كرون أيسلندي', nameEn: 'Icelandic Krona', countryAr: 'أيسلندا', countryEn: 'Iceland' },
  { code: 'HKD', symbol: 'HK$', nameAr: 'دولار هونغ كونغ', nameEn: 'Hong Kong Dollar', countryAr: 'هونغ كونغ', countryEn: 'Hong Kong' },
  { code: 'MKD', symbol: 'ден', nameAr: 'دينار مقدوني', nameEn: 'Macedonian Denar', countryAr: 'مقدونيا الشمالية', countryEn: 'North Macedonia' },
  { code: 'RSD', symbol: 'дин', nameAr: 'دينار صربي', nameEn: 'Serbian Dinar', countryAr: 'صربيا', countryEn: 'Serbia' },
  { code: 'ALL', symbol: 'L', nameAr: 'ليك ألباني', nameEn: 'Albanian Lek', countryAr: 'ألبانيا', countryEn: 'Albania' },
  { code: 'BAM', symbol: 'KM', nameAr: 'مارك بوسني', nameEn: 'Bosnian Mark', countryAr: 'البوسنة والهرسك', countryEn: 'Bosnia' },
  { code: 'MDL', symbol: 'L', nameAr: 'لي مولدوفي', nameEn: 'Moldovan Leu', countryAr: 'مولدوفا', countryEn: 'Moldova' },
  { code: 'GEL', symbol: '₾', nameAr: 'لاري جورجي', nameEn: 'Georgian Lari', countryAr: 'جورجيا', countryEn: 'Georgia' },
  { code: 'AMD', symbol: '֏', nameAr: 'درام أرميني', nameEn: 'Armenian Dram', countryAr: 'أرمينيا', countryEn: 'Armenia' },
  { code: 'AZN', symbol: '₼', nameAr: 'مانات أذربيجاني', nameEn: 'Azerbaijani Manat', countryAr: 'أذربيجان', countryEn: 'Azerbaijan' },
  { code: 'BYN', symbol: 'Br', nameAr: 'روبل بيلاروسي', nameEn: 'Belarusian Ruble', countryAr: 'بيلاروسيا', countryEn: 'Belarus' },
  // آسيا
  { code: 'JPY', symbol: '¥', nameAr: 'ين ياباني', nameEn: 'Japanese Yen', countryAr: 'اليابان', countryEn: 'Japan' },
  { code: 'CNY', symbol: '¥', nameAr: 'يوان صيني', nameEn: 'Chinese Yuan', countryAr: 'الصين', countryEn: 'China' },
  { code: 'INR', symbol: '₹', nameAr: 'روبية هندية', nameEn: 'Indian Rupee', countryAr: 'الهند', countryEn: 'India' },
  { code: 'KRW', symbol: '₩', nameAr: 'ووون كوري', nameEn: 'South Korean Won', countryAr: 'كوريا الجنوبية', countryEn: 'South Korea' },
  { code: 'SGD', symbol: 'S$', nameAr: 'دولار سنغافوري', nameEn: 'Singapore Dollar', countryAr: 'سنغافورة', countryEn: 'Singapore' },
  { code: 'MYR', symbol: 'RM', nameAr: 'رينغيت ماليزي', nameEn: 'Malaysian Ringgit', countryAr: 'ماليزيا', countryEn: 'Malaysia' },
  { code: 'THB', symbol: '฿', nameAr: 'بات تايلاندي', nameEn: 'Thai Baht', countryAr: 'تايلاند', countryEn: 'Thailand' },
  { code: 'IDR', symbol: 'Rp', nameAr: 'روبية إندونيسية', nameEn: 'Indonesian Rupiah', countryAr: 'إندونيسيا', countryEn: 'Indonesia' },
  { code: 'PHP', symbol: '₱', nameAr: 'بيزو فلبيني', nameEn: 'Philippine Peso', countryAr: 'الفلبين', countryEn: 'Philippines' },
  { code: 'VND', symbol: '₫', nameAr: 'دونغ فيتنامي', nameEn: 'Vietnamese Dong', countryAr: 'فيتنام', countryEn: 'Vietnam' },
  { code: 'PKR', symbol: '₨', nameAr: 'روبية باكستانية', nameEn: 'Pakistani Rupee', countryAr: 'باكستان', countryEn: 'Pakistan' },
  { code: 'BDT', symbol: '৳', nameAr: 'تاكا بنغلاديشية', nameEn: 'Bangladeshi Taka', countryAr: 'بنغلاديش', countryEn: 'Bangladesh' },
  { code: 'LKR', symbol: '₨', nameAr: 'روبية سريلانكية', nameEn: 'Sri Lankan Rupee', countryAr: 'سريلانكا', countryEn: 'Sri Lanka' },
  { code: 'NPR', symbol: '₨', nameAr: 'روبية نيبالية', nameEn: 'Nepalese Rupee', countryAr: 'نيبال', countryEn: 'Nepal' },
  { code: 'MMK', symbol: 'K', nameAr: 'كيات ميانماري', nameEn: 'Myanmar Kyat', countryAr: 'ميانمار', countryEn: 'Myanmar' },
  { code: 'KHR', symbol: '៛', nameAr: 'ريال كمبودي', nameEn: 'Cambodian Riel', countryAr: 'كمبوديا', countryEn: 'Cambodia' },
  { code: 'LAK', symbol: '₭', nameAr: 'كيب لاوسي', nameEn: 'Lao Kip', countryAr: 'لاوس', countryEn: 'Laos' },
  { code: 'MNT', symbol: '₮', nameAr: 'توغروغ منغولي', nameEn: 'Mongolian Tögrög', countryAr: 'منغوليا', countryEn: 'Mongolia' },
  { code: 'TWD', symbol: 'NT$', nameAr: 'دولار تايواني', nameEn: 'Taiwan Dollar', countryAr: 'تايوان', countryEn: 'Taiwan' },
  { code: 'MOP', symbol: 'P', nameAr: 'باتاكا ماكاو', nameEn: 'Macanese Pataca', countryAr: 'ماكاو', countryEn: 'Macao' },
  { code: 'BTN', symbol: 'Nu', nameAr: 'نغولتروم بوتاني', nameEn: 'Bhutanese Ngultrum', countryAr: 'بوتان', countryEn: 'Bhutan' },
  { code: 'MVR', symbol: 'Rf', nameAr: 'روفيا مالديفية', nameEn: 'Maldivian Rufiyaa', countryAr: 'المالديف', countryEn: 'Maldives' },
  { code: 'KZT', symbol: '₸', nameAr: 'تنغي كازاخستاني', nameEn: 'Kazakhstani Tenge', countryAr: 'كازاخستان', countryEn: 'Kazakhstan' },
  { code: 'UZS', symbol: 'лв', nameAr: 'سوم أوزبكستاني', nameEn: 'Uzbekistani Som', countryAr: 'أوزبكستان', countryEn: 'Uzbekistan' },
  { code: 'KGS', symbol: 'лв', nameAr: 'سوم قيرغيزستاني', nameEn: 'Kyrgyzstani Som', countryAr: 'قيرغيزستان', countryEn: 'Kyrgyzstan' },
  { code: 'TJS', symbol: 'SM', nameAr: 'سوموني طاجيكستاني', nameEn: 'Tajikistani Somoni', countryAr: 'طاجيكستان', countryEn: 'Tajikistan' },
  { code: 'TMT', symbol: 'T', nameAr: 'مانات تركمانستاني', nameEn: 'Turkmenistani Manat', countryAr: 'تركمانستان', countryEn: 'Turkmenistan' },
  { code: 'AFN', symbol: '؋', nameAr: 'أفغاني', nameEn: 'Afghan Afghani', countryAr: 'أفغانستان', countryEn: 'Afghanistan' },
  { code: 'IRR', symbol: '﷼', nameAr: 'ريال إيراني', nameEn: 'Iranian Rial', countryAr: 'إيران', countryEn: 'Iran' },
  { code: 'ILS', symbol: '₪', nameAr: 'شيكل إسرائيلي', nameEn: 'Israeli Shekel', countryAr: 'إسرائيل', countryEn: 'Israel' },
  // أمريكا
  { code: 'CAD', symbol: 'CA$', nameAr: 'دولار كندي', nameEn: 'Canadian Dollar', countryAr: 'كندا', countryEn: 'Canada' },
  { code: 'MXN', symbol: 'MX$', nameAr: 'بيزو مكسيكي', nameEn: 'Mexican Peso', countryAr: 'المكسيك', countryEn: 'Mexico' },
  { code: 'BRL', symbol: 'R$', nameAr: 'ريال برازيلي', nameEn: 'Brazilian Real', countryAr: 'البرازيل', countryEn: 'Brazil' },
  { code: 'ARS', symbol: '$', nameAr: 'بيزو أرجنتيني', nameEn: 'Argentine Peso', countryAr: 'الأرجنتين', countryEn: 'Argentina' },
  { code: 'CLP', symbol: '$', nameAr: 'بيزو تشيلي', nameEn: 'Chilean Peso', countryAr: 'تشيلي', countryEn: 'Chile' },
  { code: 'COP', symbol: '$', nameAr: 'بيزو كولومبي', nameEn: 'Colombian Peso', countryAr: 'كولومبيا', countryEn: 'Colombia' },
  { code: 'PEN', symbol: 'S/', nameAr: 'سول بيروفي', nameEn: 'Peruvian Sol', countryAr: 'بيرو', countryEn: 'Peru' },
  { code: 'UYU', symbol: '$U', nameAr: 'بيزو أوروغوياني', nameEn: 'Uruguayan Peso', countryAr: 'أوروغواي', countryEn: 'Uruguay' },
  { code: 'BOB', symbol: 'Bs.', nameAr: 'بوليفيانو بوليفي', nameEn: 'Bolivian Boliviano', countryAr: 'بوليفيا', countryEn: 'Bolivia' },
  { code: 'PYG', symbol: '₲', nameAr: 'غواراني باراغوياني', nameEn: 'Paraguayan Guaraní', countryAr: 'باراغواي', countryEn: 'Paraguay' },
  { code: 'VES', symbol: 'Bs.S', nameAr: 'بوليفار فنزويلي', nameEn: 'Venezuelan Bolívar', countryAr: 'فنزويلا', countryEn: 'Venezuela' },
  { code: 'GTQ', symbol: 'Q', nameAr: 'كيتسال غواتيمالي', nameEn: 'Guatemalan Quetzal', countryAr: 'غواتيمالا', countryEn: 'Guatemala' },
  { code: 'HNL', symbol: 'L', nameAr: 'ليمبيرا هندوراسي', nameEn: 'Honduran Lempira', countryAr: 'هندوراس', countryEn: 'Honduras' },
  { code: 'CRC', symbol: '₡', nameAr: 'كولون كوستاريكي', nameEn: 'Costa Rican Colón', countryAr: 'كوستاريكا', countryEn: 'Costa Rica' },
  { code: 'DOP', symbol: 'RD$', nameAr: 'بيزو دومينيكاني', nameEn: 'Dominican Peso', countryAr: 'الدومينيكان', countryEn: 'Dominican Republic' },
  { code: 'CUP', symbol: '$', nameAr: 'بيزو كوبي', nameEn: 'Cuban Peso', countryAr: 'كوبا', countryEn: 'Cuba' },
  { code: 'JMD', symbol: 'J$', nameAr: 'دولار جامايكي', nameEn: 'Jamaican Dollar', countryAr: 'جامايكا', countryEn: 'Jamaica' },
  { code: 'TTD', symbol: 'TT$', nameAr: 'دولار ترينيداد', nameEn: 'Trinidad Dollar', countryAr: 'ترينيداد وتوباغو', countryEn: 'Trinidad & Tobago' },
  // أفريقيا
  { code: 'ZAR', symbol: 'R', nameAr: 'راند جنوب أفريقي', nameEn: 'South African Rand', countryAr: 'جنوب أفريقيا', countryEn: 'South Africa' },
  { code: 'NGN', symbol: '₦', nameAr: 'نايرا نيجيرية', nameEn: 'Nigerian Naira', countryAr: 'نيجيريا', countryEn: 'Nigeria' },
  { code: 'GHS', symbol: '₵', nameAr: 'سيدي غاني', nameEn: 'Ghanaian Cedi', countryAr: 'غانا', countryEn: 'Ghana' },
  { code: 'KES', symbol: 'KSh', nameAr: 'شلن كيني', nameEn: 'Kenyan Shilling', countryAr: 'كينيا', countryEn: 'Kenya' },
  { code: 'ETB', symbol: 'Br', nameAr: 'بير إثيوبي', nameEn: 'Ethiopian Birr', countryAr: 'إثيوبيا', countryEn: 'Ethiopia' },
  { code: 'TZS', symbol: 'TSh', nameAr: 'شلن تنزاني', nameEn: 'Tanzanian Shilling', countryAr: 'تنزانيا', countryEn: 'Tanzania' },
  { code: 'UGX', symbol: 'USh', nameAr: 'شلن أوغندي', nameEn: 'Ugandan Shilling', countryAr: 'أوغندا', countryEn: 'Uganda' },
  { code: 'RWF', symbol: 'RF', nameAr: 'فرنك رواندي', nameEn: 'Rwandan Franc', countryAr: 'رواندا', countryEn: 'Rwanda' },
  { code: 'XOF', symbol: 'CFA', nameAr: 'فرنك أفريقي غرب', nameEn: 'West African CFA', countryAr: 'غرب أفريقيا', countryEn: 'West Africa' },
  { code: 'XAF', symbol: 'FCFA', nameAr: 'فرنك أفريقي وسط', nameEn: 'Central African CFA', countryAr: 'وسط أفريقيا', countryEn: 'Central Africa' },
  { code: 'MZN', symbol: 'MT', nameAr: 'ميتيكال موزمبيقي', nameEn: 'Mozambican Metical', countryAr: 'موزمبيق', countryEn: 'Mozambique' },
  { code: 'ZMW', symbol: 'ZK', nameAr: 'كواشا زامبي', nameEn: 'Zambian Kwacha', countryAr: 'زامبيا', countryEn: 'Zambia' },
  { code: 'BWP', symbol: 'P', nameAr: 'بولا بوتسواني', nameEn: 'Botswanan Pula', countryAr: 'بوتسوانا', countryEn: 'Botswana' },
  { code: 'MUR', symbol: '₨', nameAr: 'روبية موريشيوسية', nameEn: 'Mauritian Rupee', countryAr: 'موريشيوس', countryEn: 'Mauritius' },
  { code: 'SCR', symbol: '₨', nameAr: 'روبية سيشيلية', nameEn: 'Seychellois Rupee', countryAr: 'سيشيل', countryEn: 'Seychelles' },
  { code: 'MGA', symbol: 'Ar', nameAr: 'أرياري مدغشقري', nameEn: 'Malagasy Ariary', countryAr: 'مدغشقر', countryEn: 'Madagascar' },
  { code: 'AOA', symbol: 'Kz', nameAr: 'كوانزا أنغولي', nameEn: 'Angolan Kwanza', countryAr: 'أنغولا', countryEn: 'Angola' },
  { code: 'CDF', symbol: 'FC', nameAr: 'فرنك كونغولي', nameEn: 'Congolese Franc', countryAr: 'الكونغو', countryEn: 'Congo' },
  { code: 'GMD', symbol: 'D', nameAr: 'دالاسي غامبي', nameEn: 'Gambian Dalasi', countryAr: 'غامبيا', countryEn: 'Gambia' },
  { code: 'SLL', symbol: 'Le', nameAr: 'ليون سيراليوني', nameEn: 'Sierra Leonean Leone', countryAr: 'سيراليون', countryEn: 'Sierra Leone' },
  { code: 'GNF', symbol: 'FG', nameAr: 'فرنك غيني', nameEn: 'Guinean Franc', countryAr: 'غينيا', countryEn: 'Guinea' },
  { code: 'MWK', symbol: 'MK', nameAr: 'كواشا مالاوية', nameEn: 'Malawian Kwacha', countryAr: 'مالاوي', countryEn: 'Malawi' },
  { code: 'ZWL', symbol: 'Z$', nameAr: 'دولار زيمبابوي', nameEn: 'Zimbabwean Dollar', countryAr: 'زيمبابوي', countryEn: 'Zimbabwe' },
  // أوقيانوسيا
  { code: 'AUD', symbol: 'A$', nameAr: 'دولار أسترالي', nameEn: 'Australian Dollar', countryAr: 'أستراليا', countryEn: 'Australia' },
  { code: 'NZD', symbol: 'NZ$', nameAr: 'دولار نيوزيلندي', nameEn: 'New Zealand Dollar', countryAr: 'نيوزيلندا', countryEn: 'New Zealand' },
  { code: 'PGK', symbol: 'K', nameAr: 'كينا بابوا نيوغينيا', nameEn: 'Papua New Guinean Kina', countryAr: 'بابوا غينيا الجديدة', countryEn: 'Papua New Guinea' },
  { code: 'FJD', symbol: 'FJ$', nameAr: 'دولار فيجي', nameEn: 'Fijian Dollar', countryAr: 'فيجي', countryEn: 'Fiji' },
  { code: 'SBD', symbol: 'SI$', nameAr: 'دولار جزر سليمان', nameEn: 'Solomon Islands Dollar', countryAr: 'جزر سليمان', countryEn: 'Solomon Islands' },
  { code: 'TOP', symbol: 'T$', nameAr: 'بانغا تونغي', nameEn: 'Tongan Paʻanga', countryAr: 'تونغا', countryEn: 'Tonga' },
  { code: 'WST', symbol: 'WS$', nameAr: 'تالا ساموا', nameEn: 'Samoan Tālā', countryAr: 'ساموا', countryEn: 'Samoa' },
];

// ─────────────────────────────────────────────────────────────
// Trading Platforms
// ─────────────────────────────────────────────────────────────

interface TradingPlatform {
  name: string;
  type: 'crypto' | 'forex';
  abbr: string;
  color: string;
}

const TRADING_PLATFORMS: TradingPlatform[] = [
  // ═══ منصات الكريبتو
  { name: 'Binance', type: 'crypto', abbr: 'BIN', color: 'bg-yellow-500' },
  { name: 'Bybit', type: 'crypto', abbr: 'BYB', color: 'bg-orange-500' },
  { name: 'OKX', type: 'crypto', abbr: 'OKX', color: 'bg-slate-700' },
  { name: 'KuCoin', type: 'crypto', abbr: 'KUC', color: 'bg-green-600' },
  { name: 'Kraken', type: 'crypto', abbr: 'KRK', color: 'bg-purple-700' },
  { name: 'Coinbase', type: 'crypto', abbr: 'CB', color: 'bg-blue-600' },
  { name: 'Bitfinex', type: 'crypto', abbr: 'BFX', color: 'bg-green-700' },
  { name: 'HTX (Huobi)', type: 'crypto', abbr: 'HTX', color: 'bg-blue-500' },
  { name: 'Gate.io', type: 'crypto', abbr: 'GIO', color: 'bg-red-600' },
  { name: 'MEXC', type: 'crypto', abbr: 'MEX', color: 'bg-blue-400' },
  { name: 'Bitget', type: 'crypto', abbr: 'BTG', color: 'bg-cyan-600' },
  { name: 'Crypto.com', type: 'crypto', abbr: 'CDC', color: 'bg-blue-800' },
  { name: 'Gemini', type: 'crypto', abbr: 'GEM', color: 'bg-sky-600' },
  { name: 'Bitstamp', type: 'crypto', abbr: 'BST', color: 'bg-green-800' },
  { name: 'Phemex', type: 'crypto', abbr: 'PHX', color: 'bg-purple-600' },
  { name: 'BingX', type: 'crypto', abbr: 'BNX', color: 'bg-blue-700' },
  { name: 'CoinEx', type: 'crypto', abbr: 'CEX', color: 'bg-green-500' },
  { name: 'Bitrue', type: 'crypto', abbr: 'BTR', color: 'bg-red-500' },
  { name: 'Deribit', type: 'crypto', abbr: 'DRB', color: 'bg-indigo-600' },
  { name: 'BitMEX', type: 'crypto', abbr: 'BMX', color: 'bg-slate-800' },
  { name: 'Poloniex', type: 'crypto', abbr: 'POL', color: 'bg-teal-600' },
  { name: 'LBank', type: 'crypto', abbr: 'LBK', color: 'bg-violet-600' },
  { name: 'AscendEX', type: 'crypto', abbr: 'ASC', color: 'bg-cyan-700' },
  { name: 'WazirX', type: 'crypto', abbr: 'WZX', color: 'bg-blue-500' },
  { name: 'CoinDCX', type: 'crypto', abbr: 'CDX', color: 'bg-blue-600' },
  { name: 'Uniswap', type: 'crypto', abbr: 'UNI', color: 'bg-pink-600' },
  { name: 'PancakeSwap', type: 'crypto', abbr: 'CAKE', color: 'bg-yellow-600' },
  { name: 'SushiSwap', type: 'crypto', abbr: 'SUSHI', color: 'bg-rose-600' },
  { name: '1inch', type: 'crypto', abbr: '1IN', color: 'bg-red-700' },
  { name: 'DigiFinex', type: 'crypto', abbr: 'DGF', color: 'bg-blue-500' },
  { name: 'ProBit', type: 'crypto', abbr: 'PRB', color: 'bg-orange-600' },
  { name: 'Nominex', type: 'crypto', abbr: 'NMX', color: 'bg-emerald-600' },
  { name: 'Latoken', type: 'crypto', abbr: 'LAT', color: 'bg-slate-600' },
  { name: 'ZT Exchange', type: 'crypto', abbr: 'ZT', color: 'bg-red-600' },
  // ═══ منصات الفوركس
  { name: 'MetaTrader 4', type: 'forex', abbr: 'MT4', color: 'bg-blue-700' },
  { name: 'MetaTrader 5', type: 'forex', abbr: 'MT5', color: 'bg-blue-800' },
  { name: 'cTrader', type: 'forex', abbr: 'cTR', color: 'bg-green-700' },
  { name: 'Exness', type: 'forex', abbr: 'EXN', color: 'bg-green-600' },
  { name: 'IC Markets', type: 'forex', abbr: 'ICM', color: 'bg-blue-600' },
  { name: 'XM', type: 'forex', abbr: 'XM', color: 'bg-orange-600' },
  { name: 'Pepperstone', type: 'forex', abbr: 'PPS', color: 'bg-green-800' },
  { name: 'FXTM (ForexTime)', type: 'forex', abbr: 'FXTM', color: 'bg-red-600' },
  { name: 'AvaTrade', type: 'forex', abbr: 'AVA', color: 'bg-blue-500' },
  { name: 'FP Markets', type: 'forex', abbr: 'FPM', color: 'bg-blue-700' },
  { name: 'HotForex (HFM)', type: 'forex', abbr: 'HFM', color: 'bg-orange-500' },
  { name: 'OctaFX', type: 'forex', abbr: 'OCT', color: 'bg-yellow-600' },
  { name: 'OANDA', type: 'forex', abbr: 'OAN', color: 'bg-red-700' },
  { name: 'IG Group', type: 'forex', abbr: 'IG', color: 'bg-blue-600' },
  { name: 'CMC Markets', type: 'forex', abbr: 'CMC', color: 'bg-slate-700' },
  { name: 'Tickmill', type: 'forex', abbr: 'TKM', color: 'bg-teal-700' },
  { name: 'FXCM', type: 'forex', abbr: 'FXCM', color: 'bg-blue-800' },
  { name: 'ThinkMarkets', type: 'forex', abbr: 'THK', color: 'bg-cyan-700' },
  { name: 'Vantage FX', type: 'forex', abbr: 'VFX', color: 'bg-slate-600' },
  { name: 'FBS', type: 'forex', abbr: 'FBS', color: 'bg-orange-600' },
  { name: 'Forex4you', type: 'forex', abbr: 'F4U', color: 'bg-green-600' },
  { name: 'InstaForex', type: 'forex', abbr: 'IFX', color: 'bg-red-600' },
  { name: 'RoboForex', type: 'forex', abbr: 'RBF', color: 'bg-blue-500' },
  { name: 'FXPro', type: 'forex', abbr: 'FXP', color: 'bg-indigo-600' },
  { name: 'Admiral Markets', type: 'forex', abbr: 'ADM', color: 'bg-red-700' },
  { name: 'BlackBull Markets', type: 'forex', abbr: 'BBM', color: 'bg-slate-800' },
  { name: 'EightCap', type: 'forex', abbr: '8CP', color: 'bg-blue-600' },
  { name: 'Fusion Markets', type: 'forex', abbr: 'FUS', color: 'bg-purple-600' },
  { name: 'TMGM', type: 'forex', abbr: 'TMG', color: 'bg-slate-700' },
  { name: 'Spreadex', type: 'forex', abbr: 'SPX', color: 'bg-green-700' },
  { name: 'Axiory', type: 'forex', abbr: 'AXR', color: 'bg-blue-700' },
  { name: 'Amarkets', type: 'forex', abbr: 'AMK', color: 'bg-orange-700' },
  { name: 'NordFX', type: 'forex', abbr: 'NFX', color: 'bg-blue-800' },
  { name: 'JustForex', type: 'forex', abbr: 'JFX', color: 'bg-green-700' },
  { name: 'Darwinex', type: 'forex', abbr: 'DWX', color: 'bg-teal-600' },
  { name: 'Fortrade', type: 'forex', abbr: 'FTD', color: 'bg-blue-600' },
  { name: 'BDSwiss', type: 'forex', abbr: 'BDS', color: 'bg-cyan-600' },
  { name: 'XTB', type: 'forex', abbr: 'XTB', color: 'bg-blue-700' },
  { name: 'Trade.com', type: 'forex', abbr: 'TRC', color: 'bg-green-600' },
  { name: 'Capital.com', type: 'forex', abbr: 'CAP', color: 'bg-blue-500' },
  { name: 'ATFX', type: 'forex', abbr: 'ATF', color: 'bg-red-600' },
  { name: 'Scope Markets', type: 'forex', abbr: 'SCO', color: 'bg-slate-600' },
];

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const OPERATION_TYPES = ['توزيع ارباح', 'اشتراك جديد', 'تنشيط النظام', 'سحب ارباح', 'تحويل'];
const OPERATION_STATUSES = ['مكتمل', 'اشتراك جديد', 'تنشيط النظام', 'قيد المعالجة'];
const SUBSCRIBER_STATUSES = ['نشط', 'مشترك جديد', 'رسوم مستحقة', 'توزيع أرباح', 'معلق', 'موقوف'];

const GULF_BANKS: Record<string, string[]> = {
  'المملكة العربية السعودية': [
    'البنك الأهلي السعودي (SNB)', 'مصرف الراجحي', 'بنك الرياض',
    'البنك السعودي الفرنسي (BSF)', 'البنك السعودي البريطاني (SABB)',
    'مصرف الإنماء', 'بنك البلاد', 'بنك الجزيرة',
    'البنك العربي الوطني', 'بنك ساب', 'بنك الخليج', 'البنك السعودي للاستثمار (SAIB)',
  ],
  'الإمارات العربية المتحدة': [
    'بنك الإمارات دبي الوطني (ENBD)', 'بنك أبوظبي الأول (FAB)',
    'بنك أبوظبي التجاري (ADCB)', 'مصرف الإمارات الإسلامي',
    'بنك دبي الإسلامي (DIB)', 'بنك المشرق', 'بنك الفجيرة الوطني',
    'بنك رأس الخيمة الوطني (RAKBANK)', 'بنك الاتحاد الوطني',
    'بنك دبي التجاري', 'بنك الشارقة الإسلامي', 'بنك نور',
  ],
  'قطر': [
    'بنك قطر الوطني (QNB)', 'المصرف التجاري القطري', 'بنك الدوحة',
    'بنك أهلي قطر', 'بنك الريان', 'مصرف قطر الإسلامي (QIB)',
    'بنك قطر الدولي الإسلامي', 'بنك برقان',
  ],
  'الكويت': [
    'بنك الكويت الوطني (NBK)', 'بيت التمويل الكويتي (بيتك)',
    'البنك التجاري الكويتي', 'بنك الخليج', 'بنك برقان',
  ],
  'البحرين': [
    'بنك البحرين الوطني', 'بنك أهلي البحرين',
    'مصرف الراجحي البحرين', 'بنك الكويت والبحرين',
  ],
  'عُمان': [
    'بنك مسقط', 'بنك ظفار', 'بنك صحار',
    'البنك الوطني العُماني', 'بنك عُمان العربي', 'بنك نزوى',
  ],
};

const ALL_BANKS_FLAT = Object.values(GULF_BANKS).flat();

const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  sectionNames: {
    dashboard: 'النظام الإداري',
    admin: 'نظام الإستعلام عن الأرباح',
    addOperations: 'سجل العمليات',
    addSubscriber: 'إضافة مشترك',
    systemAdmin: 'لوحة إدارة النظام',
  },
  cardOverrides: {
    totalSubscribers: '',
    activeCount: '',
    totalProfits: '',
    completedOps: '',
    activeSubscriptions: '',
    totalSubsCount: '',
    pendingFees: '',
    activationOps: '',
  },
  queryCardOverrides: {
    totalSubscribers: '',
    activeCount: '',
    pendingFees: '',
  },
  institutionalText: '',
  systemDate: '',
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function uid(): string { return Math.random().toString(36).slice(2, 11); }
function todayStr(): string { return new Date().toISOString().split('T')[0]; }
function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomAmount(min: number, max: number): number { return Math.floor((Math.random() * (max - min) + min) / 100) * 100; }
function randomDate(y1: number, y2: number): string {
  const y = randomInt(y1, y2);
  const m = String(randomInt(1, 12)).padStart(2, '0');
  const d = String(randomInt(1, 28)).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function randomPhone(): string {
  return `0${randomFrom(['5', '55', '50', '56', '53'])}${Array.from({ length: 7 }, () => randomInt(0, 9)).join('')}`;
}
function randomIBAN(): string {
  const code = randomFrom(['SA', 'AE', 'QA', 'KW']);
  return `${code}${Array.from({ length: 20 }, () => randomInt(0, 9)).join('')}`;
}

// ─────────────────────────────────────────────────────────────
// Initial Data
// ─────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'محمد','أحمد','عبدالله','خالد','فهد','سعد','علي','عمر','سلطان','ناصر',
  'بندر','تركي','فيصل','وليد','ماجد','حمد','طلال','عبدالعزيز','راشد','مشعل',
  'بدر','ثامر','ياسر','صالح','هاني','نواف','عبدالرحمن','حسين','جابر','ممدوح',
  'رياض','عادل','باسم','كريم','عصام','نبيل','سامي','فارس','زياد','يوسف',
  'منصور','وائل','شريف','مازن','لؤي','طارق','هيثم','مروان','سامر','بلال',
  'أيمن','إبراهيم','إسماعيل','إياد','أمجد','أنس','بشار','جمال','حازم','حسن',
];

const LAST_NAMES = [
  'العتيبي','الغامدي','الزهراني','القحطاني','الشهري','الدوسري','المطيري',
  'الحربي','السبيعي','الرشيدي','العنزي','الشمري','الذيابي','العجمي',
  'المالكي','الراشد','الهاجري','السهلي','الخالدي','الجابري','المنصوري',
  'الكعبي','البلوشي','المزروعي','الظاهري','الفارسي','النعيمي','الهاشمي',
  'العمري','السعدي','البدر','الربيعي','الفيفي','الأسمري','الحازمي',
  'الزبيدي','المحمدي','الصبيحي','الحمداني','الأنصاري','الكندي','السيابي',
  'الوهيبي','الحجري','الريامي','العلوي','الصقري','البوسعيدي','العامري',
];

function buildInitialSubscribers(count: number): Subscriber[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const sa = randomAmount(5000, 60000);
    const pr = randomAmount(500, 20000);
    const sf = Math.random() > 0.6 ? randomAmount(200, 3000) : 0;
    return {
      id: uid(),
      name: `${firstName} ${lastName}`,
      phone: randomPhone(),
      iban: randomIBAN(),
      subscriptionAmount: sa,
      profits: pr,
      systemFees: sf,
      systemAccount: `SYS-${String(1000 + i).padStart(6, '0')}`,
      walletAddress: Math.random() > 0.5
        ? `0x${Array.from({ length: 40 }, () => '0123456789abcdef'[randomInt(0, 15)]).join('')}`
        : '',
      bankName: randomFrom(ALL_BANKS_FLAT),
      joinDate: randomDate(2020, 2024),
      subscriberStatus: randomFrom(SUBSCRIBER_STATUSES),
      notes: '',
      currency: randomFrom(['SAR', 'AED', 'USD', 'KWD', 'QAR']),
      platform: randomFrom(['Binance', 'Bybit', 'MetaTrader 4', 'MetaTrader 5', 'Exness', 'OKX']),
    };
  });
}

const INITIAL_SUBSCRIBERS: Subscriber[] = buildInitialSubscribers(80);

const INITIAL_OPERATIONS: Operation[] = Array.from({ length: 60 }, () => ({
  id: uid(),
  subscriberName: randomFrom(INITIAL_SUBSCRIBERS.slice(0, 40)).name,
  operation: randomFrom(OPERATION_TYPES),
  amount: `${randomAmount(500, 15000).toLocaleString()} ر.س`,
  date: randomDate(2024, 2025),
  status: randomFrom(OPERATION_STATUSES),
}));

const CHART_DATA = [
  { name: 'يناير', value: 420000, target: 400000 },
  { name: 'فبراير', value: 380000, target: 420000 },
  { name: 'مارس', value: 510000, target: 450000 },
  { name: 'إبريل', value: 467000, target: 470000 },
  { name: 'مايو', value: 590000, target: 500000 },
  { name: 'يونيو', value: 648000, target: 540000 },
  { name: 'يوليو', value: 712000, target: 580000 },
];

// ─────────────────────────────────────────────────────────────
// Badge helpers
// ─────────────────────────────────────────────────────────────

function amountColor(status: string): string {
  if (status === 'تنشيط النظام') return 'text-red-600 font-bold';
  if (status === 'اشتراك جديد') return 'text-yellow-600 font-bold';
  if (status === 'قيد المعالجة') return 'text-blue-600 font-bold';
  return 'text-emerald-600 font-bold';
}

function statusBadge(status: string): React.ReactNode {
  const map: Record<string, string> = {
    'تنشيط النظام': 'bg-red-100 text-red-700 border-red-200',
    'اشتراك جديد': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'قيد المعالجة': 'bg-blue-100 text-blue-700 border-blue-200',
    'مكتمل': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const dotColor: Record<string, string> = {
    'تنشيط النظام': 'bg-red-500',
    'اشتراك جديد': 'bg-yellow-500',
    'قيد المعالجة': 'bg-blue-500',
    'مكتمل': 'bg-emerald-500',
  };
  const cls = map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  const dot = dotColor[status] ?? 'bg-gray-400';
  return (
    <Badge className={`${cls} border text-xs gap-1 hover:opacity-90`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} inline-block`} />
      {status}
    </Badge>
  );
}

function subStatusBadge(status: string): React.ReactNode {
  const map: Record<string, string> = {
    'نشط': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'مشترك جديد': 'bg-blue-100 text-blue-700 border-blue-200',
    'رسوم مستحقة': 'bg-orange-100 text-orange-700 border-orange-200',
    'توزيع أرباح': 'bg-purple-100 text-purple-700 border-purple-200',
    'معلق': 'bg-gray-100 text-gray-600 border-gray-200',
    'موقوف': 'bg-red-100 text-red-700 border-red-200',
  };
  const cls = map[status] ?? 'bg-gray-100 text-gray-600 border-gray-200';
  return <Badge className={`${cls} border text-xs hover:opacity-90`}>{status}</Badge>;
}

// ─────────────────────────────────────────────────────────────
// localStorage hook
// ─────────────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, init: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : init;
    } catch { return init; }
  });
  const setStored = (v: T) => {
    try { setVal(v); window.localStorage.setItem(key, JSON.stringify(v)); } catch {}
  };
  return [val, setStored];
}

// ─────────────────────────────────────────────────────────────
// Empty templates
// ─────────────────────────────────────────────────────────────

const EMPTY_SUB: Omit<Subscriber, 'id'> = {
  name: '', phone: '', iban: '', subscriptionAmount: 0, profits: 0, systemFees: 0,
  systemAccount: '', walletAddress: '', bankName: '', joinDate: '',
  subscriberStatus: 'نشط', notes: '', currency: '', platform: '',
};

const EMPTY_OP: Omit<Operation, 'id'> = {
  subscriberName: '', operation: 'توزيع ارباح', amount: '', date: todayStr(), status: 'مكتمل',
};

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'admin' | 'addOperations' | 'addSubscriber' | 'systemAdmin' | 'advanced' | 'reports' | 'settings';

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subscribers, setSubscribers] = useLocalStorage<Subscriber[]>('msub_v2', INITIAL_SUBSCRIBERS);
  const [operations, setOperations] = useLocalStorage<Operation[]>('mops_v2', INITIAL_OPERATIONS);
  const [systemConfig, setSystemConfig] = useLocalStorage<SystemConfig>('msys_config_v2', DEFAULT_SYSTEM_CONFIG);

  // ── Dark Mode ──
  const [isDark, setIsDark] = useLocalStorage<boolean>('msub_darkmode', false);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // ── Command Palette ──
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  // ── Keyboard Shortcuts ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(v => !v); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); setActiveTab('addSubscriber'); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') { e.preventDefault(); setActiveTab('addOperations'); }
      if (e.key === 'Escape') { setCmdOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const updateConfig = (partial: Partial<SystemConfig>) => {
    setSystemConfig({ ...systemConfig, ...partial });
  };

  const sn = systemConfig.sectionNames;
  const co = systemConfig.cardOverrides;

  const completedOps = operations.filter(o => o.status === 'مكتمل').length;
  const activationOps = operations.filter(o => o.status === 'تنشيط النظام').length;

  const liveStats = useMemo(() => ({
    totalSubscribers: co.totalSubscribers || String(subscribers.length),
    totalProfits: co.totalProfits || '١٬٢٨٤٬٥٠٠ ر.س',
    activeSubscriptions: co.activeSubscriptions || String(subscribers.filter(s => s.subscriberStatus === 'نشط').length),
    pendingRequests: co.pendingFees || String(subscribers.filter(s => s.systemFees > 0).length),
    activeCount: co.activeCount || String(subscribers.filter(s => s.subscriberStatus === 'نشط').length),
    completedOpsStr: co.completedOps || String(completedOps),
    totalSubsCount: co.totalSubsCount || String(subscribers.length),
    activationOpsStr: co.activationOps || String(activationOps),
  }), [subscribers, co, completedOps, activationOps]);

  const navItems: { tab: Tab; icon: React.ReactNode; label: string }[] = [
    { tab: 'dashboard', icon: <LayoutDashboard size={20} />, label: sn.dashboard },
    { tab: 'systemAdmin', icon: <SlidersHorizontal size={20} />, label: sn.systemAdmin },
    { tab: 'admin', icon: <Shield size={20} />, label: sn.admin },
    { tab: 'addOperations', icon: <ClipboardList size={20} />, label: sn.addOperations },
    { tab: 'addSubscriber', icon: <UserPlus size={20} />, label: sn.addSubscriber },
    { tab: 'reports', icon: <BarChart2 size={20} />, label: 'التقارير' },
    { tab: 'settings', icon: <Settings size={20} />, label: 'الإعدادات' },
  ];

  const isAdvanced = activeTab === 'advanced';

  const systemDisplayDate = systemConfig.systemDate
    || new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* ── Enterprise Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="bg-gradient-to-b from-slate-900 to-slate-800 text-white hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl z-20 overflow-hidden flex-shrink-0"
      >
        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <Database size={20} className="text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
                <p className="font-black text-sm leading-tight whitespace-nowrap">مركز المشتركين</p>
                <p className="text-xs text-slate-400 whitespace-nowrap">Moshtarikeen Hub</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Pill */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mx-3 mt-3 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-xs text-emerald-400 font-medium">النظام يعمل</span>
              <span className="mr-auto text-xs text-slate-500">{subscribers.length} مشترك</span>
            </motion.div>
          )}
        </AnimatePresence>
        {sidebarCollapsed && (
          <div className="flex justify-center mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 mt-3 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.tab
                  ? 'bg-gradient-to-l from-emerald-600/30 to-teal-600/20 text-emerald-400 border border-emerald-500/30 shadow-lg'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <span className="flex-shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="flex-1 text-right truncate text-sm">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!sidebarCollapsed && activeTab === item.tab && (
                <ChevronLeft size={13} className="flex-shrink-0 opacity-60" />
              )}
            </button>
          ))}

          {/* ── فاصل قسم النظام المتقدم ── */}
          <div className="pt-2 pb-1">
            <div className="h-px bg-gradient-to-l from-transparent via-amber-500/40 to-transparent" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 px-1 pt-2 pb-1">
                  <Sparkles size={10} className="text-amber-400" />
                  <span className="text-xs font-black text-amber-400/80 tracking-widest uppercase">المتقدم</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── زر النظام المتقدم ── */}
          <button onClick={() => setActiveTab('advanced')}
            title={sidebarCollapsed ? 'النظام المتقدم' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
              activeTab === 'advanced'
                ? 'text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10'
                : 'text-amber-400/70 hover:text-amber-300'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
            style={activeTab === 'advanced'
              ? { background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(168,85,247,0.15) 100%)' }
              : { background: 'transparent' }
            }>
            {/* خلفية متحركة عند التحديد */}
            {activeTab !== 'advanced' && (
              <span className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(168,85,247,0.08) 100%)' }} />
            )}
            <span className="flex-shrink-0 relative">
              <Crown size={20} className={activeTab === 'advanced' ? 'text-amber-400' : ''} />
              {activeTab !== 'advanced' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              )}
            </span>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="flex-1 text-right flex items-center gap-2">
                  <span className="truncate text-sm font-bold">النظام المتقدم</span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">PRO</span>
                </motion.div>
              )}
            </AnimatePresence>
            {!sidebarCollapsed && activeTab === 'advanced' && (
              <ChevronLeft size={13} className="flex-shrink-0 opacity-60 text-amber-400" />
            )}
          </button>

          <Separator className="my-2 bg-white/10" />
          <button title={sidebarCollapsed ? 'الإعدادات' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-white/5 hover:text-white transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <Settings size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>الإعدادات</span>}
          </button>
        </nav>

        {/* User + Toggle */}
        <div className="p-3 border-t border-white/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">المدير العام</p>
                <p className="text-xs text-slate-500 truncate">admin@system.com</p>
              </div>
              <Lock size={12} className="text-slate-600 flex-shrink-0" />
            </div>
          )}
          {!sidebarCollapsed && (
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 text-xs font-medium transition-colors mb-2">
              <LogOut size={14} /><span>تسجيل الخروج</span>
            </button>
          )}
          {/* Collapse toggle */}
          <button onClick={() => setSidebarCollapsed(c => !c)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <><PanelLeftClose size={16} /><span>طي الشريط</span></>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            {/* Mobile nav icons */}
            <div className="flex lg:hidden gap-1">
              {navItems.map(item => (
                <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                  className={`p-1.5 rounded-lg transition-colors ${activeTab === item.tab ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: 15 })}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <h1 className="text-base font-black text-slate-800">
                {navItems.find(n => n.tab === activeTab)?.label ?? 'النظام'}
              </h1>
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">v2.0</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Command Palette trigger */}
            <button onClick={() => setCmdOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 text-xs border border-slate-200">
              <Command size={12} />
              <span>بحث سريع</span>
              <kbd className="text-[10px] bg-white border border-slate-200 rounded px-1">⌘K</kbd>
            </button>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
              <CalendarClock size={12} /><span>{systemDisplayDate}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
              <Users size={12} /><span>{subscribers.length} مشترك</span>
            </div>
            {/* Dark Mode Toggle */}
            <button onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600" title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <Button variant="outline" size="icon" className="rounded-full relative h-8 w-8 border-slate-200">
              <Bell size={15} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
            </Button>
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <User size={13} className="text-white" />
              </div>
              <p className="text-xs font-bold text-slate-700">المدير العام</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <DashboardTab
                stats={liveStats}
                subscribers={subscribers}
                operations={operations}
                institutionalText={systemConfig.institutionalText}
                sectionName={sn.dashboard}
              />
            </motion.div>
          )}
          {activeTab === 'systemAdmin' && (
            <motion.div key="systemAdmin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <SystemAdminTab
                systemConfig={systemConfig}
                onConfigChange={updateConfig}
                subscribersCount={subscribers.length}
                sectionName={sn.systemAdmin}
                operations={operations}
                onOperationsChange={setOperations}
              />
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AdminPanel subscribers={subscribers} operations={operations} sectionName={sn.admin} systemConfig={systemConfig} />
            </motion.div>
          )}
          {activeTab === 'addOperations' && (
            <motion.div key="addOps" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AddOperationsTab operations={operations} onOperationsChange={setOperations} subscriberNames={subscribers.map(s => s.name)} sectionName={sn.addOperations} />
            </motion.div>
          )}
          {activeTab === 'addSubscriber' && (
            <motion.div key="addSub" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AddSubscriberTab subscribers={subscribers} onSubscribersChange={setSubscribers} sectionName={sn.addSubscriber} operations={operations} onOperationsChange={setOperations} />
            </motion.div>
          )}
          {activeTab === 'advanced' && (
            <motion.div key="advanced" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full">
              <AdvancedSystemTab
                subscribers={subscribers}
                operations={operations}
                stats={liveStats}
                systemConfig={systemConfig}
                onOperationsChange={setOperations}
                onSubscribersChange={setSubscribers}
              />
            </motion.div>
          )}
          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <ReportsTab subscribers={subscribers} operations={operations} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <SettingsTab
                isDark={isDark}
                onDarkToggle={() => setIsDark(!isDark)}
                subscribers={subscribers}
                operations={operations}
                systemConfig={systemConfig}
                onSubscribersChange={setSubscribers}
                onOperationsChange={setOperations}
                onConfigChange={updateConfig}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Command Palette Overlay ── */}
      <AnimatePresence>
        {cmdOpen && (
          <CommandPalette
            open={cmdOpen}
            query={cmdQuery}
            onQueryChange={setCmdQuery}
            onClose={() => { setCmdOpen(false); setCmdQuery(''); }}
            subscribers={subscribers}
            operations={operations}
            onNavigate={(tab) => { setActiveTab(tab as Tab); setCmdOpen(false); setCmdQuery(''); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Dashboard Tab — النظام الإداري
// ─────────────────────────────────────────────────────────────

interface LiveStats {
  totalSubscribers: string; totalProfits: string; activeSubscriptions: string;
  pendingRequests: string; activeCount: string; completedOpsStr: string;
  totalSubsCount: string; activationOpsStr: string;
}

function DashboardTab({ stats, subscribers, operations, institutionalText, sectionName }: {
  stats: LiveStats;
  subscribers: Subscriber[];
  operations: Operation[];
  institutionalText: string;
  sectionName: string;
}) {
  const completedOps = operations.filter(o => o.status === 'مكتمل').length;
  const pendingOps = operations.filter(o => o.status === 'قيد المعالجة').length;
  const activationOps = operations.filter(o => o.status === 'تنشيط النظام').length;

  const statCards = [
    {
      title: 'إجمالي المشتركين',
      value: stats.totalSubscribers,
      sub: `نشط: ${stats.activeCount}`,
      icon: <Users size={22} className="text-blue-600" />,
      bg: 'bg-blue-50', ring: 'ring-blue-200', trend: '+12%', up: true, color: 'text-blue-700',
    },
    {
      title: 'إجمالي الأرباح',
      value: stats.totalProfits,
      sub: `${stats.completedOpsStr} عملية مكتملة`,
      icon: <TrendingUp size={22} className="text-emerald-600" />,
      bg: 'bg-emerald-50', ring: 'ring-emerald-200', trend: '+8.3%', up: true, color: 'text-emerald-700',
    },
    {
      title: 'الاشتراكات النشطة',
      value: stats.activeSubscriptions,
      sub: `من ${stats.totalSubsCount} مشترك`,
      icon: <CheckCheck size={22} className="text-purple-600" />,
      bg: 'bg-purple-50', ring: 'ring-purple-200', trend: '+5.1%', up: true, color: 'text-purple-700',
    },
    {
      title: 'رسوم مستحقة',
      value: stats.pendingRequests,
      sub: `${stats.activationOpsStr} عملية تنشيط`,
      icon: <AlertCircle size={22} className="text-orange-500" />,
      bg: 'bg-orange-50', ring: 'ring-orange-200', trend: '-2.4%', up: false, color: 'text-orange-600',
    },
  ];

  const pieData = [
    { name: 'نشط', value: subscribers.filter(s => s.subscriberStatus === 'نشط').length, color: '#10b981' },
    { name: 'جديد', value: subscribers.filter(s => s.subscriberStatus === 'مشترك جديد').length, color: '#3b82f6' },
    { name: 'رسوم', value: subscribers.filter(s => s.subscriberStatus === 'رسوم مستحقة').length, color: '#f59e0b' },
    { name: 'أرباح', value: subscribers.filter(s => s.subscriberStatus === 'توزيع أرباح').length, color: '#8b5cf6' },
    { name: 'معلق', value: subscribers.filter(s => s.subscriberStatus === 'معلق').length, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{sectionName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">نظرة شاملة على أداء النظام</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-slate-600 border-slate-200 h-9 hidden sm:flex">
          <Download size={13} /> تصدير
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className={`border-none shadow-sm ring-1 ${card.ring} hover:shadow-md transition-all duration-200`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${card.bg} ring-1 ${card.ring}`}>{card.icon}</div>
                  <div className={`flex items-center gap-0.5 text-xs font-bold ${card.up ? 'text-emerald-600' : 'text-red-500'}`}>
                    {card.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{card.trend}
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium">{card.title}</p>
                <h3 className={`text-xl font-black mt-1 ${card.color} leading-tight`}>{card.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Institutional Text */}
      {institutionalText && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-md ring-2 ring-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400" />
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Star size={24} className="text-emerald-600" />
              </div>
              <p className="text-xl font-black text-slate-800 leading-relaxed whitespace-pre-wrap">{institutionalText}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-black text-slate-800">نمو الأرباح الشهرية</CardTitle>
                <CardDescription className="text-xs">المقارنة مع الهدف المخطط</CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs gap-1"><Activity size={11} />مباشر</Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTgt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 20px rgb(0 0 0 / 0.08)' }}
                  formatter={(v: number, name: string) => [`${v.toLocaleString()} ر.س`, name === 'value' ? 'الأرباح' : 'الهدف']} />
                <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#gTgt)" />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gVal)" dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-black text-slate-800">توزيع الحالات</CardTitle>
            <CardDescription className="text-xs">حسب حالة اشتراك المشترك</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip formatter={(v: number, _n: string, p: any) => [`${v} مشترك`, p.payload.name]}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-1">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-black text-slate-800">آخر العمليات</CardTitle>
              <Badge className="bg-slate-100 text-slate-500 border-none text-xs">{operations.length} إجمالي</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {operations.slice(0, 6).map(op => (
              <div key={op.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${op.status === 'مكتمل' ? 'bg-emerald-100' : op.status === 'تنشيط النظام' ? 'bg-red-100' : 'bg-blue-100'}`}>
                  {op.status === 'مكتمل' ? <CheckCircle2 size={15} className="text-emerald-600" /> :
                    op.status === 'تنشيط النظام' ? <AlertCircle size={15} className="text-red-500" /> :
                      <Clock size={15} className="text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">{op.subscriberName}</p>
                  <p className="text-xs text-slate-400">{op.operation} · {op.date}</p>
                </div>
                <span className={`text-sm ${amountColor(op.status)}`}>{op.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-black text-slate-800">إحصائيات النظام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'عمليات مكتملة', value: completedOps, total: operations.length, color: 'bg-emerald-500' },
              { label: 'قيد المعالجة', value: pendingOps, total: operations.length, color: 'bg-blue-500' },
              { label: 'تنشيط النظام', value: activationOps, total: operations.length, color: 'bg-red-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">{item.label}</span>
                  <span className="font-black text-slate-800">{item.value} / {item.total}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.total ? (item.value / item.total * 100) : 0}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }} className={`h-full ${item.color} rounded-full`} />
                </div>
              </div>
            ))}
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 text-center ring-1 ring-slate-200">
                <p className="text-xs text-slate-400 mb-1">متوسط الاشتراك</p>
                <p className="text-sm font-black text-slate-700">
                  {subscribers.length ? Math.round(subscribers.reduce((a, s) => a + s.subscriptionAmount, 0) / subscribers.length).toLocaleString() : 0} ر.س
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center ring-1 ring-slate-200">
                <p className="text-xs text-slate-400 mb-1">إجمالي رسوم مستحقة</p>
                <p className="text-sm font-black text-orange-600">
                  {subscribers.reduce((a, s) => a + s.systemFees, 0).toLocaleString()} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}


// ─────────────────────────────────────────────────────────────
// System Admin Tab — لوحة إدارة النظام
// ─────────────────────────────────────────────────────────────

function SystemAdminTab({ systemConfig, onConfigChange, subscribersCount, sectionName, operations, onOperationsChange }: {
  systemConfig: SystemConfig;
  onConfigChange: (partial: Partial<SystemConfig>) => void;
  subscribersCount: number;
  sectionName: string;
  operations: Operation[];
  onOperationsChange: (o: Operation[]) => void;
}) {
  const [dateInput, setDateInput] = useState(systemConfig.systemDate);
  const [co, setCo] = useState({ ...systemConfig.cardOverrides });
  const [qco, setQco] = useState({ ...(systemConfig.queryCardOverrides ?? { totalSubscribers: '', activeCount: '', pendingFees: '' }) });
  const [sn, setSn] = useState({ ...systemConfig.sectionNames });
  const [instText, setInstText] = useState(systemConfig.institutionalText);
  const [saved, setSaved] = useState<string | null>(null);

  const flash = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(null), 2500); };

  const saveDate = () => {
    onConfigChange({ systemDate: dateInput });
    // تحديث تواريخ جميع العمليات إلى تاريخ اليوم
    const today = todayStr();
    onOperationsChange(operations.map(op => ({ ...op, date: today })));
    flash('تم تحديث تاريخ النظام وجميع العمليات');
    toast.success('تم تحديث التاريخ وجميع العمليات');
  };

  const saveQueryCards = () => {
    onConfigChange({ queryCardOverrides: qco });
    flash('تم حفظ تعديلات البطاقات الثلاث');
    toast.success('تم حفظ تعديلات البطاقات الثلاث');
  };

  const saveCards = () => {
    onConfigChange({ cardOverrides: co });
    flash('تم حفظ تعديلات البطاقات');
    toast.success('تم حفظ تعديلات البطاقات');
  };

  const saveNames = () => {
    onConfigChange({ sectionNames: sn });
    flash('تم تحديث أسماء الأقسام');
    toast.success('تم تحديث أسماء الأقسام');
  };

  const saveText = () => {
    onConfigChange({ institutionalText: instText });
    flash('تم حفظ النص المؤسسي');
    toast.success('تم حفظ النص المؤسسي');
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{sectionName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">إدارة ديناميكية كاملة للنظام</p>
        </div>
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-lg">
              <CheckCircle2 size={16} />{saved}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── 1. تحديث تاريخ النظام ── */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <CalendarClock size={18} className="text-blue-500" /> تحديث تاريخ النظام
            </CardTitle>
            <CardDescription className="text-xs">يظهر في شريط الرأس العلوي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 block">التاريخ (نص حر أو تاريخ بالتقويم)</label>
              <Input value={dateInput} onChange={e => setDateInput(e.target.value)}
                placeholder="مثال: الأحد 15 يناير 2025" className="h-10 border-slate-200" />
              <p className="text-xs text-slate-400 mt-1">اتركه فارغاً لعرض التاريخ الحالي تلقائياً</p>
            </div>
            <Button onClick={saveDate} className="bg-blue-600 hover:bg-blue-700 gap-1.5">
              <RefreshCw size={14} /> تحديث التاريخ
            </Button>
          </CardContent>
        </Card>

        {/* ── 5. تعديل أسماء الأقسام ── */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-violet-400 to-purple-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Type size={18} className="text-violet-500" /> تعديل أسماء الأقسام
            </CardTitle>
            <CardDescription className="text-xs">يتم تحديثها فوراً في الشريط الجانبي والواجهة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {([
              { key: 'dashboard' as const, label: 'النظام الإداري (الرئيسي)' },
              { key: 'systemAdmin' as const, label: 'لوحة إدارة النظام' },
              { key: 'admin' as const, label: 'نظام الإستعلام عن الأرباح' },
              { key: 'addOperations' as const, label: 'سجل العمليات' },
              { key: 'addSubscriber' as const, label: 'إضافة مشترك' },
            ]).map(item => (
              <div key={item.key}>
                <label className="text-xs font-bold text-slate-500 mb-1 block">{item.label}</label>
                <Input value={sn[item.key]} onChange={e => setSn(prev => ({ ...prev, [item.key]: e.target.value }))}
                  className="h-9 border-slate-200 text-sm" />
              </div>
            ))}
            <Button onClick={saveNames} className="bg-violet-600 hover:bg-violet-700 gap-1.5 w-full mt-1">
              <Save size={14} /> حفظ أسماء الأقسام
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── 2. إدارة البطاقات الأربع ── */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-500" /> إدارة البطاقات الأربع الرئيسية
          </CardTitle>
          <CardDescription className="text-xs">
            تعديلاتك تنعكس مباشرة داخل {systemConfig.sectionNames.dashboard} · اتركها فارغة للحساب التلقائي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-blue-50 ring-1 ring-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
                <span className="text-sm font-black text-blue-700">إجمالي المشتركين</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">إجمالي المشتركين</label>
                <Input value={co.totalSubscribers} onChange={e => setCo(p => ({ ...p, totalSubscribers: e.target.value }))}
                  placeholder={`${subscribersCount} (تلقائي)`} className="h-9 border-blue-200 bg-white text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">عدد النشطين</label>
                <Input value={co.activeCount} onChange={e => setCo(p => ({ ...p, activeCount: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-blue-200 bg-white text-sm" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp size={16} className="text-emerald-600" />
                </div>
                <span className="text-sm font-black text-emerald-700">إجمالي الأرباح</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">إجمالي الأرباح (نص حر)</label>
                <Input value={co.totalProfits} onChange={e => setCo(p => ({ ...p, totalProfits: e.target.value }))}
                  placeholder="مثال: ١٬٢٨٤٬٥٠٠ ر.س" className="h-9 border-emerald-200 bg-white text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">عدد العمليات المكتملة</label>
                <Input value={co.completedOps} onChange={e => setCo(p => ({ ...p, completedOps: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-emerald-200 bg-white text-sm" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-purple-50 ring-1 ring-purple-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <CheckCheck size={16} className="text-purple-600" />
                </div>
                <span className="text-sm font-black text-purple-700">الاشتراكات النشطة</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">عدد الاشتراكات النشطة</label>
                <Input value={co.activeSubscriptions} onChange={e => setCo(p => ({ ...p, activeSubscriptions: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-purple-200 bg-white text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">من إجمالي المشتركين</label>
                <Input value={co.totalSubsCount} onChange={e => setCo(p => ({ ...p, totalSubsCount: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-purple-200 bg-white text-sm" />
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-orange-50 ring-1 ring-orange-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertCircle size={16} className="text-orange-500" />
                </div>
                <span className="text-sm font-black text-orange-600">رسوم مستحقة</span>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">عدد الرسوم المستحقة</label>
                <Input value={co.pendingFees} onChange={e => setCo(p => ({ ...p, pendingFees: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-orange-200 bg-white text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">عدد عمليات التنشيط</label>
                <Input value={co.activationOps} onChange={e => setCo(p => ({ ...p, activationOps: e.target.value }))}
                  placeholder="تلقائي" className="h-9 border-orange-200 bg-white text-sm" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveCards} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 px-6">
              <Save size={14} /> حفظ تعديلات البطاقات
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. إدارة البطاقات الثلاث في الاستعلام ── */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-400" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <Shield size={18} className="text-cyan-500" /> إدارة البطاقات الثلاث في نظام الاستعلام
          </CardTitle>
          <CardDescription className="text-xs">
            البطاقات الثلاث التي تظهر تحت حقل الاستعلام عن الأرباح · اتركها فارغة للحساب التلقائي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Users size={15} className="text-slate-600" />
                <span className="text-sm font-black text-slate-700">إجمالي المشتركين</span>
              </div>
              <label className="text-xs font-bold text-slate-500 block">القيمة المعروضة</label>
              <Input value={qco.totalSubscribers} onChange={e => setQco(p => ({ ...p, totalSubscribers: e.target.value }))}
                placeholder={`${subscribersCount} (تلقائي)`} className="h-9 border-slate-200 bg-white text-sm" />
            </div>
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={15} className="text-emerald-600" />
                <span className="text-sm font-black text-slate-700">نشطون</span>
              </div>
              <label className="text-xs font-bold text-slate-500 block">القيمة المعروضة</label>
              <Input value={qco.activeCount} onChange={e => setQco(p => ({ ...p, activeCount: e.target.value }))}
                placeholder="تلقائي" className="h-9 border-slate-200 bg-white text-sm" />
            </div>
            <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={15} className="text-orange-500" />
                <span className="text-sm font-black text-slate-700">رسوم مستحقة</span>
              </div>
              <label className="text-xs font-bold text-slate-500 block">القيمة المعروضة</label>
              <Input value={qco.pendingFees} onChange={e => setQco(p => ({ ...p, pendingFees: e.target.value }))}
                placeholder="تلقائي" className="h-9 border-slate-200 bg-white text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={saveQueryCards} className="bg-cyan-600 hover:bg-cyan-700 gap-1.5 px-6">
              <Save size={14} /> حفظ تعديلات البطاقات الثلاث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── 6. النص المؤسسي ── */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <Edit3 size={18} className="text-amber-500" /> النص المؤسسي الكبير
          </CardTitle>
          <CardDescription className="text-xs">
            يظهر بشكل بارز أسفل البطاقات الأربع في {systemConfig.sectionNames.dashboard}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={instText}
            onChange={e => setInstText(e.target.value)}
            rows={4}
            placeholder="أدخل نصاً مؤسسياً احترافياً يظهر أسفل البطاقات الرئيسية..."
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">النص يدعم الأسطر المتعددة</p>
            <div className="flex gap-2">
              {instText && (
                <Button variant="outline" onClick={() => { setInstText(''); onConfigChange({ institutionalText: '' }); }}
                  className="border-slate-200 text-slate-500 gap-1.5">
                  <X size={13} /> مسح النص
                </Button>
              )}
              <Button onClick={saveText} className="bg-amber-500 hover:bg-amber-600 gap-1.5 px-6">
                <Save size={14} /> حفظ النص
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Admin Panel — نظام الإستعلام عن الأرباح
// ─────────────────────────────────────────────────────────────

const OPS_PER_PAGE = 8;

function AdminPanel({ subscribers, operations, sectionName, systemConfig }: {
  subscribers: Subscriber[];
  operations: Operation[];
  sectionName: string;
  systemConfig: SystemConfig;
}) {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<Subscriber | null>(null);
  const [searched, setSearched] = useState(false);
  const [opsPage, setOpsPage] = useState(1);
  const [showWallet, setShowWallet] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runSearch = () => {
    if (!query.trim()) return;
    // reset
    setSearched(false);
    setFound(null);
    setIsSearching(true);
    setProgress(0);
    setOpsPage(1);
    setShowWallet(false);

    let p = 0;
    intervalRef.current = setInterval(() => {
      p += Math.random() * 18 + 7;
      if (p >= 100) {
        p = 100;
        setProgress(100);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
          const q = query.trim().toLowerCase();
          const res = subscribers.find(s =>
            s.name.toLowerCase().includes(q) ||
            s.iban.toLowerCase().includes(q) ||
            s.phone.includes(q) ||
            s.systemAccount.toLowerCase().includes(q) ||
            s.walletAddress.toLowerCase().includes(q)
          );
          setFound(res ?? null);
          setSearched(true);
          setIsSearching(false);
          setProgress(0);
        }, 400);
      } else {
        setProgress(p);
      }
    }, 80);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const subscriberOps = useMemo(() => {
    if (!found) return [];
    return operations.filter(op => op.subscriberName === found.name);
  }, [found, operations]);

  const totalOpsPages = Math.max(1, Math.ceil(subscriberOps.length / OPS_PER_PAGE));
  const pagedOps = subscriberOps.slice((opsPage - 1) * OPS_PER_PAGE, opsPage * OPS_PER_PAGE);

  const clear = () => {
    setQuery(''); setFound(null); setSearched(false); setOpsPage(1);
    setIsSearching(false); setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-black text-slate-800">{sectionName}</h2>
        <p className="text-sm text-slate-400 mt-0.5">البحث عن مشترك وعرض تفاصيله الكاملة</p>
      </div>

      {/* Search Card */}
      <div className="rounded-2xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full -mr-36 -mt-36 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full -ml-28 -mb-28 blur-3xl pointer-events-none" />
          <div className="relative z-10 p-6 lg:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <Search size={22} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">الاستعلام عن المشترك</h3>
                <p className="text-xs text-slate-400 mt-0.5">ابحث بالاسم · الآيبان · رقم الهاتف · عنوان المحفظة · حساب النظام</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  placeholder="أدخل الاسم، IBAN، رقم الهاتف..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 pr-11 text-sm rounded-xl focus:bg-white/15 focus:border-emerald-400 transition-all h-12"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runSearch()}
                  disabled={isSearching}
                />
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              </div>
              <Button onClick={runSearch} disabled={isSearching}
                className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all whitespace-nowrap disabled:opacity-70">
                {isSearching ? 'جاري البحث...' : 'استعلام الآن'}
              </Button>
              {(searched || isSearching) && (
                <Button variant="outline" onClick={clear}
                  className="h-12 border-white/20 text-white hover:bg-white/10 rounded-xl px-3">
                  <X size={17} />
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            <AnimatePresence>
              {isSearching && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">جارٍ البحث في قاعدة البيانات...</span>
                    <span className="text-sm font-black text-emerald-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 right-0 bg-gradient-to-l from-emerald-400 to-teal-400 rounded-full"
                      style={{ width: `${progress}%`, left: 'auto' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1, ease: 'linear' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-white/20 to-transparent rounded-full pointer-events-none" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0%</span><span>100%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'إجمالي المشتركين', value: systemConfig.queryCardOverrides?.totalSubscribers || String(subscribers.length), icon: <Users size={13} /> },
                { label: 'نشطون', value: systemConfig.queryCardOverrides?.activeCount || String(subscribers.filter(s => s.subscriberStatus === 'نشط').length), icon: <CheckCircle2 size={13} /> },
                { label: 'رسوم مستحقة', value: systemConfig.queryCardOverrides?.pendingFees || String(subscribers.filter(s => s.systemFees > 0).length), icon: <AlertCircle size={13} /> },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                  <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">{item.icon}{item.label}</div>
                  <p className="text-2xl font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {searched && !found && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardContent className="py-16 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <Search size={26} className="text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-slate-700">لم يُعثر على مشترك</p>
                  <p className="text-sm text-slate-400 mt-1">تحقق من البيانات المُدخلة وحاول مرة أخرى</p>
                </div>
                <Button variant="outline" onClick={clear} className="gap-2 border-slate-200">
                  <RefreshCw size={14} /> بحث جديد
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {searched && found && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Profile Card */}
            <Card className="border-none shadow-md ring-1 ring-slate-200 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400" />
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                      <User size={36} className="text-white" />
                    </div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-2xl font-black text-slate-800">{found.name}</h3>
                      {found.subscriberStatus && subStatusBadge(found.subscriberStatus)}
                      <Badge className="bg-slate-100 text-slate-500 border-none text-xs gap-1"><Shield size={10} />موثّق</Badge>
                    </div>
                    {found.joinDate && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                        <Calendar size={11} /> عضو منذ {found.joinDate}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {found.phone && <MiniInfo icon={<Phone size={13} />} label="الجوال" value={found.phone} />}
                      {found.iban && <MiniInfo icon={<CreditCard size={13} />} label="الآيبان" value={found.iban} mono />}
                      {found.bankName && <MiniInfo icon={<Building2 size={13} />} label="البنك" value={found.bankName} />}
                      {found.systemAccount && <MiniInfo icon={<Database size={13} />} label="حساب النظام" value={found.systemAccount} mono />}
                      {found.currency && <MiniInfo icon={<Globe size={13} />} label="العملة" value={found.currency} />}
                      {found.platform && <MiniInfo icon={<Cpu size={13} />} label="المنصة" value={found.platform} />}
                    </div>
                  </div>
                </div>

                {/* Financial */}
                <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {found.subscriptionAmount > 0 && (
                    <FinBox icon={<Wallet size={17} className="text-blue-500" />} label="مبلغ الاشتراك"
                      value={`${found.subscriptionAmount.toLocaleString()} ر.س`} bg="bg-blue-50" ring="ring-blue-200" color="text-blue-700" />
                  )}
                  {found.profits > 0 && (
                    <FinBox icon={<TrendingUp size={17} className="text-emerald-500" />} label="الأرباح"
                      value={`${found.profits.toLocaleString()} ر.س`} bg="bg-emerald-50" ring="ring-emerald-200" color="text-emerald-700" />
                  )}
                  {found.systemFees > 0 && (
                    <FinBox icon={<AlertCircle size={17} className="text-orange-500" />} label="رسوم النظام"
                      value={`${found.systemFees.toLocaleString()} ر.س`} bg="bg-orange-50" ring="ring-orange-200" color="text-orange-600" />
                  )}
                  {found.walletAddress && (
                    <FinBox icon={<Hash size={17} className="text-purple-500" />} label="المحفظة الرقمية"
                      value={showWallet ? found.walletAddress : `${found.walletAddress.slice(0, 12)}…`}
                      bg="bg-purple-50" ring="ring-purple-200" color="text-purple-700"
                      extra={
                        <button onClick={() => setShowWallet(v => !v)}
                          className="mt-1 flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors">
                          {showWallet ? <EyeOff size={11} /> : <Eye size={11} />}
                          {showWallet ? 'إخفاء' : 'عرض الكامل'}
                        </button>
                      }
                    />
                  )}
                </div>

                {found.notes && (
                  <div className="mt-4 p-3 rounded-xl bg-yellow-50 ring-1 ring-yellow-200 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{found.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operations for this subscriber - تظهر فقط عند وجود عمليات */}
            {subscriberOps.length > 0 && (
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-black text-slate-800">سجل عمليات المشترك</CardTitle>
                  <Badge className="bg-slate-100 text-slate-500 border-none text-xs">{subscriberOps.length} عملية</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {subscriberOps.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <ClipboardList size={28} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm">لا توجد عمليات مسجّلة لهذا المشترك</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 hover:bg-slate-50">
                            {['#', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'].map(h => (
                              <TableHead key={h} className="text-slate-600 font-bold text-xs">{h}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedOps.map((op, i) => (
                            <TableRow key={op.id} className="hover:bg-slate-50/80">
                              <TableCell className="text-slate-400 text-xs">{(opsPage - 1) * OPS_PER_PAGE + i + 1}</TableCell>
                              <TableCell className="text-sm text-slate-600">{op.operation}</TableCell>
                              <TableCell className={`text-sm ${amountColor(op.status)}`}>{op.amount}</TableCell>
                              <TableCell className="text-xs text-slate-500">{op.date}</TableCell>
                              <TableCell>{statusBadge(op.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {totalOpsPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400">صفحة {opsPage} من {totalOpsPages}</span>
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs"
                            disabled={opsPage === 1} onClick={() => setOpsPage(p => p - 1)}>
                            <ChevronRight size={13} /> السابق
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs"
                            disabled={opsPage === totalOpsPages} onClick={() => setOpsPage(p => p + 1)}>
                            التالي <ChevronLeft size={13} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            )}

            {/* زر الطباعة والتصدير */}
            <div className="flex justify-center pt-2 pb-1">
              <PrintMenu found={found} subscriberOps={subscriberOps} queryText={query} />
            </div>

            {/* All Operations Log */}
            <AllOperationsLog operations={operations} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function AllOperationsLog({ operations }: { operations: Operation[] }) {
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [search, setSearch] = useState('');
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    let ops = [...operations];
    if (filterStatus !== 'الكل') ops = ops.filter(o => o.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      ops = ops.filter(o => o.subscriberName.toLowerCase().includes(q) || o.operation.includes(q));
    }
    return ops;
  }, [operations, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <Card className="border-none shadow-sm ring-1 ring-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-black text-slate-800">سجل جميع العمليات</CardTitle>
            <CardDescription className="text-xs">{operations.length} عملية مسجّلة في النظام</CardDescription>
          </div>
          <Badge className="bg-slate-100 text-slate-500 border-none text-xs">{filtered.length} عملية</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input placeholder="بحث في العمليات..." className="h-9 pr-9 border-slate-200 text-sm"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          </div>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44 h-9 border-slate-200 text-sm">
              <Filter size={12} className="ml-1 text-slate-400" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="الكل">جميع الحالات</SelectItem>
              {OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                {['#', 'المشترك', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'].map(h => (
                  <TableHead key={h} className="text-slate-600 font-bold text-xs">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((op, i) => (
                <TableRow key={op.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="text-slate-400 text-xs">{(page - 1) * PER_PAGE + i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <User size={11} className="text-slate-500" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{op.subscriberName || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{op.operation}</TableCell>
                  <TableCell className={`text-sm ${amountColor(op.status)}`}>{op.amount}</TableCell>
                  <TableCell className="text-xs text-slate-500">{op.date}</TableCell>
                  <TableCell>{statusBadge(op.status)}</TableCell>
                </TableRow>
              ))}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    <ClipboardList size={26} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">لا توجد عمليات مطابقة</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">صفحة {page} من {totalPages}</span>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs"
                disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronRight size={13} /> السابق
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs"
                disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                التالي <ChevronLeft size={13} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Admin Panel helpers
// ─────────────────────────────────────────────────────────────

function MiniInfo({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-200">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-sm font-bold text-slate-700 break-all leading-snug ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
      </div>
    </div>
  );
}

function FinBox({ icon, label, value, bg, ring, color, extra }: {
  icon: React.ReactNode; label: string; value: string;
  bg: string; ring: string; color: string; extra?: React.ReactNode;
}) {
  return (
    <div className={`${bg} ring-1 ${ring} rounded-xl p-3`}>
      <div className="flex items-center gap-1.5 mb-2">{icon}<span className="text-xs text-slate-500 font-medium">{label}</span></div>
      <p className={`text-lg font-black ${color}`}>{value}</p>
      {extra}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Operations Tab
// ─────────────────────────────────────────────────────────────

const ADMIN_OPS_PER_PAGE = 12;

function AddOperationsTab({ operations, onOperationsChange, subscriberNames, sectionName }: {
  operations: Operation[];
  onOperationsChange: (o: Operation[]) => void;
  subscriberNames: string[];
  sectionName: string;
}) {
  const [form, setForm] = useState<Omit<Operation, 'id'>>({ ...EMPTY_OP });
  const [editId, setEditId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [searchOp, setSearchOp] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let ops = [...operations];
    if (filterStatus !== 'الكل') ops = ops.filter(o => o.status === filterStatus);
    if (searchOp.trim()) {
      const q = searchOp.toLowerCase();
      ops = ops.filter(o => o.subscriberName.toLowerCase().includes(q) || o.operation.includes(q));
    }
    return ops;
  }, [operations, filterStatus, searchOp]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ADMIN_OPS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ADMIN_OPS_PER_PAGE, page * ADMIN_OPS_PER_PAGE);

  const openAdd = () => { setForm({ ...EMPTY_OP, date: todayStr() }); setEditId(null); setIsOpen(true); };
  const openEdit = (op: Operation) => { const { id, ...rest } = op; setForm(rest); setEditId(id); setIsOpen(true); };

  const handleSave = () => {
    if (editId) {
      onOperationsChange(operations.map(o => o.id === editId ? { id: editId, ...form } : o));
      toast.success('تم تحديث العملية بنجاح');
    } else {
      onOperationsChange([{ id: uid(), ...form }, ...operations]);
      toast.success('تمت إضافة العملية بنجاح');
    }
    setIsOpen(false);
    setPage(1);
  };

  const doDelete = (id: string) => {
    onOperationsChange(operations.filter(o => o.id !== id));
    setDeleteId(null);
    toast.error('تم حذف العملية');
  };

  const exportCSV = () => {
    const header = ['الاسم', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'];
    const rows = filtered.map(o => [o.subscriberName, o.operation, o.amount, o.date, o.status]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `العمليات_${new Date().toLocaleDateString('ar-SA').replace(/\//g,'_')}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('تم تصدير العمليات بنجاح');
  };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{sectionName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{operations.length} عملية مسجّلة في النظام</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportCSV} variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-600 h-9">
            <FileDown size={14} /> تصدير CSV
          </Button>
          <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-sm">
            <Plus size={16} /> إضافة عملية
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Input placeholder="بحث في العمليات..." className="h-10 pr-9 border-slate-200" value={searchOp}
              onChange={e => { setSearchOp(e.target.value); setPage(1); }} />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          </div>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-48 h-10 border-slate-200">
              <Filter size={13} className="ml-1.5 text-slate-400" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="الكل">جميع الحالات</SelectItem>
              {OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  {['#', 'المشترك', 'العملية', 'المبلغ', 'التاريخ', 'الحالة', 'إجراءات'].map(h => (
                    <TableHead key={h} className="text-slate-600 font-bold text-xs">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((op, i) => (
                  <TableRow key={op.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="text-slate-400 text-xs">{(page - 1) * ADMIN_OPS_PER_PAGE + i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <User size={13} className="text-slate-500" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{op.subscriberName || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell><span className="text-sm text-slate-600">{op.operation}</span></TableCell>
                    <TableCell className={`text-sm ${amountColor(op.status)}`}>{op.amount}</TableCell>
                    <TableCell className="text-xs text-slate-500">{op.date}</TableCell>
                    <TableCell>{statusBadge(op.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(op)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(op.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                      <ClipboardList size={30} className="mx-auto mb-2 text-slate-300" />
                      <p className="font-medium text-sm">لا توجد عمليات مطابقة</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">صفحة {page} من {totalPages} · {filtered.length} عملية</span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs"
                  disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronRight size={13} /> السابق
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs"
                  disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  التالي <ChevronLeft size={13} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-black text-slate-800">{editId ? 'تعديل عملية' : 'إضافة عملية جديدة'}</h3>
                  <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><User size={11} />اسم المشترك</label>
                    <Input list="sub-list" value={form.subscriberName} onChange={e => setForm(f => ({ ...f, subscriberName: e.target.value }))}
                      placeholder="اكتب أو اختر اسم المشترك" className="h-10 border-slate-200" />
                    <datalist id="sub-list">
                      {subscriberNames.map(n => <option key={n} value={n} />)}
                    </datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">نوع العملية</label>
                      <Select value={form.operation} onValueChange={v => setForm(f => ({ ...f, operation: v }))}>
                        <SelectTrigger className="h-10 border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent>{OPERATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 block">الحالة</label>
                      <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger className="h-10 border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent>{OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Banknote size={11} />المبلغ</label>
                      <Input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="1,500 ر.س" className="h-10 border-slate-200" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Calendar size={11} />التاريخ</label>
                      <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-10 border-slate-200" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-5">
                  <Button variant="outline" onClick={() => setIsOpen(false)} className="border-slate-200">إلغاء</Button>
                  <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 px-5">
                    <Save size={13} /> {editId ? 'حفظ التعديل' : 'إضافة'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription className="text-right">هل أنت متأكد من حذف هذه العملية؟ لا يمكن التراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && doDelete(deleteId)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Add Subscriber Tab
// ─────────────────────────────────────────────────────────────

const SUBS_PER_PAGE = 10;

function AddSubscriberTab({ subscribers, onSubscribersChange, sectionName, operations, onOperationsChange }: {
  subscribers: Subscriber[];
  onSubscribersChange: (s: Subscriber[]) => void;
  sectionName: string;
  operations: Operation[];
  onOperationsChange: (o: Operation[]) => void;
}) {
  const [form, setForm] = useState<Omit<Subscriber, 'id'>>({ ...EMPTY_SUB });
  const [editId, setEditId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pendingOps, setPendingOps] = useState<{ operation: string; amount: string; date: string; status: string }[]>([]);
  const [showAddOps, setShowAddOps] = useState(false);
  const [tempOp, setTempOp] = useState({ operation: 'توزيع ارباح', amount: '', date: todayStr(), status: 'مكتمل' });
  const [page, setPage] = useState(1);
  const [searchSub, setSearchSub] = useState('');
  const [customBank, setCustomBank] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currencySearch, setCurrencySearch] = useState('');
  const [platformSearch, setPlatformSearch] = useState('');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const platformRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) setCurrencyOpen(false);
      if (platformRef.current && !platformRef.current.contains(e.target as Node)) setPlatformOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCurrencies = useMemo(() => {
    if (!currencySearch.trim()) return WORLD_CURRENCIES;
    const q = currencySearch.toLowerCase();
    return WORLD_CURRENCIES.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.nameAr.includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.countryAr.includes(q) ||
      c.countryEn.toLowerCase().includes(q) ||
      c.symbol.includes(q)
    );
  }, [currencySearch]);

  const filteredPlatforms = useMemo(() => {
    if (!platformSearch.trim()) return TRADING_PLATFORMS;
    const q = platformSearch.toLowerCase();
    return TRADING_PLATFORMS.filter(p => p.name.toLowerCase().includes(q) || p.type.includes(q));
  }, [platformSearch]);

  const cryptoPlatforms = filteredPlatforms.filter(p => p.type === 'crypto');
  const forexPlatforms = filteredPlatforms.filter(p => p.type === 'forex');

  const selectedCurrency = WORLD_CURRENCIES.find(c => c.code === form.currency);
  const selectedPlatform = TRADING_PLATFORMS.find(p => p.name === form.platform);

  const filtered = useMemo(() => {
    if (!searchSub.trim()) return subscribers;
    const q = searchSub.toLowerCase();
    return subscribers.filter(s =>
      s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.iban.toLowerCase().includes(q)
    );
  }, [subscribers, searchSub]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / SUBS_PER_PAGE));
  const paged = filtered.slice((page - 1) * SUBS_PER_PAGE, page * SUBS_PER_PAGE);

  const set = (key: keyof Omit<Subscriber, 'id'>, val: string | number) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    const subName = form.name.trim();
    if (editId) {
      onSubscribersChange(subscribers.map(s => s.id === editId ? { id: editId, ...form } : s));
      toast.success('تم تحديث بيانات المشترك');
    } else {
      onSubscribersChange([...subscribers, { id: uid(), ...form }]);
      toast.success('تمت إضافة المشترك بنجاح');
    }
    // حفظ العمليات المعلّقة للمشترك
    if (pendingOps.length > 0 && subName) {
      const newOps: Operation[] = pendingOps.map(op => ({
        id: uid(),
        subscriberName: subName,
        operation: op.operation,
        amount: op.amount,
        date: op.date,
        status: op.status,
      }));
      onOperationsChange([...operations, ...newOps]);
    }
    setForm({ ...EMPTY_SUB });
    setEditId(null);
    setCustomBank(false);
    setPendingOps([]);
    setShowAddOps(false);
    setTempOp({ operation: 'توزيع ارباح', amount: '', date: todayStr(), status: 'مكتمل' });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const startEdit = (sub: Subscriber) => {
    const { id, ...rest } = sub;
    setForm(rest);
    setEditId(id);
    setCustomBank(!ALL_BANKS_FLAT.includes(rest.bankName) && rest.bankName !== '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportSubscribersCSV = () => {
    const header = ['الاسم', 'الهاتف', 'IBAN', 'مبلغ الاشتراك', 'الأرباح', 'الرسوم', 'الحالة', 'تاريخ الانضمام', 'البنك', 'العملة', 'المنصة'];
    const rows = subscribers.map(s => [s.name, s.phone, s.iban, s.subscriptionAmount, s.profits, s.systemFees, s.subscriberStatus, s.joinDate, s.bankName, s.currency, s.platform]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `المشتركين_${new Date().toLocaleDateString('ar-SA').replace(/\//g,'_')}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('تم تصدير بيانات المشتركين');
  };

  const doDelete = (id: string) => {
    onSubscribersChange(subscribers.filter(s => s.id !== id));
    setDeleteId(null);
    setExpandedId(null);
    toast.error('تم حذف المشترك');
  };
  const cancelEdit = () => { setForm({ ...EMPTY_SUB }); setEditId(null); setCustomBank(false); };

  const f = form;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{editId ? 'تعديل مشترك' : sectionName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{subscribers.length} مشترك مسجّل</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportSubscribersCSV} variant="outline" size="sm" className="gap-1.5 border-slate-200 text-slate-600 h-9">
            <FileDown size={14} /> تصدير CSV
          </Button>
          {editId && (
            <Button variant="outline" onClick={cancelEdit} className="gap-1.5 border-slate-200 text-slate-600">
              <X size={14} /> إلغاء التعديل
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className={`h-1 ${editId ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-gradient-to-r from-emerald-400 to-teal-400'}`} />
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            {editId ? <><Pencil size={15} className="text-blue-500" />تعديل بيانات المشترك</> : <><UserPlus size={15} className="text-emerald-500" />بيانات المشترك الجديد</>}
          </CardTitle>
          <CardDescription className="text-xs">جميع الحقول اختيارية — تظهر فقط البيانات المُدخَلة عند الاستعلام</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FField label="اسم المشترك" icon={<User size={12} />} value={f.name} onChange={v => set('name', v)} placeholder="الاسم الكامل" />
            <FField label="رقم الهاتف" icon={<Phone size={12} />} value={f.phone} onChange={v => set('phone', v)} placeholder="05xxxxxxxx" />
            <FField label="رقم الآيبان (IBAN)" icon={<CreditCard size={12} />} value={f.iban} onChange={v => set('iban', v)} placeholder="SAxx xxxx xxxx" mono />
            <FField label="مبلغ الاشتراك (ر.س)" icon={<Wallet size={12} />} type="number" value={f.subscriptionAmount === 0 ? '' : String(f.subscriptionAmount)} onChange={v => set('subscriptionAmount', Number(v))} placeholder="0" />
            <FField label="الأرباح (ر.س)" icon={<TrendingUp size={12} />} type="number" value={f.profits === 0 ? '' : String(f.profits)} onChange={v => set('profits', Number(v))} placeholder="0" />
            <FField label="رسوم النظام (ر.س)" icon={<AlertCircle size={12} />} type="number" value={f.systemFees === 0 ? '' : String(f.systemFees)} onChange={v => set('systemFees', Number(v))} placeholder="0" />
            <FField label="حساب النظام" icon={<Building2 size={12} />} value={f.systemAccount} onChange={v => set('systemAccount', v)} placeholder="SYS-000000" mono />
            <FField label="عنوان المحفظة الرقمية" icon={<Hash size={12} />} value={f.walletAddress} onChange={v => set('walletAddress', v)} placeholder="0x..." mono />
            <FField label="تاريخ الانضمام" icon={<Calendar size={12} />} type="date" value={f.joinDate} onChange={v => set('joinDate', v)} />
          </div>

          {/* Status & Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Star size={11} />حالة المشترك</label>
              <Select value={f.subscriberStatus} onValueChange={v => set('subscriberStatus', v)}>
                <SelectTrigger className="h-10 border-slate-200 bg-white"><SelectValue placeholder="اختر الحالة" /></SelectTrigger>
                <SelectContent>{SUBSCRIBER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Building2 size={11} />البنك</label>
              {customBank ? (
                <div className="flex gap-2">
                  <Input value={f.bankName} onChange={e => set('bankName', e.target.value)} placeholder="اكتب اسم البنك" className="h-10 border-slate-200 flex-1" />
                  <Button variant="outline" size="sm" className="h-10 border-slate-200 text-xs px-3"
                    onClick={() => { setCustomBank(false); set('bankName', ''); }}>قائمة</Button>
                </div>
              ) : (
                <Select value={f.bankName} onValueChange={v => {
                  if (v === '__custom__') { setCustomBank(true); set('bankName', ''); }
                  else set('bankName', v);
                }}>
                  <SelectTrigger className="h-10 border-slate-200 bg-white"><SelectValue placeholder="اختر البنك" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {Object.entries(GULF_BANKS).map(([country, banks]) => (
                      <React.Fragment key={country}>
                        <div className="px-2 py-1 text-xs font-black text-slate-400 bg-slate-50 border-b border-slate-100">{country}</div>
                        {banks.map(b => <SelectItem key={b} value={b} className="text-sm">{b}</SelectItem>)}
                      </React.Fragment>
                    ))}
                    <Separator className="my-1" />
                    <SelectItem value="__custom__" className="text-emerald-600 font-bold text-sm">+ أدخل اسم البنك يدوياً</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Currency & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Currency */}
            <div ref={currencyRef} className="relative">
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Globe size={11} />العملة</label>
              <button type="button" onClick={() => { setCurrencyOpen(v => !v); setPlatformOpen(false); }}
                className="w-full h-10 border border-slate-200 rounded-md bg-white px-3 flex items-center justify-between text-sm hover:border-slate-300 transition-colors">
                {selectedCurrency ? (
                  <span className="flex items-center gap-2">
                    <span className="text-base font-bold text-emerald-600">{selectedCurrency.symbol}</span>
                    <span className="font-medium">{selectedCurrency.code}</span>
                    <span className="text-slate-400 text-xs">— {selectedCurrency.nameAr}</span>
                  </span>
                ) : <span className="text-slate-400">اختر العملة</span>}
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${currencyOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {currencyOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-1 right-0 left-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Input value={currencySearch} onChange={e => setCurrencySearch(e.target.value)}
                          placeholder="بحث بالاسم أو الرمز أو الكود..." className="h-9 pr-8 border-slate-200 text-sm" />
                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredCurrencies.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-sm">لا توجد نتائج</div>
                      ) : filteredCurrencies.map(c => (
                        <button key={c.code} type="button"
                          onClick={() => { set('currency', c.code); setCurrencyOpen(false); setCurrencySearch(''); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-right ${f.currency === c.code ? 'bg-emerald-50' : ''}`}>
                          <span className="text-lg font-bold text-emerald-600 w-8 text-center flex-shrink-0">{c.symbol}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-800">{c.code}</span>
                              <span className="text-sm text-slate-600">{c.nameAr}</span>
                            </div>
                            <p className="text-xs text-slate-400">{c.countryAr} · {c.countryEn}</p>
                          </div>
                          {f.currency === c.code && <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                    {f.currency && (
                      <div className="p-2 border-t border-slate-100">
                        <button type="button" onClick={() => { set('currency', ''); setCurrencyOpen(false); }}
                          className="w-full text-xs text-slate-500 hover:text-red-500 py-1.5 transition-colors">مسح الاختيار</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Platform */}
            <div ref={platformRef} className="relative">
              <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Cpu size={11} />المنصة</label>
              <button type="button" onClick={() => { setPlatformOpen(v => !v); setCurrencyOpen(false); }}
                className="w-full h-10 border border-slate-200 rounded-md bg-white px-3 flex items-center justify-between text-sm hover:border-slate-300 transition-colors">
                {selectedPlatform ? (
                  <span className="flex items-center gap-2">
                    <span className={`${selectedPlatform.color} text-white text-xs font-black px-1.5 py-0.5 rounded flex-shrink-0`}>{selectedPlatform.abbr}</span>
                    <span className="font-medium">{selectedPlatform.name}</span>
                    <Badge className={`text-xs border-none ${selectedPlatform.type === 'crypto' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                      {selectedPlatform.type === 'crypto' ? 'كريبتو' : 'فوركس'}
                    </Badge>
                  </span>
                ) : <span className="text-slate-400">اختر المنصة</span>}
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${platformOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {platformOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full mt-1 right-0 left-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                      <div className="relative">
                        <Input value={platformSearch} onChange={e => setPlatformSearch(e.target.value)}
                          placeholder="بحث في المنصات..." className="h-9 pr-8 border-slate-200 text-sm" />
                        <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {cryptoPlatforms.length > 0 && (
                        <>
                          <div className="px-3 py-1.5 bg-yellow-50 border-b border-yellow-100">
                            <span className="text-xs font-black text-yellow-700">🔷 منصات الكريبتو ({cryptoPlatforms.length})</span>
                          </div>
                          {cryptoPlatforms.map(p => (
                            <PlatformItem key={p.name} platform={p} selected={f.platform === p.name}
                              onClick={() => { set('platform', p.name); setPlatformOpen(false); setPlatformSearch(''); }} />
                          ))}
                        </>
                      )}
                      {forexPlatforms.length > 0 && (
                        <>
                          <div className="px-3 py-1.5 bg-blue-50 border-b border-blue-100 border-t border-t-slate-100">
                            <span className="text-xs font-black text-blue-700">📊 منصات الفوركس ({forexPlatforms.length})</span>
                          </div>
                          {forexPlatforms.map(p => (
                            <PlatformItem key={p.name} platform={p} selected={f.platform === p.name}
                              onClick={() => { set('platform', p.name); setPlatformOpen(false); setPlatformSearch(''); }} />
                          ))}
                        </>
                      )}
                      {cryptoPlatforms.length === 0 && forexPlatforms.length === 0 && (
                        <div className="py-6 text-center text-slate-400 text-sm">لا توجد نتائج</div>
                      )}
                    </div>
                    {f.platform && (
                      <div className="p-2 border-t border-slate-100">
                        <button type="button" onClick={() => { set('platform', ''); setPlatformOpen(false); }}
                          className="w-full text-xs text-slate-500 hover:text-red-500 py-1.5 transition-colors">مسح الاختيار</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1"><FileText size={11} />ملاحظات (اختياري)</label>
            <textarea value={f.notes} onChange={e => set('notes', e.target.value)} placeholder="أي ملاحظات إضافية..." rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all" />
          </div>

          {/* Subscriber Operations Section */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><ClipboardList size={11} />سجل عمليات للمشترك (اختياري)</label>
              <button type="button" onClick={() => setShowAddOps(v => !v)}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1 transition-colors">
                {showAddOps ? <><X size={12} /> إغلاق</> : <><Plus size={12} /> إضافة عملية</>}
              </button>
            </div>
            {pendingOps.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {pendingOps.map((op, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="font-bold text-emerald-700">{op.operation}</span>
                      {op.amount && <span className="text-slate-500">· {op.amount}</span>}
                      <span className="text-slate-400">· {op.date}</span>
                      <Badge className="text-[10px] px-1.5 py-0 bg-white border border-emerald-200 text-emerald-700">{op.status}</Badge>
                    </div>
                    <button type="button" onClick={() => setPendingOps(p => p.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500 transition-colors"><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
            {showAddOps && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">نوع العملية</label>
                    <Select value={tempOp.operation} onValueChange={v => setTempOp(p => ({ ...p, operation: v }))}>
                      <SelectTrigger className="h-9 border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{OPERATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">الحالة</label>
                    <Select value={tempOp.status} onValueChange={v => setTempOp(p => ({ ...p, status: v }))}>
                      <SelectTrigger className="h-9 border-slate-200 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">المبلغ (اختياري)</label>
                    <Input value={tempOp.amount} onChange={e => setTempOp(p => ({ ...p, amount: e.target.value }))}
                      placeholder="1,500 ر.س" className="h-9 border-slate-200 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">التاريخ</label>
                    <Input type="date" value={tempOp.date} onChange={e => setTempOp(p => ({ ...p, date: e.target.value }))}
                      className="h-9 border-slate-200 text-sm" />
                  </div>
                </div>
                <Button type="button" size="sm"
                  onClick={() => {
                    setPendingOps(p => [...p, { ...tempOp }]);
                    setTempOp({ operation: 'توزيع ارباح', amount: '', date: todayStr(), status: 'مكتمل' });
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 text-xs h-8 px-4">
                  <Plus size={12} /> إضافة للقائمة
                </Button>
              </div>
            )}
            {!showAddOps && pendingOps.length === 0 && (
              <p className="text-xs text-slate-400">عند إضافة عمليات ستظهر في صفحة الاستعلام عند البحث عن هذا المشترك</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-5">
            <Button onClick={handleSave} className={`gap-1.5 px-6 ${editId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              <Save size={14} /> {editId ? 'حفظ التعديل' : 'إضافة المشترك'}
            </Button>
            {editId && <Button variant="outline" onClick={cancelEdit} className="border-slate-200 text-slate-600">إلغاء</Button>}
            <AnimatePresence>
              {saved && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="text-emerald-600 text-sm font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> {editId ? 'تم التعديل' : 'تم الحفظ بنجاح'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-black text-slate-800">قائمة المشتركين</CardTitle>
              <CardDescription className="text-xs">{filtered.length} من {subscribers.length} مشترك</CardDescription>
            </div>
            <div className="relative w-full sm:w-60">
              <Input placeholder="بحث في المشتركين..." className="h-9 pr-8 border-slate-200 text-sm"
                value={searchSub} onChange={e => { setSearchSub(e.target.value); setPage(1); }} />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {paged.map(sub => (
              <SubRow key={sub.id} sub={sub}
                expanded={expandedId === sub.id}
                onToggle={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                onEdit={() => startEdit(sub)}
                onDelete={() => setDeleteId(sub.id)}
              />
            ))}
            {paged.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <Users size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="font-medium text-sm">لا يوجد مشتركون</p>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">صفحة {page} من {totalPages} · {filtered.length} مشترك</span>
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronRight size={13} /> السابق
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pg = page <= 3 ? i + 1 : page + i - 2;
                  if (pg > totalPages) return null;
                  return (
                    <Button key={pg} size="sm"
                      className={`h-8 w-8 p-0 text-xs ${pg === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      onClick={() => setPage(pg)}>{pg}</Button>
                  );
                })}
                <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  التالي <ChevronLeft size={13} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">تأكيد حذف المشترك</AlertDialogTitle>
            <AlertDialogDescription className="text-right">سيتم حذف البيانات نهائياً ولا يمكن التراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && doDelete(deleteId)} className="bg-red-600 hover:bg-red-700">حذف المشترك</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function PlatformItem({ platform, selected, onClick }: { platform: TradingPlatform; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors ${selected ? 'bg-blue-50' : ''}`}>
      <span className={`${platform.color} text-white text-xs font-black px-1.5 py-0.5 rounded min-w-[36px] text-center flex-shrink-0`}>
        {platform.abbr}
      </span>
      <span className="flex-1 text-sm font-medium text-slate-700 text-right">{platform.name}</span>
      {selected && <CheckCircle2 size={14} className="text-blue-500 flex-shrink-0" />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Subscriber Row
// ─────────────────────────────────────────────────────────────

function SubRow({ sub, expanded, onToggle, onEdit, onDelete }: {
  sub: Subscriber; expanded: boolean;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="hover:bg-slate-50/60 transition-colors">
      <div className="flex items-center gap-3 px-5 py-3.5 cursor-pointer" onClick={onToggle}>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-slate-800">{sub.name || '(بدون اسم)'}</p>
            {sub.subscriberStatus && subStatusBadge(sub.subscriberStatus)}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {sub.phone && <span className="text-xs text-slate-400">{sub.phone}</span>}
            {sub.bankName && <span className="text-xs text-slate-400 hidden sm:inline">· {sub.bankName}</span>}
            {sub.subscriptionAmount > 0 && <span className="text-xs font-bold text-emerald-600 hidden sm:inline">· {sub.subscriptionAmount.toLocaleString()} ر.س</span>}
            {sub.currency && <span className="text-xs text-blue-500 font-bold hidden sm:inline">· {sub.currency}</span>}
            {sub.platform && <span className="text-xs text-purple-500 font-medium hidden lg:inline">· {sub.platform}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          <button onClick={e => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors ml-1"><Pencil size={13} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-4 pt-3 border-t border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {sub.iban && <Chip icon={<CreditCard size={12} />} label="آيبان" value={sub.iban} mono />}
                {sub.subscriptionAmount > 0 && <Chip icon={<Wallet size={12} />} label="الاشتراك" value={`${sub.subscriptionAmount.toLocaleString()} ر.س`} />}
                {sub.profits > 0 && <Chip icon={<TrendingUp size={12} />} label="الأرباح" value={`${sub.profits.toLocaleString()} ر.س`} green />}
                {sub.systemFees > 0 && <Chip icon={<AlertCircle size={12} />} label="رسوم النظام" value={`${sub.systemFees.toLocaleString()} ر.س`} orange />}
                {sub.systemAccount && <Chip icon={<Building2 size={12} />} label="حساب النظام" value={sub.systemAccount} mono />}
                {sub.bankName && <Chip icon={<Banknote size={12} />} label="البنك" value={sub.bankName} />}
                {sub.joinDate && <Chip icon={<Calendar size={12} />} label="الانضمام" value={sub.joinDate} />}
                {sub.walletAddress && <Chip icon={<Hash size={12} />} label="المحفظة" value={`${sub.walletAddress.slice(0, 12)}…`} mono />}
                {sub.currency && <Chip icon={<Globe size={12} />} label="العملة" value={sub.currency} />}
                {sub.platform && <Chip icon={<Cpu size={12} />} label="المنصة" value={sub.platform} />}
              </div>
              {sub.notes && (
                <div className="mt-3 p-2.5 rounded-lg bg-yellow-50 ring-1 ring-yellow-200 text-xs text-slate-600">
                  <span className="font-bold text-yellow-700">ملاحظة: </span>{sub.notes}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tiny shared components
// ─────────────────────────────────────────────────────────────

function FField({ label, value, onChange, type = 'text', icon, placeholder, mono = false }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; icon?: React.ReactNode; placeholder?: string; mono?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">{icon}{label}</label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? label}
        className={`h-10 border-slate-200 bg-white focus:ring-2 focus:ring-emerald-300 transition-all ${mono ? 'font-mono text-xs' : ''}`} />
    </div>
  );
}

function Chip({ icon, label, value, mono = false, green = false, orange = false }: {
  icon: React.ReactNode; label: string; value: string;
  mono?: boolean; green?: boolean; orange?: boolean;
}) {
  return (
    <div className="bg-slate-50 ring-1 ring-slate-200 rounded-xl p-2.5 space-y-0.5">
      <div className="flex items-center gap-1 text-slate-400">{icon}<span className="text-xs">{label}</span></div>
      <p className={`text-xs font-bold break-all leading-tight ${mono ? 'font-mono' : ''} ${green ? 'text-emerald-600' : orange ? 'text-orange-600' : 'text-slate-700'}`}>{value}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AdvancedSystemTab — النظام المتقدم بصرياً
// ─────────────────────────────────────────────────────────────

type AdvancedSubTab = 'dashboard' | 'admin' | 'operations' | 'subscribers';

function AdvancedSystemTab({
  subscribers, operations, stats, systemConfig, onOperationsChange, onSubscribersChange,
}: {
  subscribers: Subscriber[];
  operations: Operation[];
  stats: LiveStats;
  systemConfig: SystemConfig;
  onOperationsChange: (o: Operation[]) => void;
  onSubscribersChange: (s: Subscriber[]) => void;
}) {
  const [subTab, setSubTab] = useState<AdvancedSubTab>('dashboard');

  const subTabs: { id: AdvancedSubTab; label: string; icon: React.ReactNode; from: string; to: string; glow: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={16} />, from: '#3b82f6', to: '#06b6d4', glow: 'rgba(59,130,246,0.4)' },
    { id: 'admin', label: 'الاستعلام', icon: <Search size={16} />, from: '#10b981', to: '#14b8a6', glow: 'rgba(16,185,129,0.4)' },
    { id: 'operations', label: 'العمليات', icon: <ClipboardList size={16} />, from: '#8b5cf6', to: '#7c3aed', glow: 'rgba(139,92,246,0.4)' },
    { id: 'subscribers', label: 'المشتركون', icon: <Users size={16} />, from: '#f59e0b', to: '#f97316', glow: 'rgba(245,158,11,0.4)' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a3e 40%, #24243e 100%)' }}>

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden px-4 lg:px-10 pt-8 pb-6">
        {/* خلفية جمالية */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
        </div>

        <div className="relative z-10 max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">

            {/* الشعار والعنوان */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Crown size={30} className="text-white" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl lg:text-3xl font-black text-white">النظام المتقدم</h1>
                  <span className="text-xs font-black px-2 py-1 rounded-full border text-amber-300 border-amber-500/50"
                    style={{ background: 'rgba(245,158,11,0.15)' }}>PRO</span>
                </div>
                <p className="text-slate-400 text-sm">نسخة احترافية محسّنة بصرياً — جميع البيانات مشتركة مع النظام الأصلي</p>
              </div>
            </div>

            {/* KPIs سريعة في الهيدر */}
            <div className="lg:mr-auto flex items-center gap-3 flex-wrap">
              {[
                { label: 'مشترك', value: subscribers.length, icon: <Users size={14} />, color: '#3b82f6' },
                { label: 'عملية', value: operations.length, icon: <Activity size={14} />, color: '#10b981' },
                { label: 'نشط', value: subscribers.filter(s => s.subscriberStatus === 'نشط').length, icon: <CheckCircle2 size={14} />, color: '#8b5cf6' },
                { label: 'معلق', value: operations.filter(o => o.status === 'قيد المعالجة').length, icon: <Clock size={14} />, color: '#f59e0b' },
              ].map((kpi, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                  <span style={{ color: kpi.color }}>{kpi.icon}</span>
                  <span className="text-xl font-black text-white">{kpi.value}</span>
                  <span className="text-slate-400 text-xs">{kpi.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── تبويبات داخلية ── */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1">
            {subTabs.map(tab => (
              <button key={tab.id} onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  subTab === tab.id
                    ? 'text-white shadow-lg scale-105'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={subTab === tab.id
                  ? { background: `linear-gradient(135deg, ${tab.from}, ${tab.to})`, boxShadow: `0 4px 20px ${tab.glow}` }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }
                }>
                {tab.icon}
                {tab.label}
                {subTab === tab.id && (
                  <motion.span layoutId="adv-tab-indicator"
                    className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── محتوى التبويب ── */}
      <div className="px-4 lg:px-10 pb-10 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          {subTab === 'dashboard' && (
            <motion.div key="adv-dash" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6 pt-6">
              <AdvancedDashboard subscribers={subscribers} operations={operations} stats={stats} />
            </motion.div>
          )}
          {subTab === 'admin' && (
            <motion.div key="adv-admin" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6 pt-6">
              <AdvancedAdminPanel subscribers={subscribers} operations={operations} />
            </motion.div>
          )}
          {subTab === 'operations' && (
            <motion.div key="adv-ops" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6 pt-6">
              <AdvancedOperations operations={operations} onOperationsChange={onOperationsChange} subscriberNames={subscribers.map(s => s.name)} />
            </motion.div>
          )}
          {subTab === 'subscribers' && (
            <motion.div key="adv-subs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6 pt-6">
              <AdvancedSubscribers subscribers={subscribers} operations={operations} onSubscribersChange={onSubscribersChange} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── الداشبورد المتقدم ──
function AdvancedDashboard({ subscribers, operations, stats }: { subscribers: Subscriber[]; operations: Operation[]; stats: LiveStats }) {
  const completedOps = operations.filter(o => o.status === 'مكتمل').length;
  const pendingOps = operations.filter(o => o.status === 'قيد المعالجة').length;
  const activationOps = operations.filter(o => o.status === 'تنشيط النظام').length;
  const activeSubscribers = subscribers.filter(s => s.subscriberStatus === 'نشط').length;
  const totalFees = subscribers.reduce((a, s) => a + s.systemFees, 0);
  const avgSubscription = subscribers.length ? Math.round(subscribers.reduce((a, s) => a + s.subscriptionAmount, 0) / subscribers.length) : 0;

  const glowCards = [
    {
      title: 'إجمالي المشتركين', value: stats.totalSubscribers, sub: `نشط: ${activeSubscribers}`,
      icon: <Users size={24} />, gradientCss: 'linear-gradient(135deg,#2563eb,#06b6d4)', glow: 'rgba(59,130,246,0.4)',
      trend: '+12%', up: true,
    },
    {
      title: 'إجمالي الأرباح', value: stats.totalProfits, sub: `${completedOps} عملية مكتملة`,
      icon: <TrendingUp size={24} />, gradientCss: 'linear-gradient(135deg,#10b981,#2dd4bf)', glow: 'rgba(16,185,129,0.4)',
      trend: '+8.3%', up: true,
    },
    {
      title: 'الاشتراكات النشطة', value: stats.activeSubscriptions, sub: `من ${stats.totalSubsCount} مشترك`,
      icon: <CheckCheck size={24} />, gradientCss: 'linear-gradient(135deg,#7c3aed,#a855f7)', glow: 'rgba(139,92,246,0.4)',
      trend: '+5.1%', up: true,
    },
    {
      title: 'رسوم مستحقة', value: stats.pendingRequests, sub: `${stats.activationOpsStr} تنشيط`,
      icon: <AlertCircle size={24} />, gradientCss: 'linear-gradient(135deg,#f59e0b,#fb923c)', glow: 'rgba(245,158,11,0.4)',
      trend: '-2.4%', up: false,
    },
  ];

  const pieData = [
    { name: 'نشط', value: subscribers.filter(s => s.subscriberStatus === 'نشط').length, color: '#10b981' },
    { name: 'جديد', value: subscribers.filter(s => s.subscriberStatus === 'مشترك جديد').length, color: '#3b82f6' },
    { name: 'رسوم', value: subscribers.filter(s => s.subscriberStatus === 'رسوم مستحقة').length, color: '#f59e0b' },
    { name: 'أرباح', value: subscribers.filter(s => s.subscriberStatus === 'توزيع أرباح').length, color: '#8b5cf6' },
    { name: 'معلق', value: subscribers.filter(s => s.subscriberStatus === 'معلق').length, color: '#64748b' },
  ].filter(d => d.value > 0);

  return (
    <>
      {/* بطاقات الإحصائيات المضيئة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {glowCards.map((card, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative rounded-2xl p-5 overflow-hidden cursor-default"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: `0 0 30px ${card.glow}` }}>
            {/* توهج خلفي */}
            <div className="absolute inset-0 opacity-10 rounded-2xl"
              style={{ background: `linear-gradient(135deg, ${card.glow}, transparent)` }} />
            {/* أيقونة بتدرج */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg"
              style={{ background: card.gradientCss }}>
              {card.icon}
            </div>
            <p className="text-slate-400 text-xs font-medium mb-1">{card.title}</p>
            <h3 className="text-2xl font-black text-white mb-1">{card.value}</h3>
            <div className="flex items-center justify-between">
              <p className="text-slate-500 text-xs">{card.sub}</p>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${card.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{card.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ثانياً: إضافية KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'متوسط الاشتراك', value: `${avgSubscription.toLocaleString()} ر.س`, icon: <DollarSign size={14} />, color: '#3b82f6' },
          { label: 'إجمالي الرسوم', value: `${totalFees.toLocaleString()} ر.س`, icon: <AlertCircle size={14} />, color: '#f59e0b' },
          { label: 'عمليات معلقة', value: pendingOps, icon: <Clock size={14} />, color: '#8b5cf6' },
          { label: 'عمليات تنشيط', value: activationOps, icon: <Zap size={14} />, color: '#ef4444' },
        ].map((item, i) => (
          <div key={i} className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}22`, border: `1px solid ${item.color}44` }}>
              <span style={{ color: item.color }}>{item.icon}</span>
            </div>
            <div>
              <p className="text-slate-500 text-xs">{item.label}</p>
              <p className="text-white font-black text-sm">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* مخطط الأرباح */}
        <div className="lg:col-span-2 rounded-2xl p-5 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-black">نمو الأرباح الشهرية</h3>
              <p className="text-slate-500 text-xs mt-0.5">المقارنة مع الهدف المخطط</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold">مباشر</span>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="advGVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="advGTgt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  formatter={(v: number, name: string) => [`${v.toLocaleString()} ر.س`, name === 'value' ? 'الأرباح' : 'الهدف']}
                />
                <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#advGTgt)" />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#advGVal)" dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* مخطط الحالات */}
        <div className="rounded-2xl p-5 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="text-white font-black mb-1">توزيع الحالات</h3>
          <p className="text-slate-500 text-xs mb-4">حسب حالة اشتراك المشترك</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                  formatter={(v: number, _n: string, p: any) => [`${v} مشترك`, p.payload.name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* آخر العمليات */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-black">آخر العمليات</h3>
          <span className="text-xs text-slate-500 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {operations.length} عملية
          </span>
        </div>
        <div className="divide-y divide-white/5">
          {operations.slice(0, 7).map((op, i) => (
            <motion.div key={op.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                op.status === 'مكتمل' ? 'bg-emerald-500/20' :
                op.status === 'تنشيط النظام' ? 'bg-red-500/20' : 'bg-blue-500/20'
              }`}>
                {op.status === 'مكتمل' ? <CheckCircle2 size={14} className="text-emerald-400" /> :
                  op.status === 'تنشيط النظام' ? <AlertCircle size={14} className="text-red-400" /> :
                    <Clock size={14} className="text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{op.subscriberName}</p>
                <p className="text-xs text-slate-500">{op.operation} · {op.date}</p>
              </div>
              <span className={`text-sm font-black ${op.status === 'مكتمل' ? 'text-emerald-400' : op.status === 'تنشيط النظام' ? 'text-red-400' : 'text-blue-400'}`}>
                {op.amount}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* إحصائيات النظام */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'عمليات مكتملة', value: completedOps, total: operations.length, color: '#10b981', icon: <CheckCircle2 size={16} /> },
          { label: 'قيد المعالجة', value: pendingOps, total: operations.length, color: '#3b82f6', icon: <Clock size={16} /> },
          { label: 'تنشيط النظام', value: activationOps, total: operations.length, color: '#ef4444', icon: <Zap size={16} /> },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span style={{ color: item.color }}>{item.icon}</span>
              <span className="text-slate-300 text-sm font-bold">{item.label}</span>
              <span className="mr-auto text-white font-black">{item.value} / {item.total}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${item.total ? item.value / item.total * 100 : 0}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${item.color}99, ${item.color})` }} />
            </div>
            <p className="text-slate-500 text-xs mt-2">{item.total ? Math.round(item.value / item.total * 100) : 0}% من الإجمالي</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// دوال التصدير والطباعة
// ─────────────────────────────────────────────────────────────

function drawRoundRectCanvas(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function printSubscriberPDF(found: Subscriber, subscriberOps: Operation[]) {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) { toast.error('يرجى السماح بالنوافذ المنبثقة'); return; }

  const fields = [
    { label: 'الجوال', value: found.phone },
    { label: 'الآيبان', value: found.iban },
    { label: 'البنك', value: found.bankName },
    { label: 'حساب النظام', value: found.systemAccount },
    { label: 'العملة', value: found.currency },
    { label: 'المنصة', value: found.platform },
    { label: 'تاريخ الانضمام', value: found.joinDate },
  ].filter(f => f.value && String(f.value).trim() !== '');

  const financials = [
    { label: 'مبلغ الاشتراك', value: found.subscriptionAmount, color: '#1d4ed8' },
    { label: 'الأرباح', value: found.profits, color: '#059669' },
    { label: 'رسوم النظام', value: found.systemFees, color: '#d97706' },
  ].filter(f => f.value != null && Number(f.value) > 0);

  const opsHTML = subscriberOps.length > 0 ? `
    <div class="section">
      <div class="section-title">سجل العمليات (${subscriberOps.length})</div>
      <table>
        <thead><tr><th>#</th><th>العملية</th><th>المبلغ</th><th>التاريخ</th><th>الحالة</th></tr></thead>
        <tbody>
          ${subscriberOps.slice(0, 20).map((op, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${op.operation}</td>
              <td style="color:${op.status === 'مكتمل' ? '#059669' : op.status === 'تنشيط النظام' ? '#dc2626' : '#2563eb'};font-weight:700;">${op.amount}</td>
              <td>${op.date}</td>
              <td>${op.status}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>` : '';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>بيانات المشترك — ${found.name}</title>
<style>
  @page { size: A4 portrait; margin: 18mm 15mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, Tahoma, sans-serif; direction: rtl; color: #1e293b; background: white; font-size: 13px; line-height: 1.6; }
  .header { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); color: white; padding: 22px 20px; border-radius: 10px; margin-bottom: 18px; }
  .header-title { font-size: 22px; font-weight: 900; margin-bottom: 3px; }
  .header-sub { font-size: 11px; color: #94a3b8; }
  .name-row { margin-bottom: 16px; }
  .subscriber-name { font-size: 28px; font-weight: 900; color: #0f172a; margin-bottom: 5px; }
  .status-badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
  .section { margin-bottom: 18px; }
  .section-title { font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1.5px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.5px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .field { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; }
  .field-label { font-size: 10px; color: #94a3b8; font-weight: 600; margin-bottom: 3px; }
  .field-value { font-size: 13px; font-weight: 700; color: #0f172a; word-break: break-all; }
  .fin-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .fin-card { border-radius: 8px; padding: 12px 14px; border: 1px solid #e2e8f0; }
  .fin-label { font-size: 10px; margin-bottom: 5px; font-weight: 600; }
  .fin-value { font-size: 20px; font-weight: 900; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 4px; }
  th { background: #f1f5f9; padding: 8px 10px; text-align: right; font-weight: 700; color: #475569; border-bottom: 2px solid #e2e8f0; }
  td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  tr:nth-child(even) td { background: #fafafa; }
  .wallet-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 10px 12px; font-family: monospace; font-size: 11px; color: #7c3aed; word-break: break-all; }
  .notes-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #92400e; }
  .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <div class="header">
    <div class="header-title">نظام إدارة المشتركين</div>
    <div class="header-sub">تقرير بيانات المشترك — ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
  <div class="name-row">
    <div class="subscriber-name">${found.name}</div>
    ${found.subscriberStatus ? `<span class="status-badge">${found.subscriberStatus}</span>` : ''}
  </div>
  ${fields.length > 0 ? `
  <div class="section">
    <div class="section-title">البيانات الشخصية</div>
    <div class="grid">
      ${fields.map(f => `<div class="field"><div class="field-label">${f.label}</div><div class="field-value">${f.value}</div></div>`).join('')}
    </div>
  </div>` : ''}
  ${financials.length > 0 ? `
  <div class="section">
    <div class="section-title">الملخص المالي</div>
    <div class="fin-grid">
      ${financials.map(f => `
        <div class="fin-card" style="background:${f.color}10;border-color:${f.color}30;">
          <div class="fin-label" style="color:${f.color};">${f.label}</div>
          <div class="fin-value" style="color:${f.color};">${f.value.toLocaleString()} ر.س</div>
        </div>`).join('')}
    </div>
  </div>` : ''}
  ${found.walletAddress ? `
  <div class="section">
    <div class="section-title">المحفظة الرقمية</div>
    <div class="wallet-box">${found.walletAddress}</div>
  </div>` : ''}
  ${found.notes ? `<div class="notes-box" style="margin-bottom:18px;">${found.notes}</div>` : ''}
  ${opsHTML}
  <div class="footer">
    <span>نظام إدارة المشتركين — Moshtarikeen Hub</span>
    <span>طُبع في: ${new Date().toLocaleString('ar-SA')}</span>
  </div>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 700);
}

function downloadSubscriberPNG(found: Subscriber, subscriberOps: Operation[]) {
  // ── Light-theme PNG matching the AdminPanel UI exactly ──
  const fields = [
    { label: 'الجوال', value: found.phone },
    { label: 'الآيبان', value: found.iban },
    { label: 'البنك', value: found.bankName },
    { label: 'حساب النظام', value: found.systemAccount },
    { label: 'العملة', value: found.currency },
    { label: 'المنصة', value: found.platform },
    { label: 'تاريخ الانضمام', value: found.joinDate },
  ].filter(f => f.value && String(f.value).trim() !== '');

  // ── Light-theme matching FinBox: bg/ring/color for each financial ──
  const financials = [
    { label: 'مبلغ الاشتراك', value: found.subscriptionAmount, bg: '#eff6ff', ring: '#bfdbfe', color: '#1d4ed8' },
    { label: 'الأرباح', value: found.profits, bg: '#ecfdf5', ring: '#a7f3d0', color: '#047857' },
    { label: 'رسوم النظام', value: found.systemFees, bg: '#fff7ed', ring: '#fed7aa', color: '#ea580c' },
  ].filter(f => f.value != null && Number(f.value) > 0);

  const opsToShow = subscriberOps.slice(0, 12);
  const FCOLS = 4;
  const fieldRows = Math.ceil(fields.length / FCOLS);

  const W = 1200;
  const PAD = 48;
  // Dynamic height calculation
  let H = 76 + 16;                                          // header bar + gap
  H += 104 + 16;                                           // profile card + gap
  if (fields.length > 0) H += 22 + fieldRows * 76 + 16;   // section title + fields
  if (financials.length > 0) H += 22 + 88 + 16;           // section title + fin boxes
  if (found.walletAddress) H += 56 + 12;                  // wallet box
  if (found.notes) H += 56 + 12;                          // notes box
  if (opsToShow.length > 0) H += 22 + 40 + opsToShow.length * 44 + 16; // section title + table
  H += 52;                                                  // footer

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Background: slate-50 ──
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);
  // Subtle grid
  ctx.strokeStyle = 'rgba(148,163,184,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 48) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let yg = 0; yg < H; yg += 48) { ctx.beginPath(); ctx.moveTo(0, yg); ctx.lineTo(W, yg); ctx.stroke(); }

  // ── Header Bar: white, emerald→teal→blue accent stripe ──
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, W, 72);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 71, W, 1);
  const acG = ctx.createLinearGradient(0, 0, W, 0);
  acG.addColorStop(0, '#34d399'); acG.addColorStop(0.35, '#2dd4bf'); acG.addColorStop(1, '#60a5fa');
  ctx.fillStyle = acG;
  ctx.fillRect(0, 0, W, 4);
  // Logo circle (emerald-50, emerald ring)
  ctx.fillStyle = '#ecfdf5'; ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(W - PAD - 22, 36, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#065f46'; ctx.font = 'bold 19px Arial'; ctx.textAlign = 'center';
  ctx.fillText('م', W - PAD - 22, 43);
  // Title text
  ctx.fillStyle = '#0f172a'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'right';
  ctx.fillText('نظام إدارة المشتركين', W - PAD - 58, 37);
  ctx.fillStyle = '#94a3b8'; ctx.font = '13px Arial';
  ctx.fillText(`تقرير استعلام — ${new Date().toLocaleDateString('ar-SA')}`, W - PAD - 58, 57);

  let y = 88;

  // ── Profile Card: white, ring-slate-200, emerald top strip, emerald avatar ──
  ctx.fillStyle = 'white';
  ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 2;
  drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 100, 14); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
  drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 100, 14); ctx.stroke();
  // Accent top strip (emerald→teal→blue, 5px)
  const profAccG = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  profAccG.addColorStop(0, '#34d399'); profAccG.addColorStop(0.4, '#2dd4bf'); profAccG.addColorStop(1, '#60a5fa');
  ctx.fillStyle = profAccG;
  ctx.beginPath();
  ctx.moveTo(PAD + 14, y); ctx.lineTo(W - PAD - 14, y);
  ctx.quadraticCurveTo(W - PAD, y, W - PAD, y + 7);
  ctx.lineTo(W - PAD, y + 5); ctx.lineTo(PAD, y + 5);
  ctx.quadraticCurveTo(PAD, y, PAD + 14, y);
  ctx.closePath(); ctx.fill();
  // Avatar: emerald-400 → teal-500 rounded square (matching from-emerald-400 to-teal-500)
  const avGrad = ctx.createLinearGradient(PAD + 18, y + 14, PAD + 82, y + 86);
  avGrad.addColorStop(0, '#34d399'); avGrad.addColorStop(1, '#14b8a6');
  ctx.fillStyle = avGrad;
  drawRoundRectCanvas(ctx, PAD + 18, y + 16, 68, 68, 14); ctx.fill();
  // Person silhouette (head + shoulders)
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.beginPath(); ctx.arc(PAD + 52, y + 38, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(PAD + 52, y + 68, 20, 13, 0, Math.PI, 0); ctx.fill();
  // Verified dot (emerald-500, white border)
  ctx.fillStyle = '#10b981'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(PAD + 78, y + 76, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'white'; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
  ctx.fillText('✓', PAD + 78, y + 80);
  // Subscriber name (text-slate-800 font-black)
  ctx.fillStyle = '#1e293b'; ctx.font = 'bold 26px Arial'; ctx.textAlign = 'right';
  ctx.fillText(found.name, W - PAD - 16, y + 46);
  // Status badge
  if (found.subscriberStatus) {
    const stMap: Record<string, { bg: string; ring: string; txt: string }> = {
      'نشط':         { bg: '#ecfdf5', ring: '#a7f3d0', txt: '#047857' },
      'مشترك جديد': { bg: '#eff6ff', ring: '#bfdbfe', txt: '#1d4ed8' },
      'رسوم مستحقة':{ bg: '#fff7ed', ring: '#fed7aa', txt: '#c2410c' },
      'توزيع أرباح':{ bg: '#faf5ff', ring: '#e9d5ff', txt: '#7e22ce' },
      'معلق':        { bg: '#f1f5f9', ring: '#cbd5e1', txt: '#475569' },
      'موقوف':       { bg: '#fef2f2', ring: '#fecaca', txt: '#991b1b' },
    };
    const sc = stMap[found.subscriberStatus] ?? { bg: '#f1f5f9', ring: '#cbd5e1', txt: '#475569' };
    ctx.font = 'bold 12px Arial';
    const nameW = ctx.measureText(found.name).width;
    const sw = ctx.measureText(found.subscriberStatus).width + 16;
    const sx = W - PAD - 16 - nameW - 12 - sw;
    ctx.fillStyle = sc.bg; ctx.strokeStyle = sc.ring; ctx.lineWidth = 1;
    drawRoundRectCanvas(ctx, sx, y + 28, sw, 22, 11); ctx.fill(); ctx.stroke();
    ctx.fillStyle = sc.txt; ctx.textAlign = 'right';
    ctx.fillText(found.subscriberStatus, sx + sw - 8, y + 44);
  }
  // Verified badge (bg-slate-100 text-slate-500)
  ctx.font = '11px Arial';
  const verW = ctx.measureText('موثّق').width + 14;
  ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
  drawRoundRectCanvas(ctx, W - PAD - 16 - verW, y + 56, verW, 20, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#64748b'; ctx.textAlign = 'right';
  ctx.fillText('موثّق', W - PAD - 9, y + 71);
  // Join date (text-slate-400 text-xs)
  if (found.joinDate) {
    ctx.fillStyle = '#94a3b8'; ctx.font = '12px Arial'; ctx.textAlign = 'right';
    ctx.fillText(`عضو منذ: ${found.joinDate}`, W - PAD - 16, y + 86);
  }

  y += 100 + 16;

  // ── Section header helper ──
  const sectionTitle = (title: string) => {
    ctx.fillStyle = '#64748b'; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'right';
    ctx.fillText(title, W - PAD, y + 14);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, y + 8);
    ctx.lineTo(W - PAD - ctx.measureText(title).width - 10, y + 8); ctx.stroke();
    y += 22;
  };

  // ── Mini-Info Fields: matching MiniInfo (bg-slate-50 ring-1 ring-slate-200) ──
  if (fields.length > 0) {
    sectionTitle('البيانات الشخصية');
    const gap = 12;
    const fw = (W - PAD * 2 - gap * (FCOLS - 1)) / FCOLS;
    fields.forEach((field, i) => {
      const col = i % FCOLS;
      const row = Math.floor(i / FCOLS);
      const fx = W - PAD - col * (fw + gap) - fw; // RTL: col0=rightmost
      const fy = y + row * 76;
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1;
      drawRoundRectCanvas(ctx, fx, fy, fw, 64, 10); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
      drawRoundRectCanvas(ctx, fx, fy, fw, 64, 10); ctx.stroke();
      // Label: text-slate-400 text-xs
      ctx.fillStyle = '#94a3b8'; ctx.font = '11px Arial'; ctx.textAlign = 'right';
      ctx.fillText(field.label, fx + fw - 12, fy + 22);
      // Value: text-slate-700 font-bold text-sm
      ctx.fillStyle = '#334155'; ctx.font = 'bold 13px Arial';
      const val = field.value.length > 24 ? field.value.slice(0, 22) + '…' : field.value;
      ctx.fillText(val, fx + fw - 12, fy + 50);
    });
    y += fieldRows * 76 + 16;
  }

  // ── Financial Boxes: matching FinBox (bg-blue-50 ring-blue-200, etc.) ──
  if (financials.length > 0) {
    sectionTitle('الملخص المالي');
    const gap = 12;
    const finW = (W - PAD * 2 - gap * (financials.length - 1)) / financials.length;
    financials.forEach((fin, i) => {
      const fx = W - PAD - i * (finW + gap) - finW; // RTL
      ctx.fillStyle = fin.bg;
      ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1;
      drawRoundRectCanvas(ctx, fx, y, finW, 84, 12); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.strokeStyle = fin.ring; ctx.lineWidth = 1;
      drawRoundRectCanvas(ctx, fx, y, finW, 84, 12); ctx.stroke();
      // Label: text-slate-500 text-xs
      ctx.fillStyle = '#64748b'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
      ctx.fillText(fin.label, fx + finW / 2, y + 28);
      // Value: colored, text-lg font-black
      ctx.fillStyle = fin.color; ctx.font = 'bold 22px Arial';
      ctx.fillText(`${fin.value.toLocaleString()} ر.س`, fx + finW / 2, y + 64);
    });
    y += 84 + 16;
  }

  // ── Wallet: bg-purple-50 ring-purple-200 text-purple-700 ──
  if (found.walletAddress) {
    ctx.fillStyle = '#faf5ff';
    ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 52, 10); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#e9d5ff'; ctx.lineWidth = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 52, 10); ctx.stroke();
    ctx.fillStyle = '#7e22ce'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'right';
    ctx.fillText('المحفظة الرقمية', W - PAD - 14, y + 20);
    ctx.fillStyle = '#6d28d9'; ctx.font = '13px Arial';
    const wT = found.walletAddress.length > 78 ? found.walletAddress.slice(0, 76) + '…' : found.walletAddress;
    ctx.fillText(wT, W - PAD - 14, y + 40);
    y += 52 + 12;
  }

  // ── Notes: bg-yellow-50 ring-yellow-200 text-yellow-700 ──
  if (found.notes) {
    ctx.fillStyle = '#fefce8';
    ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 52, 10); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, 52, 10); ctx.stroke();
    ctx.fillStyle = '#a16207'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'right';
    ctx.fillText('ملاحظات', W - PAD - 14, y + 20);
    ctx.fillStyle = '#92400e'; ctx.font = '13px Arial';
    const nT = found.notes.length > 80 ? found.notes.slice(0, 78) + '…' : found.notes;
    ctx.fillText(nT, W - PAD - 14, y + 40);
    y += 52 + 12;
  }

  // ── Operations Table: white card, bg-slate-50 header, colored status badges ──
  if (opsToShow.length > 0) {
    sectionTitle(`سجل عمليات المشترك (${subscriberOps.length})`);
    const tH = 40 + opsToShow.length * 44;
    // Table card
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.05)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, tH, 10); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    drawRoundRectCanvas(ctx, PAD, y, W - PAD * 2, tH, 10); ctx.stroke();
    // Header row: bg-slate-50
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(PAD + 1, y + 1, W - PAD * 2 - 2, 39);
    ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, y + 40); ctx.lineTo(W - PAD, y + 40); ctx.stroke();
    // Column X positions (RTL: col0=rightmost = #)
    const colXs = [W - PAD - 28, W - PAD - 88, W - PAD - 390, W - PAD - 600, W - PAD - 830];
    const headers = ['#', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'];
    ctx.fillStyle = '#64748b'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'right';
    headers.forEach((h, i) => ctx.fillText(h, colXs[i], y + 26));
    y += 40;
    opsToShow.forEach((op, i) => {
      if (i % 2 === 1) {
        ctx.fillStyle = 'rgba(248,250,252,0.7)';
        ctx.fillRect(PAD + 1, y, W - PAD * 2 - 2, 44);
      }
      if (i < opsToShow.length - 1) {
        ctx.strokeStyle = '#f1f5f9'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(PAD + 20, y + 44); ctx.lineTo(W - PAD - 20, y + 44); ctx.stroke();
      }
      // # column (text-slate-400 text-xs)
      ctx.fillStyle = '#94a3b8'; ctx.font = '12px Arial'; ctx.textAlign = 'right';
      ctx.fillText(String(i + 1), colXs[0], y + 28);
      // operation name (text-slate-600 text-sm)
      ctx.fillStyle = '#475569'; ctx.font = '13px Arial';
      const opN = op.operation.length > 32 ? op.operation.slice(0, 30) + '…' : op.operation;
      ctx.fillText(opN, colXs[1], y + 28);
      // amount color matching amountColor()
      const amtC = op.status === 'تنشيط النظام' ? '#dc2626'
                 : op.status === 'اشتراك جديد'  ? '#ca8a04'
                 : op.status === 'قيد المعالجة' ? '#2563eb' : '#059669';
      ctx.fillStyle = amtC; ctx.font = 'bold 13px Arial';
      ctx.fillText(op.amount, colXs[2], y + 28);
      // date (text-slate-500 text-xs)
      ctx.fillStyle = '#94a3b8'; ctx.font = '12px Arial';
      ctx.fillText(op.date, colXs[3], y + 28);
      // Status badge matching statusBadge()
      const stBg   = op.status === 'تنشيط النظام' ? '#fee2e2'
                   : op.status === 'اشتراك جديد'  ? '#fef9c3'
                   : op.status === 'قيد المعالجة' ? '#dbeafe' : '#d1fae5';
      const stRing = op.status === 'تنشيط النظام' ? '#fecaca'
                   : op.status === 'اشتراك جديد'  ? '#fde68a'
                   : op.status === 'قيد المعالجة' ? '#bfdbfe' : '#a7f3d0';
      const stTxt  = op.status === 'تنشيط النظام' ? '#b91c1c'
                   : op.status === 'اشتراك جديد'  ? '#a16207'
                   : op.status === 'قيد المعالجة' ? '#1d4ed8' : '#047857';
      ctx.font = 'bold 11px Arial';
      const sW = ctx.measureText(op.status).width + 16;
      ctx.fillStyle = stBg; ctx.strokeStyle = stRing; ctx.lineWidth = 1;
      drawRoundRectCanvas(ctx, colXs[4] - sW, y + 11, sW, 22, 11); ctx.fill(); ctx.stroke();
      ctx.fillStyle = stTxt; ctx.textAlign = 'right';
      ctx.fillText(op.status, colXs[4] - 8, y + 27);
      y += 44;
    });
    y += 16;
  }

  // ── Footer ──
  ctx.fillStyle = '#e2e8f0'; ctx.fillRect(PAD, y + 8, W - PAD * 2, 1);
  ctx.fillStyle = '#94a3b8'; ctx.font = '12px Arial'; ctx.textAlign = 'right';
  ctx.fillText('نظام إدارة المشتركين — Moshtarikeen Hub', W - PAD, y + 32);
  ctx.textAlign = 'left';
  ctx.fillText(`تاريخ التصدير: ${new Date().toLocaleString('ar-SA')}`, PAD, y + 32);

  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مشترك_${found.name}_${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تنزيل الصورة بنجاح');
  }, 'image/png');
}

function createSubscriberVideo(
  found: Subscriber,
  subscriberOps: Operation[],
  queryText: string,
  quality: '480p' | '720p' | '1080p',
  onComplete: () => void
) {
  const dims: Record<string, [number, number]> = {
    '480p': [854, 480],
    '720p': [1280, 720],
    '1080p': [1920, 1080],
  };
  const [W, H] = dims[quality];
  const sc = W / 1280;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  const mime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
  const bitrate = quality === '1080p' ? 8_000_000 : quality === '720p' ? 4_000_000 : 2_000_000;

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: bitrate });
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: mime.split(';')[0] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `استعلام_${found.name}_${quality}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`تم إنشاء الفيديو بجودة ${quality} بنجاح`);
    onComplete();
  };

  const FPS = 30;
  const TOTAL = 420; // title(60)+query(60)+searching(45)+results(225)+final(30)
  let frame = 0;

  const fields = [
    { label: 'الجوال', value: found.phone },
    { label: 'الآيبان', value: found.iban },
    { label: 'البنك', value: found.bankName },
    { label: 'حساب النظام', value: found.systemAccount },
    { label: 'العملة', value: found.currency },
    { label: 'المنصة', value: found.platform },
  ].filter(f => f.value && String(f.value).trim() !== '');

  // Light-theme financials matching FinBox
  const financials = [
    { label: 'مبلغ الاشتراك', value: found.subscriptionAmount, bg: '#eff6ff', ring: '#bfdbfe', color: '#1d4ed8' },
    { label: 'الأرباح', value: found.profits, bg: '#ecfdf5', ring: '#a7f3d0', color: '#047857' },
    { label: 'رسوم النظام', value: found.systemFees, bg: '#fff7ed', ring: '#fed7aa', color: '#ea580c' },
  ].filter(f => f.value != null && Number(f.value) > 0);

  function easeOut(t: number) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3); }
  function easeInOut(t: number) { const c = Math.max(0, Math.min(1, t)); return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2; }

  // Dark cinematic background (used for intro phases)
  function drawDarkBg() {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#060d1a'); bg.addColorStop(1, '#0f172a');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(59,130,246,0.05)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 64 * sc) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let yy = 0; yy < H; yy += 64 * sc) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
  }

  // Light AdminPanel background (used for results phase)
  function drawLightBg() {
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(148,163,184,0.07)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 48 * sc) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let yy = 0; yy < H; yy += 48 * sc) { ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
  }

  function glow(x: number, y: number, r: number, col: string, a: number) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col.replace(')', `,${a})`).replace('rgb', 'rgba'));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  function rrect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  function txt(text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'right', bold = false) {
    ctx.fillStyle = color;
    ctx.font = `${bold ? 'bold ' : ''}${Math.round(size)}px Arial`;
    ctx.textAlign = align; ctx.fillText(text, x, y);
  }

  // Phase 1: Title (frames 0-59) — dark cinematic
  function phase1(f: number) {
    const t = easeOut(f / 59);
    drawDarkBg();
    glow(W / 2, H / 2, 300 * sc, 'rgb(59,130,246)', 0.12 * t);
    const logoR = 52 * sc;
    ctx.globalAlpha = t;
    ctx.fillStyle = 'rgba(29,78,216,0.3)';
    ctx.strokeStyle = 'rgba(99,102,241,0.6)'; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.arc(W / 2, H / 2 - 90 * sc, logoR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    txt('م', W / 2, H / 2 - 90 * sc + 18 * sc, 40 * sc, '#60a5fa', 'center', true);
    txt('نظام إدارة المشتركين', W / 2, H / 2 + 20 * sc, 38 * sc, 'white', 'center', true);
    txt('لوحة تحكم إدارية متقدمة', W / 2, H / 2 + 62 * sc, 18 * sc, '#94a3b8', 'center');
    ctx.globalAlpha = 1;
  }

  // Phase 2: Query input (frames 60-119) — dark cinematic
  function phase2(f: number) {
    const t = easeOut(f / 59);
    drawDarkBg();
    glow(W / 2, H * 0.38, 220 * sc, 'rgb(16,185,129)', 0.1);
    txt('الاستعلام عن المشترك', W / 2, H * 0.28, 30 * sc, 'white', 'center', true);
    txt('ابحث بالاسم أو الآيبان أو رقم الهاتف...', W / 2, H * 0.34, 15 * sc, '#64748b', 'center');
    const bW = 580 * sc, bH = 58 * sc, bX = (W - bW) / 2, bY = H * 0.40;
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    rrect(bX, bY, bW, bH, 12 * sc); ctx.fill();
    ctx.strokeStyle = `rgba(16,185,129,${0.4 * t})`; ctx.lineWidth = 1.5;
    rrect(bX, bY, bW, bH, 12 * sc); ctx.stroke();
    const charCount = Math.floor(queryText.length * t);
    const typed = queryText.slice(0, charCount);
    txt(typed, bX + bW - 14, bY + 38 * sc, 17 * sc, 'white', 'right');
    if (Math.floor(frame / 15) % 2 === 0) {
      ctx.fillStyle = '#10b981';
      const tw = ctx.measureText(typed).width;
      ctx.fillRect(bX + bW - 14 - tw - 3, bY + 14 * sc, 2, 28 * sc);
    }
    if (t > 0.75) {
      ctx.globalAlpha = Math.min(1, (t - 0.75) / 0.25);
      const btnG = ctx.createLinearGradient(bX + bW + 12, 0, bX + bW + 116 * sc, 0);
      btnG.addColorStop(0, '#10b981'); btnG.addColorStop(1, '#06b6d4');
      ctx.fillStyle = btnG;
      rrect(bX + bW + 12, bY, 108 * sc, bH, 12 * sc); ctx.fill();
      txt('بحث الآن', bX + bW + 60 * sc, bY + 38 * sc, 16 * sc, 'white', 'center', true);
      ctx.globalAlpha = 1;
    }
  }

  // Phase 3: Searching (frames 120-164) — dark cinematic
  function phase3(f: number) {
    const t = easeInOut(f / 44);
    drawDarkBg();
    glow(W / 2, H / 2, 260 * sc, 'rgb(59,130,246)', 0.15);
    txt('جارٍ البحث...', W / 2, H * 0.36, 26 * sc, '#94a3b8', 'center');
    const barW = 480 * sc, barH = 8 * sc, barX = (W - barW) / 2, barY = H * 0.44;
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; rrect(barX, barY, barW, barH, 4); ctx.fill();
    const fillW = barW * Math.min(1, t * 1.2);
    const barG = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
    barG.addColorStop(0, '#10b981'); barG.addColorStop(1, '#06b6d4');
    ctx.fillStyle = barG; rrect(barX, barY, fillW, barH, 4); ctx.fill();
    txt(`${Math.round(Math.min(100, t * 120))}%`, W / 2, H * 0.52, 22 * sc, '#10b981', 'center', true);
    const ang = frame * 0.12;
    for (let i = 0; i < 8; i++) {
      const a = ang + (i * Math.PI * 2) / 8;
      const dx = W / 2 + Math.cos(a) * 70 * sc, dy = H * 0.36 + Math.sin(a) * 70 * sc;
      ctx.fillStyle = `rgba(59,130,246,${0.15 + (i / 8) * 0.7})`;
      ctx.beginPath(); ctx.arc(dx, dy, 4 * sc, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Phase 4: Results — LIGHT THEME matching AdminPanel exactly
  function phase4(f: number) {
    const t = easeOut(f / 224);
    drawLightBg();
    const PAD = 44 * sc;
    let curY = 14 * sc;

    // ── Header bar (white, accent stripe) ──
    const headerT = Math.min(1, t * 6);
    ctx.globalAlpha = headerT;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, W, 58 * sc);
    ctx.fillStyle = '#f1f5f9'; ctx.fillRect(0, 57 * sc, W, 1);
    const acG = ctx.createLinearGradient(0, 0, W, 0);
    acG.addColorStop(0, '#34d399'); acG.addColorStop(0.35, '#2dd4bf'); acG.addColorStop(1, '#60a5fa');
    ctx.fillStyle = acG; ctx.fillRect(0, 0, W, 4 * sc);
    // Logo
    ctx.fillStyle = '#ecfdf5'; ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(W - PAD - 16 * sc, 29 * sc, 20 * sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#065f46'; ctx.font = `bold ${16 * sc}px Arial`; ctx.textAlign = 'center';
    ctx.fillText('م', W - PAD - 16 * sc, 35 * sc);
    txt('نظام إدارة المشتركين', W - PAD - 46 * sc, 28 * sc, 15 * sc, '#0f172a', 'right', true);
    ctx.globalAlpha = 1;
    curY = 68 * sc;

    // ── Profile card ──
    const cardH = 88 * sc;
    const cardT = Math.min(1, t * 4);
    ctx.globalAlpha = cardT;
    // Card white background
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0,0,0,0.06)'; ctx.shadowBlur = 8 * sc; ctx.shadowOffsetY = 2 * sc;
    rrect(PAD, curY, W - PAD * 2, cardH, 14 * sc); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    rrect(PAD, curY, W - PAD * 2, cardH, 14 * sc); ctx.stroke();
    // Accent strip top
    const pG = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
    pG.addColorStop(0, '#34d399'); pG.addColorStop(0.4, '#2dd4bf'); pG.addColorStop(1, '#60a5fa');
    ctx.fillStyle = pG;
    ctx.fillRect(PAD, curY, W - PAD * 2, 4 * sc);
    // Avatar (emerald→teal rounded square)
    const avG = ctx.createLinearGradient(PAD + 14 * sc, curY + 10 * sc, PAD + 68 * sc, curY + 78 * sc);
    avG.addColorStop(0, '#34d399'); avG.addColorStop(1, '#14b8a6');
    ctx.fillStyle = avG;
    rrect(PAD + 14 * sc, curY + 10 * sc, 58 * sc, 68 * sc, 12 * sc); ctx.fill();
    // Person silhouette
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.beginPath(); ctx.arc(PAD + 43 * sc, curY + 31 * sc, 10 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(PAD + 43 * sc, curY + 61 * sc, 16 * sc, 10 * sc, 0, Math.PI, 0); ctx.fill();
    // Verified dot
    ctx.fillStyle = '#10b981'; ctx.strokeStyle = 'white'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(PAD + 66 * sc, curY + 70 * sc, 8 * sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Name
    txt(found.name, W - PAD - 12 * sc, curY + 40 * sc, 22 * sc, '#1e293b', 'right', true);
    // Status badge
    if (found.subscriberStatus) {
      const stMap: Record<string, { bg: string; ring: string; txt2: string }> = {
        'نشط':         { bg: '#ecfdf5', ring: '#a7f3d0', txt2: '#047857' },
        'مشترك جديد': { bg: '#eff6ff', ring: '#bfdbfe', txt2: '#1d4ed8' },
        'رسوم مستحقة':{ bg: '#fff7ed', ring: '#fed7aa', txt2: '#c2410c' },
        'توزيع أرباح':{ bg: '#faf5ff', ring: '#e9d5ff', txt2: '#7e22ce' },
        'معلق':        { bg: '#f1f5f9', ring: '#cbd5e1', txt2: '#475569' },
        'موقوف':       { bg: '#fef2f2', ring: '#fecaca', txt2: '#991b1b' },
      };
      const stC = stMap[found.subscriberStatus] ?? { bg: '#f1f5f9', ring: '#cbd5e1', txt2: '#475569' };
      ctx.font = `bold ${11 * sc}px Arial`;
      const sw = ctx.measureText(found.subscriberStatus).width + 14 * sc;
      const nameW = ctx.measureText(found.name).width;
      ctx.fillStyle = stC.bg; ctx.strokeStyle = stC.ring; ctx.lineWidth = 1;
      rrect(W - PAD - 12 * sc - nameW - 10 * sc - sw, curY + 26 * sc, sw, 20 * sc, 10 * sc);
      ctx.fill(); ctx.stroke();
      txt(found.subscriberStatus, W - PAD - 12 * sc - nameW - 18 * sc, curY + 40 * sc, 11 * sc, stC.txt2, 'right', true);
    }
    if (found.joinDate) txt(`عضو منذ: ${found.joinDate}`, W - PAD - 12 * sc, curY + 62 * sc, 11 * sc, '#94a3b8', 'right');
    ctx.globalAlpha = 1;
    curY += cardH + 14 * sc;

    // ── Fields grid (MiniInfo: bg-slate-50 ring-slate-200) ──
    const fieldsN = Math.floor(fields.length * Math.min(1, (t - 0.1) * 3));
    if (fieldsN > 0) {
      const FCOLS = 4, gap = 8 * sc;
      const fw = (W - PAD * 2 - gap * (FCOLS - 1)) / FCOLS;
      fields.slice(0, fieldsN).forEach((fld, i) => {
        const col = i % FCOLS, row = Math.floor(i / FCOLS);
        const fx = W - PAD - col * (fw + gap) - fw;
        const fy = curY + row * 68 * sc;
        const fp = Math.min(1, (t - 0.1 - i * 0.04) * 4);
        ctx.globalAlpha = fp;
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 3 * sc; ctx.shadowOffsetY = sc;
        rrect(fx, fy, fw, 58 * sc, 10 * sc); ctx.fill();
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
        rrect(fx, fy, fw, 58 * sc, 10 * sc); ctx.stroke();
        txt(fld.label, fx + fw - 10 * sc, fy + 19 * sc, 10 * sc, '#94a3b8', 'right');
        const v = fld.value.length > 20 ? fld.value.slice(0, 18) + '…' : fld.value;
        txt(v, fx + fw - 10 * sc, fy + 44 * sc, 12 * sc, '#334155', 'right', true);
        ctx.globalAlpha = 1;
      });
      curY += Math.ceil(fields.length / FCOLS) * 68 * sc + 12 * sc;
    }

    // ── Financials (FinBox light colors) ──
    if (t > 0.5 && financials.length > 0) {
      const finT = Math.min(1, (t - 0.5) * 3);
      const gap = 8 * sc;
      const finW2 = (W - PAD * 2 - gap * (financials.length - 1)) / financials.length;
      financials.forEach((fin, i) => {
        const fx = W - PAD - i * (finW2 + gap) - finW2;
        const fp = Math.min(1, finT * (1 + i * 0.2));
        ctx.globalAlpha = Math.min(1, fp);
        ctx.fillStyle = fin.bg;
        ctx.shadowColor = 'rgba(0,0,0,0.03)'; ctx.shadowBlur = 4 * sc; ctx.shadowOffsetY = sc;
        rrect(fx, curY, finW2, 72 * sc, 12 * sc); ctx.fill();
        ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        ctx.strokeStyle = fin.ring; ctx.lineWidth = 1;
        rrect(fx, curY, finW2, 72 * sc, 12 * sc); ctx.stroke();
        txt(fin.label, fx + finW2 / 2, curY + 24 * sc, 12 * sc, '#64748b', 'center');
        txt(`${fin.value.toLocaleString()} ر.س`, fx + finW2 / 2, curY + 56 * sc, 18 * sc, fin.color, 'center', true);
        ctx.globalAlpha = 1;
      });
    }
  }

  // Phase 5: Final success (frames 390-419)
  function phase5(f: number) {
    const t = easeOut(f / 29);
    drawDarkBg();
    glow(W / 2, H / 2, 400 * sc, 'rgb(16,185,129)', 0.14 * t);
    ctx.globalAlpha = t;
    ctx.fillStyle = 'rgba(16,185,129,0.18)';
    ctx.strokeStyle = 'rgba(16,185,129,0.5)'; ctx.lineWidth = 2 * sc;
    ctx.beginPath(); ctx.arc(W / 2, H * 0.34, 58 * sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    txt('✓', W / 2, H * 0.34 + 22 * sc, 46 * sc, '#10b981', 'center', true);
    txt('اكتملت عملية الاستعلام', W / 2, H * 0.54, 30 * sc, 'white', 'center', true);
    txt(`المشترك: ${found.name}`, W / 2, H * 0.62, 20 * sc, '#94a3b8', 'center');
    txt('نظام إدارة المشتركين', W / 2, H * 0.78, 16 * sc, '#334155', 'center');
    ctx.globalAlpha = 1;
  }

  recorder.start(200);

  function animate() {
    if (frame < 60) phase1(frame);
    else if (frame < 120) phase2(frame - 60);
    else if (frame < 165) phase3(frame - 120);
    else if (frame < 390) phase4(frame - 165);
    else phase5(frame - 390);

    frame++;
    if (frame <= TOTAL) {
      setTimeout(animate, 1000 / FPS);
    } else {
      setTimeout(() => recorder.stop(), 300);
    }
  }

  animate();
}

// ─────────────────────────────────────────────────────────────
// مكوّن قائمة الطباعة
// ─────────────────────────────────────────────────────────────
function PrintMenu({ found, subscriberOps, queryText }: {
  found: Subscriber;
  subscriberOps: Operation[];
  queryText: string;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoQuality, setVideoQuality] = useState<'480p' | '720p' | '1080p'>('720p');
  const [isGenerating, setIsGenerating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        onClick={() => setShowMenu(v => !v)}
        className="gap-2 font-bold h-12 px-6 text-base"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 24px rgba(124,58,237,0.45)' }}>
        <PrinterIcon size={18} />
        خيارات الطباعة والتصدير
        <ChevronDown size={14} className={`transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-3 left-0 z-50 min-w-[260px] rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: '#1a1040', border: '1px solid rgba(124,58,237,0.45)' }}>
            <div className="p-1.5 space-y-0.5">
              <button
                onClick={() => { printSubscriberPDF(found, subscriberOps); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-right group">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/30 transition-colors">
                  <FileText size={17} className="text-red-400" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-white font-bold text-sm">طباعة PDF</p>
                  <p className="text-slate-500 text-xs">تصدير البيانات كمستند PDF</p>
                </div>
              </button>

              <button
                onClick={() => { downloadSubscriberPNG(found, subscriberOps); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-right group">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                  <Download size={17} className="text-blue-400" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-white font-bold text-sm">تنزيل PNG</p>
                  <p className="text-slate-500 text-xs">صورة عالية الجودة للبيانات</p>
                </div>
              </button>

              <button
                onClick={() => { setShowVideoModal(true); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-right group">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/30 transition-colors">
                  <Film size={17} className="text-purple-400" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-white font-bold text-sm">إنشاء فيديو استعلام</p>
                  <p className="text-slate-500 text-xs">فيديو متحرك يعرض بيانات المشترك</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودال جودة الفيديو */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-[200] flex items-center justify-center p-4"
            onClick={() => !isGenerating && setShowVideoModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-md"
              style={{ background: '#130c30', border: '1px solid rgba(124,58,237,0.45)' }}
              onClick={e => e.stopPropagation()}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }} />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)' }}>
                    <Film size={20} className="text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-black">إنشاء فيديو الاستعلام</h3>
                    <p className="text-slate-500 text-xs mt-0.5">فيديو متحرك يعرض رحلة الاستعلام وبيانات المشترك</p>
                  </div>
                  {!isGenerating && (
                    <button onClick={() => setShowVideoModal(false)}
                      className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-400 font-bold mb-3">اختر جودة الفيديو</p>
                <div className="space-y-2 mb-5">
                  {([
                    { q: '480p', label: '480p — جودة عادية', sub: '854 × 480 | حجم ملف أصغر', color: '#64748b' },
                    { q: '720p', label: '720p — جودة عالية HD', sub: '1280 × 720 | متوازن (موصى به)', color: '#3b82f6' },
                    { q: '1080p', label: '1080p — Full HD', sub: '1920 × 1080 | أعلى جودة', color: '#8b5cf6' },
                  ] as const).map(({ q, label, sub, color }) => (
                    <button key={q} onClick={() => setVideoQuality(q)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                      style={{
                        borderColor: videoQuality === q ? `${color}80` : 'rgba(255,255,255,0.08)',
                        background: videoQuality === q ? `${color}15` : 'transparent',
                      }}>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: videoQuality === q ? color : '#475569' }}>
                        {videoQuality === q && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-white font-bold text-sm">{label}</p>
                        <p className="text-slate-500 text-xs">{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl mb-5"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-300">مدة إنشاء الفيديو حوالي 15 ثانية · يُنزَّل تلقائياً بصيغة WebM</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setIsGenerating(true);
                      createSubscriberVideo(found, subscriberOps, queryText, videoQuality, () => {
                        setIsGenerating(false);
                        setShowVideoModal(false);
                      });
                    }}
                    disabled={isGenerating}
                    className="flex-1 gap-2 font-bold h-11"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                    {isGenerating ? (
                      <><RefreshCw size={15} className="animate-spin" />جارٍ إنشاء الفيديو...</>
                    ) : (
                      <><Film size={15} />إنشاء الفيديو</>
                    )}
                  </Button>
                  {!isGenerating && (
                    <Button variant="outline" onClick={() => setShowVideoModal(false)}
                      className="border-white/15 text-slate-300 hover:bg-white/10 h-11">
                      إلغاء
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── الاستعلام المتقدم ──
function AdvancedAdminPanel({ subscribers, operations }: { subscribers: Subscriber[]; operations: Operation[] }) {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<Subscriber | null>(null);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showWallet, setShowWallet] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runSearch = () => {
    if (!query.trim()) return;
    setSearched(false); setFound(null); setIsSearching(true); setProgress(0); setShowWallet(false);
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += Math.random() * 18 + 7;
      if (p >= 100) {
        p = 100; setProgress(100);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
          const q = query.trim().toLowerCase();
          const res = subscribers.find(s =>
            s.name.toLowerCase().includes(q) || s.iban.toLowerCase().includes(q) ||
            s.phone.includes(q) || s.systemAccount.toLowerCase().includes(q) || s.walletAddress.toLowerCase().includes(q)
          );
          setFound(res ?? null); setSearched(true); setIsSearching(false); setProgress(0);
        }, 400);
      } else { setProgress(p); }
    }, 80);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const subscriberOps = useMemo(() => found ? operations.filter(op => op.subscriberName === found.name) : [], [found, operations]);

  const clear = () => { setQuery(''); setFound(null); setSearched(false); setIsSearching(false); setProgress(0); if (intervalRef.current) clearInterval(intervalRef.current); };

  return (
    <>
      {/* صندوق البحث المتقدم */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(59,130,246,0.08) 100%)', border: '1px solid rgba(16,185,129,0.25)' }}>
        <div className="p-6 lg:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
              <Search size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">الاستعلام عن المشترك</h3>
              <p className="text-slate-400 text-xs mt-0.5">ابحث بالاسم · الآيبان · رقم الهاتف · عنوان المحفظة · حساب النظام</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input placeholder="أدخل الاسم، IBAN، رقم الهاتف..."
                className="pr-11 text-sm rounded-xl h-12 text-white placeholder:text-slate-500"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runSearch()}
                disabled={isSearching} />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            </div>
            <Button onClick={runSearch} disabled={isSearching}
              className="h-12 px-6 font-bold rounded-xl transition-all whitespace-nowrap"
              style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
              {isSearching ? 'جارٍ البحث...' : 'استعلام الآن'}
            </Button>
            {(searched || isSearching) && (
              <Button variant="outline" onClick={clear} className="h-12 rounded-xl px-3 border-white/20 text-white hover:bg-white/10">
                <X size={17} />
              </Button>
            )}
          </div>

          {/* شريط التقدم */}
          <AnimatePresence>
            {isSearching && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">جارٍ البحث...</span>
                  <span className="text-sm font-black text-emerald-400">{Math.round(progress)}%</span>
                </div>
                <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div className="absolute inset-y-0 right-0 rounded-full"
                    style={{ width: `${progress}%`, left: 'auto', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.1 }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* نتائج البحث */}
      <AnimatePresence>
        {searched && !found && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl p-10 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <h4 className="text-lg font-black text-white mb-1">لم يُعثر على مشترك</h4>
            <p className="text-slate-500 text-sm">لا توجد نتائج مطابقة لـ "{query}"</p>
          </motion.div>
        )}

        {found && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* بطاقة المشترك */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(59,130,246,0.25)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)' }} />
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg text-xl font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    {found.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white">{found.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {found.subscriberStatus && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                          {found.subscriberStatus}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{found.joinDate && `عضو منذ ${found.joinDate}`}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'الجوال', value: found.phone, icon: <Phone size={12} /> },
                    { label: 'الآيبان', value: found.iban, icon: <CreditCard size={12} />, mono: true },
                    { label: 'البنك', value: found.bankName, icon: <Building2 size={12} /> },
                    { label: 'حساب النظام', value: found.systemAccount, icon: <Database size={12} />, mono: true },
                    { label: 'العملة', value: found.currency, icon: <Globe size={12} /> },
                    { label: 'المنصة', value: found.platform, icon: <Cpu size={12} /> },
                  ].filter(f => f.value).map((field, i) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="flex items-center gap-1 text-slate-400 mb-1">{field.icon}<span className="text-xs">{field.label}</span></div>
                      <p className={`text-sm font-bold text-white break-all ${field.mono ? 'font-mono text-xs' : ''}`}>{field.value}</p>
                    </div>
                  ))}
                </div>

                {/* المالية */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'مبلغ الاشتراك', value: found.subscriptionAmount, color: '#3b82f6', icon: <Wallet size={16} /> },
                    { label: 'الأرباح', value: found.profits, color: '#10b981', icon: <TrendingUp size={16} /> },
                    { label: 'رسوم النظام', value: found.systemFees, color: '#f59e0b', icon: <AlertCircle size={16} /> },
                  ].filter(f => f.value > 0).map((fin, i) => (
                    <div key={i} className="rounded-xl p-3 text-center"
                      style={{ background: `${fin.color}15`, border: `1px solid ${fin.color}30` }}>
                      <div className="flex items-center justify-center gap-1 mb-1" style={{ color: fin.color }}>{fin.icon}</div>
                      <p className="text-slate-400 text-xs mb-1">{fin.label}</p>
                      <p className="font-black text-lg" style={{ color: fin.color }}>{fin.value.toLocaleString()} ر.س</p>
                    </div>
                  ))}
                  {found.walletAddress && (
                    <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                      <p className="text-slate-400 text-xs mb-1">المحفظة الرقمية</p>
                      <p className="font-mono text-xs text-purple-300 break-all leading-tight">
                        {showWallet ? found.walletAddress : `${found.walletAddress.slice(0, 16)}…`}
                      </p>
                      <button onClick={() => setShowWallet(v => !v)} className="text-xs text-purple-400 mt-1 hover:text-purple-300 flex items-center gap-1">
                        {showWallet ? <EyeOff size={10} /> : <Eye size={10} />}{showWallet ? 'إخفاء' : 'عرض الكامل'}
                      </button>
                    </div>
                  )}
                </div>

                {found.notes && (
                  <div className="mt-4 p-3 rounded-xl flex items-start gap-2"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{found.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* عمليات المشترك */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h4 className="text-white font-black">سجل عمليات المشترك</h4>
                <span className="text-xs text-slate-400">{subscriberOps.length} عملية</span>
              </div>
              {subscriberOps.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  <ClipboardList size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد عمليات مسجّلة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                        {['#', 'العملية', 'المبلغ', 'التاريخ', 'الحالة'].map(h => (
                          <th key={h} className="text-right text-slate-400 font-bold text-xs px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {subscriberOps.slice(0, 8).map((op, i) => (
                        <tr key={op.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                          <td className="px-4 py-3 text-slate-300 text-sm">{op.operation}</td>
                          <td className={`px-4 py-3 text-sm font-bold ${op.status === 'مكتمل' ? 'text-emerald-400' : op.status === 'تنشيط النظام' ? 'text-red-400' : 'text-blue-400'}`}>{op.amount}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{op.date}</td>
                          <td className="px-4 py-3">{statusBadge(op.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* زر خيارات الطباعة والتصدير */}
            <div className="flex justify-center pt-2 pb-1">
              <PrintMenu found={found} subscriberOps={subscriberOps} queryText={query} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── العمليات المتقدمة ──
function AdvancedOperations({ operations, onOperationsChange, subscriberNames }: { operations: Operation[]; onOperationsChange: (o: Operation[]) => void; subscriberNames: string[] }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Operation, 'id'>>({ ...EMPTY_OP });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const PER_PAGE = 12;

  const filtered = useMemo(() => {
    let ops = [...operations];
    if (filterStatus !== 'الكل') ops = ops.filter(o => o.status === filterStatus);
    if (search.trim()) { const q = search.toLowerCase(); ops = ops.filter(o => o.subscriberName.toLowerCase().includes(q) || o.operation.includes(q)); }
    return ops;
  }, [operations, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openAdd = () => { setForm({ ...EMPTY_OP, date: todayStr() }); setEditId(null); setIsOpen(true); };
  const openEdit = (op: Operation) => { const { id, ...rest } = op; setForm(rest); setEditId(id); setIsOpen(true); };
  const handleSave = () => {
    if (editId) { onOperationsChange(operations.map(o => o.id === editId ? { id: editId, ...form } : o)); }
    else { onOperationsChange([{ id: uid(), ...form }, ...operations]); }
    setIsOpen(false); setPage(1);
  };
  const doDelete = (id: string) => { onOperationsChange(operations.filter(o => o.id !== id)); setDeleteId(null); };

  const statusCounts = useMemo(() => ({
    completed: operations.filter(o => o.status === 'مكتمل').length,
    pending: operations.filter(o => o.status === 'قيد المعالجة').length,
    activation: operations.filter(o => o.status === 'تنشيط النظام').length,
  }), [operations]);

  return (
    <>
      {/* إحصائيات العمليات */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'مكتملة', value: statusCounts.completed, color: '#10b981', icon: <CheckCircle2 size={18} /> },
          { label: 'قيد المعالجة', value: statusCounts.pending, color: '#3b82f6', icon: <Clock size={18} /> },
          { label: 'تنشيط', value: statusCounts.activation, color: '#ef4444', icon: <Zap size={18} /> },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}20`, border: `1px solid ${item.color}30` }}>
              <span style={{ color: item.color }}>{item.icon}</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs">{item.label}</p>
              <p className="text-2xl font-black text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* شريط البحث والفلتر */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input placeholder="بحث في العمليات..."
            className="pr-9 h-11 text-white placeholder:text-slate-500"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        </div>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="sm:w-48 h-11 text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">جميع الحالات</SelectItem>
            {OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openAdd} className="h-11 px-5 gap-2 font-bold"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
          <Plus size={16} /> إضافة عملية
        </Button>
      </div>

      {/* الجدول */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['#', 'المشترك', 'العملية', 'المبلغ', 'التاريخ', 'الحالة', ''].map(h => (
                  <th key={h} className="text-right text-slate-400 font-bold text-xs px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((op, i) => (
                <motion.tr key={op.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{(page - 1) * PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-white"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        {(op.subscriberName || '?').charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-white">{op.subscriberName || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 text-sm">{op.operation}</td>
                  <td className={`px-4 py-3.5 text-sm font-bold ${op.status === 'مكتمل' ? 'text-emerald-400' : op.status === 'تنشيط النظام' ? 'text-red-400' : 'text-blue-400'}`}>{op.amount}</td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{op.date}</td>
                  <td className="px-4 py-3.5">{statusBadge(op.status)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(op)} className="p-1.5 rounded-lg transition-colors hover:bg-blue-500/20 text-blue-400"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(op.id)} className="p-1.5 rounded-lg transition-colors hover:bg-red-500/20 text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {paged.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-slate-500">
                  <ClipboardList size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد عمليات مطابقة</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs text-slate-500">صفحة {page} من {totalPages} · {filtered.length} عملية</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 px-3 border-white/15 text-slate-300 hover:bg-white/10 gap-1 text-xs"
                disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronRight size={13} /> السابق
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 border-white/15 text-slate-300 hover:bg-white/10 gap-1 text-xs"
                disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                التالي <ChevronLeft size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* مودال الإضافة/التعديل */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              style={{ background: '#1e1b4b', border: '1px solid rgba(139,92,246,0.3)' }}>
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)' }} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-black text-white">{editId ? 'تعديل عملية' : 'إضافة عملية جديدة'}</h3>
                  <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1.5 block">اسم المشترك</label>
                    <Input list="adv-sub-list" value={form.subscriberName} onChange={e => setForm(f => ({ ...f, subscriberName: e.target.value }))}
                      placeholder="اكتب أو اختر" className="h-10 text-white placeholder:text-slate-500"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    <datalist id="adv-sub-list">{subscriberNames.map(n => <option key={n} value={n} />)}</datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">نوع العملية</label>
                      <Select value={form.operation} onValueChange={v => setForm(f => ({ ...f, operation: v }))}>
                        <SelectTrigger className="h-10 text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>{OPERATION_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">الحالة</label>
                      <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                        <SelectTrigger className="h-10 text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>{OPERATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">المبلغ</label>
                      <Input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="مثال: 5,000 ر.س" className="h-10 text-white placeholder:text-slate-500"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 mb-1.5 block">التاريخ</label>
                      <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                        className="h-10 text-white" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSave} className="flex-1 gap-1.5 font-bold"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                    <Save size={14} />{editId ? 'حفظ التعديل' : 'إضافة العملية'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/15 text-slate-300 hover:bg-white/10">إلغاء</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl" style={{ background: '#1e1b4b', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-white">تأكيد حذف العملية</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-slate-400">سيتم حذف العملية نهائياً ولا يمكن التراجع.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="border-white/15 text-slate-300">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && doDelete(deleteId)} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── المشتركون المتقدمون ──
function AdvancedSubscribers({ subscribers, operations, onSubscribersChange }: { subscribers: Subscriber[]; operations: Operation[]; onSubscribersChange: (s: Subscriber[]) => void }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    let subs = [...subscribers];
    if (filterStatus !== 'الكل') subs = subs.filter(s => s.subscriberStatus === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      subs = subs.filter(s => s.name.toLowerCase().includes(q) || s.phone.includes(q) || s.iban.toLowerCase().includes(q) || s.platform.toLowerCase().includes(q));
    }
    return subs;
  }, [subscribers, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const doDelete = (id: string) => { onSubscribersChange(subscribers.filter(s => s.id !== id)); setDeleteId(null); };

  const totalSubscription = subscribers.reduce((a, s) => a + s.subscriptionAmount, 0);
  const totalProfits = subscribers.reduce((a, s) => a + s.profits, 0);
  const totalFees = subscribers.reduce((a, s) => a + s.systemFees, 0);

  return (
    <>
      {/* ملخص مالي */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'إجمالي الاشتراكات', value: totalSubscription, color: '#3b82f6', icon: <Wallet size={18} /> },
          { label: 'إجمالي الأرباح', value: totalProfits, color: '#10b981', icon: <TrendingUp size={18} /> },
          { label: 'إجمالي الرسوم', value: totalFees, color: '#f59e0b', icon: <AlertCircle size={18} /> },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: `${item.color}10`, border: `1px solid ${item.color}25` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}20`, border: `1px solid ${item.color}30` }}>
              <span style={{ color: item.color }}>{item.icon}</span>
            </div>
            <div>
              <p className="text-slate-400 text-xs">{item.label}</p>
              <p className="text-xl font-black text-white">{item.value.toLocaleString()} ر.س</p>
            </div>
          </div>
        ))}
      </div>

      {/* البحث والفلتر */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input placeholder="بحث بالاسم، الهاتف، الآيبان، المنصة..."
            className="pr-9 h-11 text-white placeholder:text-slate-500"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        </div>
        <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="sm:w-48 h-11 text-white"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">جميع الحالات</SelectItem>
            {SUBSCRIBER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* قائمة المشتركين */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {paged.map((sub, i) => {
            const subOpsCount = operations.filter(o => o.subscriberName === sub.name).length;
            const initials = sub.name.split(' ').map(w => w[0]).join('').slice(0, 2);
            const colorGradients = [
              'linear-gradient(135deg,#3b82f6,#06b6d4)',
              'linear-gradient(135deg,#8b5cf6,#a855f7)',
              'linear-gradient(135deg,#10b981,#14b8a6)',
              'linear-gradient(135deg,#f59e0b,#f97316)',
              'linear-gradient(135deg,#f43f5e,#ec4899)',
            ];
            const colorGrad = colorGradients[i % colorGradients.length];
            return (
              <motion.div key={sub.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black text-white shadow-lg"
                  style={{ background: colorGrad }}>
                  {initials || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-white">{sub.name || '(بدون اسم)'}</p>
                    {sub.subscriberStatus && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
                        {sub.subscriberStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {sub.phone && <span className="text-xs text-slate-500">{sub.phone}</span>}
                    {sub.platform && <span className="text-xs text-purple-400">{sub.platform}</span>}
                    {sub.currency && <span className="text-xs text-blue-400 font-bold">{sub.currency}</span>}
                    <span className="text-xs text-slate-600">{subOpsCount} عملية</span>
                  </div>
                </div>
                <div className="text-left flex-shrink-0 hidden sm:block">
                  {sub.subscriptionAmount > 0 && (
                    <p className="text-sm font-black text-white">{sub.subscriptionAmount.toLocaleString()} ر.س</p>
                  )}
                  {sub.profits > 0 && (
                    <p className="text-xs text-emerald-400">+{sub.profits.toLocaleString()} ر.س</p>
                  )}
                </div>
                <button onClick={() => setDeleteId(sub.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}
          {paged.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Users size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا يوجد مشتركون مطابقون</p>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xs text-slate-500">صفحة {page} من {totalPages} · {filtered.length} مشترك</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-8 px-3 border-white/15 text-slate-300 hover:bg-white/10 gap-1 text-xs"
                disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronRight size={13} /> السابق
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 border-white/15 text-slate-300 hover:bg-white/10 gap-1 text-xs"
                disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                التالي <ChevronLeft size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl" style={{ background: '#1e1b4b', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-white">تأكيد حذف المشترك</AlertDialogTitle>
            <AlertDialogDescription className="text-right text-slate-400">سيتم حذف البيانات نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel className="border-white/15 text-slate-300">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && doDelete(deleteId)} className="bg-red-600 hover:bg-red-700">حذف المشترك</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Reports Tab — التقارير
// ─────────────────────────────────────────────────────────────

function ReportsTab({ subscribers, operations }: { subscribers: Subscriber[]; operations: Operation[] }) {
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; مشتركون: number; عمليات: number; إيرادات: number }> = {};
    const monthNames = ['يناير','فبراير','مارس','إبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    subscribers.forEach(s => {
      if (!s.joinDate) return;
      const d = new Date(s.joinDate);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!months[key]) months[key] = { month: monthNames[d.getMonth()], مشتركون: 0, عمليات: 0, إيرادات: 0 };
      months[key].مشتركون++;
      months[key].إيرادات += s.subscriptionAmount;
    });
    operations.forEach(op => {
      if (!op.date) return;
      const d = new Date(op.date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      if (!months[key]) months[key] = { month: String(d.getMonth()+1), مشتركون: 0, عمليات: 0, إيرادات: 0 };
      months[key].عمليات++;
    });
    return Object.entries(months).sort(([a],[b]) => a.localeCompare(b)).slice(-8).map(([,v]) => v);
  }, [subscribers, operations]);

  const statusDist = useMemo(() => {
    const map: Record<string, number> = {};
    subscribers.forEach(s => { map[s.subscriberStatus] = (map[s.subscriberStatus] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [subscribers]);

  const platformDist = useMemo(() => {
    const map: Record<string, number> = {};
    subscribers.forEach(s => { if (s.platform) map[s.platform] = (map[s.platform] || 0) + 1; });
    return Object.entries(map).sort(([,a],[,b]) => b-a).slice(0,8).map(([name, value]) => ({ name, value }));
  }, [subscribers]);

  const opsDist = useMemo(() => {
    const map: Record<string, number> = {};
    operations.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [operations]);

  const PIE_COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#84cc16'];

  const totalRevenue = subscribers.reduce((a, s) => a + s.subscriptionAmount, 0);
  const totalProfits = subscribers.reduce((a, s) => a + s.profits, 0);
  const totalFees = subscribers.reduce((a, s) => a + s.systemFees, 0);
  const activeRate = subscribers.length ? Math.round(subscribers.filter(s => s.subscriberStatus === 'نشط').length / subscribers.length * 100) : 0;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">التقارير والإحصائيات</h2>
          <p className="text-sm text-slate-400 mt-0.5">تحليل شامل لبيانات النظام</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الاشتراكات', value: `${totalRevenue.toLocaleString()} ر.س`, icon: <Wallet size={18} className="text-emerald-600" />, bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'إجمالي الأرباح', value: `${totalProfits.toLocaleString()} ر.س`, icon: <TrendingUp size={18} className="text-blue-600" />, bg: 'bg-blue-50', color: 'text-blue-700' },
          { label: 'الرسوم المستحقة', value: `${totalFees.toLocaleString()} ر.س`, icon: <AlertCircle size={18} className="text-orange-500" />, bg: 'bg-orange-50', color: 'text-orange-700' },
          { label: 'نسبة النشاط', value: `${activeRate}%`, icon: <Activity size={18} className="text-purple-600" />, bg: 'bg-purple-50', color: 'text-purple-700' },
        ].map((c, i) => (
          <Card key={i} className={`${c.bg} border-none shadow-sm ring-1 ring-slate-200`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">{c.icon}<span className="text-xs text-slate-500">{c.label}</span></div>
              <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Chart */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
            <BarChart2 size={18} className="text-blue-500" /> المشتركون الشهريون والعمليات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="مشتركون" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="عمليات" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <PieChartIcon size={18} className="text-purple-500" /> توزيع حالات المشتركين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {statusDist.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Globe size={18} className="text-cyan-500" /> توزيع منصات التداول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={platformDist} layout="vertical" margin={{ right: 20, left: 60 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={55} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Operations Status */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <ClipboardList size={18} className="text-emerald-500" /> حالات العمليات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-2">
              {opsDist.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-32 text-right">{item.name}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${operations.length ? (item.value / operations.length * 100) : 0}%` }}
                      transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                  <span className="text-sm font-black text-slate-700 w-10">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Subscribers by amount */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Star size={18} className="text-amber-500" /> أعلى المشتركين اشتراكاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...subscribers].sort((a,b) => b.subscriptionAmount - a.subscriptionAmount).slice(0,5).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${i===0?'bg-amber-400':i===1?'bg-slate-400':i===2?'bg-orange-400':'bg-slate-300'}`}>{i+1}</span>
                  <span className="flex-1 text-sm font-medium text-slate-700 truncate">{s.name}</span>
                  <span className="text-sm font-black text-emerald-600">{s.subscriptionAmount.toLocaleString()} ر.س</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Settings Tab — الإعدادات
// ─────────────────────────────────────────────────────────────

function SettingsTab({ isDark, onDarkToggle, subscribers, operations, systemConfig, onSubscribersChange, onOperationsChange, onConfigChange }: {
  isDark: boolean;
  onDarkToggle: () => void;
  subscribers: Subscriber[];
  operations: Operation[];
  systemConfig: SystemConfig;
  onSubscribersChange: (s: Subscriber[]) => void;
  onOperationsChange: (o: Operation[]) => void;
  onConfigChange: (p: Partial<SystemConfig>) => void;
}) {
  const storageSize = useMemo(() => {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += (localStorage[key].length + key.length) * 2;
      }
    }
    return (total / 1024).toFixed(1);
  }, []);

  const exportBackup = () => {
    const data = { subscribers, operations, systemConfig, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `backup_moshtarikeen_${new Date().toLocaleDateString('ar-SA').replace(/\//g,'_')}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('تم تصدير النسخة الاحتياطية');
  };

  const importRef = useRef<HTMLInputElement>(null);

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.subscribers) onSubscribersChange(data.subscribers);
        if (data.operations) onOperationsChange(data.operations);
        if (data.systemConfig) onConfigChange(data.systemConfig);
        toast.success('تم استيراد النسخة الاحتياطية بنجاح');
      } catch {
        toast.error('ملف غير صالح');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetAll = () => {
    if (!confirm('تحذير: سيتم حذف جميع البيانات وإعادة تعيين النظام. هل أنت متأكد؟')) return;
    localStorage.removeItem('msub_v2');
    localStorage.removeItem('mops_v2');
    localStorage.removeItem('msys_config_v2');
    toast.success('تم إعادة تعيين النظام — سيتم تحديث الصفحة');
    setTimeout(() => window.location.reload(), 1500);
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-black text-slate-800">الإعدادات</h2>
        <p className="text-sm text-slate-400 mt-0.5">تخصيص النظام والبيانات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Moon size={18} className="text-slate-600" /> المظهر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 ring-1 ring-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-700">الوضع الليلي</p>
                <p className="text-xs text-slate-400 mt-0.5">تغيير مظهر النظام إلى الوضع الداكن</p>
              </div>
              <button onClick={onDarkToggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${isDark ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 ring-1 ring-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-700">اختصارات لوحة المفاتيح</p>
                <p className="text-xs text-slate-400 mt-0.5">اضغط ⌘K للبحث السريع</p>
              </div>
              <div className="flex gap-1">
                <kbd className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500">⌘K</kbd>
                <kbd className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500">⌘N</kbd>
                <kbd className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-500">⌘O</kbd>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <HardDrive size={18} className="text-blue-500" /> التخزين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'المشتركون', value: subscribers.length, unit: 'مشترك', color: 'text-emerald-600' },
              { label: 'العمليات', value: operations.length, unit: 'عملية', color: 'text-blue-600' },
              { label: 'حجم البيانات', value: storageSize, unit: 'كيلوبايت', color: 'text-orange-600' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className={`text-sm font-black ${item.color}`}>{item.value} {item.unit}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <Database size={18} className="text-emerald-500" /> النسخ الاحتياطي والاستعادة
            </CardTitle>
            <CardDescription className="text-xs">تصدير كامل البيانات أو استيرادها من ملف JSON</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={exportBackup} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
              <FileDown size={16} /> تصدير نسخة احتياطية (JSON)
            </Button>
            <input ref={importRef} type="file" accept=".json" className="hidden" onChange={importBackup} />
            <Button onClick={() => importRef.current?.click()} variant="outline" className="w-full gap-2 border-slate-200 text-slate-600">
              <Upload size={16} /> استيراد من ملف JSON
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => {
                const header = ['الاسم','الهاتف','IBAN','الاشتراك','الأرباح','الرسوم','الحالة','التاريخ'];
                const rows = subscribers.map(s => [s.name,s.phone,s.iban,s.subscriptionAmount,s.profits,s.systemFees,s.subscriberStatus,s.joinDate]);
                const csv = [header,...rows].map(r=>r.join(',')).join('\n');
                const blob = new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href=url; a.download='المشتركين.csv'; a.click(); URL.revokeObjectURL(url);
                toast.success('تم تصدير المشتركين');
              }} variant="outline" size="sm" className="gap-1 border-slate-200 text-slate-600 text-xs">
                <FileDown size={12} /> مشتركون CSV
              </Button>
              <Button onClick={() => {
                const header = ['الاسم','العملية','المبلغ','التاريخ','الحالة'];
                const rows = operations.map(o => [o.subscriberName,o.operation,o.amount,o.date,o.status]);
                const csv = [header,...rows].map(r=>r.join(',')).join('\n');
                const blob = new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href=url; a.download='العمليات.csv'; a.click(); URL.revokeObjectURL(url);
                toast.success('تم تصدير العمليات');
              }} variant="outline" size="sm" className="gap-1 border-slate-200 text-slate-600 text-xs">
                <FileDown size={12} /> عمليات CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-none shadow-sm ring-1 ring-red-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-400 to-rose-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-black text-slate-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" /> منطقة الخطر
            </CardTitle>
            <CardDescription className="text-xs text-red-500">هذه الإجراءات لا يمكن التراجع عنها</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={resetAll} variant="outline" className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50">
              <RotateCcw size={16} /> إعادة تعيين النظام بالكامل
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Command Palette — لوحة البحث السريع
// ─────────────────────────────────────────────────────────────

function CommandPalette({ open, query, onQueryChange, onClose, subscribers, operations, onNavigate }: {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  subscribers: Subscriber[];
  operations: Operation[];
  onNavigate: (tab: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const navCommands = [
    { icon: <LayoutDashboard size={14} />, label: 'لوحة التحكم', tab: 'dashboard' },
    { icon: <Shield size={14} />, label: 'نظام الاستعلام', tab: 'admin' },
    { icon: <ClipboardList size={14} />, label: 'سجل العمليات', tab: 'addOperations' },
    { icon: <UserPlus size={14} />, label: 'إضافة مشترك', tab: 'addSubscriber' },
    { icon: <SlidersHorizontal size={14} />, label: 'إدارة النظام', tab: 'systemAdmin' },
    { icon: <Crown size={14} />, label: 'النظام المتقدم', tab: 'advanced' },
    { icon: <BarChart2 size={14} />, label: 'التقارير', tab: 'reports' },
    { icon: <Settings size={14} />, label: 'الإعدادات', tab: 'settings' },
  ];

  const q = query.trim().toLowerCase();
  const filteredNav = q ? navCommands.filter(c => c.label.includes(q) || c.tab.includes(q)) : navCommands;
  const filteredSubs = q.length >= 2 ? subscribers.filter(s =>
    s.name.toLowerCase().includes(q) || s.phone.includes(q)
  ).slice(0, 5) : [];
  const filteredOps = q.length >= 2 ? operations.filter(o =>
    o.subscriberName.toLowerCase().includes(q) || o.operation.includes(q)
  ).slice(0, 3) : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-200"
        onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={e => onQueryChange(e.target.value)}
            placeholder="بحث في النظام... (اكتب للبدء)"
            className="flex-1 text-sm text-slate-700 placeholder:text-slate-400 outline-none bg-transparent text-right" dir="rtl" />
          <kbd className="text-[10px] bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-400">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto p-2" dir="rtl">
          {/* Navigation */}
          {filteredNav.length > 0 && (
            <div className="mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">التنقل</p>
              {filteredNav.map(cmd => (
                <button key={cmd.tab} onClick={() => onNavigate(cmd.tab)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors text-right">
                  <span className="text-slate-400">{cmd.icon}</span>
                  {cmd.label}
                </button>
              ))}
            </div>
          )}
          {/* Subscribers */}
          {filteredSubs.length > 0 && (
            <div className="mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">مشتركون</p>
              {filteredSubs.map(s => (
                <button key={s.id} onClick={() => onNavigate('admin')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors text-right">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <User size={12} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.phone}</p>
                  </div>
                  <span className="mr-auto">{subStatusBadge(s.subscriberStatus)}</span>
                </button>
              ))}
            </div>
          )}
          {/* Operations */}
          {filteredOps.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1">عمليات</p>
              {filteredOps.map(o => (
                <button key={o.id} onClick={() => onNavigate('addOperations')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors text-right">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <ClipboardList size={12} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-700">{o.subscriberName} — {o.operation}</p>
                    <p className="text-xs text-slate-400">{o.amount} · {o.date}</p>
                  </div>
                  <span className="mr-auto">{statusBadge(o.status)}</span>
                </button>
              ))}
            </div>
          )}
          {filteredNav.length === 0 && filteredSubs.length === 0 && filteredOps.length === 0 && (
            <div className="py-10 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا توجد نتائج لـ "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1">↵</kbd> تنفيذ</span>
          <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1">ESC</kbd> إغلاق</span>
          <span className="flex items-center gap-1"><Keyboard size={10} /> {subscribers.length} مشترك · {operations.length} عملية</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
