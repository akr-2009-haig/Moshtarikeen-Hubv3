/**
 * نظام إدارة المشتركين — Moshtarikeen Hub v2.0
 * لوحة تحكم إدارية متقدمة | بيانات محلية فقط (localStorage)
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
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

type Tab = 'dashboard' | 'admin' | 'addOperations' | 'addSubscriber' | 'systemAdmin' | 'advanced';

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subscribers, setSubscribers] = useLocalStorage<Subscriber[]>('msub_v2', INITIAL_SUBSCRIBERS);
  const [operations, setOperations] = useLocalStorage<Operation[]>('mops_v2', INITIAL_OPERATIONS);
  const [systemConfig, setSystemConfig] = useLocalStorage<SystemConfig>('msys_config_v2', DEFAULT_SYSTEM_CONFIG);

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
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
              <CalendarClock size={12} /><span>{systemDisplayDate}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs text-slate-500">
              <Users size={12} /><span>{subscribers.length} مشترك</span>
            </div>
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
              />
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AdminPanel subscribers={subscribers} operations={operations} sectionName={sn.admin} />
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
              <AddSubscriberTab subscribers={subscribers} onSubscribersChange={setSubscribers} sectionName={sn.addSubscriber} />
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
        </AnimatePresence>
      </main>
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

function SystemAdminTab({ systemConfig, onConfigChange, subscribersCount, sectionName }: {
  systemConfig: SystemConfig;
  onConfigChange: (partial: Partial<SystemConfig>) => void;
  subscribersCount: number;
  sectionName: string;
}) {
  const [dateInput, setDateInput] = useState(systemConfig.systemDate);
  const [co, setCo] = useState({ ...systemConfig.cardOverrides });
  const [sn, setSn] = useState({ ...systemConfig.sectionNames });
  const [instText, setInstText] = useState(systemConfig.institutionalText);
  const [saved, setSaved] = useState<string | null>(null);

  const flash = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(null), 2500); };

  const saveDate = () => {
    onConfigChange({ systemDate: dateInput });
    flash('تم تحديث تاريخ النظام');
  };

  const saveCards = () => {
    onConfigChange({ cardOverrides: co });
    flash('تم حفظ تعديلات البطاقات');
  };

  const saveNames = () => {
    onConfigChange({ sectionNames: sn });
    flash('تم تحديث أسماء الأقسام');
  };

  const saveText = () => {
    onConfigChange({ institutionalText: instText });
    flash('تم حفظ النص المؤسسي');
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

function AdminPanel({ subscribers, operations, sectionName }: {
  subscribers: Subscriber[];
  operations: Operation[];
  sectionName: string;
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
                { label: 'إجمالي المشتركين', value: subscribers.length, icon: <Users size={13} /> },
                { label: 'نشطون', value: subscribers.filter(s => s.subscriberStatus === 'نشط').length, icon: <CheckCircle2 size={13} /> },
                { label: 'رسوم مستحقة', value: subscribers.filter(s => s.systemFees > 0).length, icon: <AlertCircle size={13} /> },
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

            {/* Operations for this subscriber */}
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
    } else {
      onOperationsChange([{ id: uid(), ...form }, ...operations]);
    }
    setIsOpen(false);
    setPage(1);
  };

  const doDelete = (id: string) => { onOperationsChange(operations.filter(o => o.id !== id)); setDeleteId(null); };

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{sectionName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{operations.length} عملية مسجّلة في النظام</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-sm">
          <Plus size={16} /> إضافة عملية
        </Button>
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

function AddSubscriberTab({ subscribers, onSubscribersChange, sectionName }: {
  subscribers: Subscriber[];
  onSubscribersChange: (s: Subscriber[]) => void;
  sectionName: string;
}) {
  const [form, setForm] = useState<Omit<Subscriber, 'id'>>({ ...EMPTY_SUB });
  const [editId, setEditId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
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
    if (editId) {
      onSubscribersChange(subscribers.map(s => s.id === editId ? { id: editId, ...form } : s));
    } else {
      onSubscribersChange([...subscribers, { id: uid(), ...form }]);
    }
    setForm({ ...EMPTY_SUB });
    setEditId(null);
    setCustomBank(false);
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

  const doDelete = (id: string) => { onSubscribersChange(subscribers.filter(s => s.id !== id)); setDeleteId(null); setExpandedId(null); };
  const cancelEdit = () => { setForm({ ...EMPTY_SUB }); setEditId(null); setCustomBank(false); };

  const f = form;

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{editId ? 'تعديل مشترك' : sectionName}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{subscribers.length} مشترك مسجّل</p>
        </div>
        {editId && (
          <Button variant="outline" onClick={cancelEdit} className="gap-1.5 border-slate-200 text-slate-600">
            <X size={14} /> إلغاء التعديل
          </Button>
        )}
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
      icon: <Users size={24} />, gradient: 'from-blue-600 to-cyan-500', glow: 'rgba(59,130,246,0.4)',
      trend: '+12%', up: true,
    },
    {
      title: 'إجمالي الأرباح', value: stats.totalProfits, sub: `${completedOps} عملية مكتملة`,
      icon: <TrendingUp size={24} />, gradient: 'from-emerald-500 to-teal-400', glow: 'rgba(16,185,129,0.4)',
      trend: '+8.3%', up: true,
    },
    {
      title: 'الاشتراكات النشطة', value: stats.activeSubscriptions, sub: `من ${stats.totalSubsCount} مشترك`,
      icon: <CheckCheck size={24} />, gradient: 'from-violet-600 to-purple-500', glow: 'rgba(139,92,246,0.4)',
      trend: '+5.1%', up: true,
    },
    {
      title: 'رسوم مستحقة', value: stats.pendingRequests, sub: `${stats.activationOpsStr} تنشيط`,
      icon: <AlertCircle size={24} />, gradient: 'from-amber-500 to-orange-400', glow: 'rgba(245,158,11,0.4)',
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
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
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
            const colors = ['from-blue-500 to-cyan-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500'];
            const color = colors[i % colors.length];
            return (
              <motion.div key={sub.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 text-sm font-black text-white shadow-lg`}>
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
