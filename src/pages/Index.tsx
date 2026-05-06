/**
 * نظام إدارة المشتركين — Moshtarikeen Hub v2.0
 * لوحة تحكم إدارية متقدمة | بيانات محلية فقط (localStorage)
 */

import React, { useState, useMemo } from 'react';
import {
  Users, TrendingUp, Wallet, Search, LayoutDashboard, Settings,
  Bell, LogOut, CheckCircle2, AlertCircle, CreditCard, Phone, User,
  Shield, ClipboardList, Plus, Pencil, Trash2, X, Save, ChevronDown,
  Hash, Building2, UserPlus, ChevronLeft, ChevronRight, Activity,
  ArrowUpRight, ArrowDownRight, Clock, RefreshCw, Download, Filter,
  Eye, EyeOff, AlertTriangle, CheckCheck, Lock, Database, Calendar,
  FileText, Banknote, Star,
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

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const OPERATION_TYPES = ['توزيع ارباح', 'اشتراك جديد', 'تنشيط النظام', 'سحب ارباح', 'تحويل'];
const OPERATION_STATUSES = ['مكتمل', 'اشتراك جديد', 'تنشيط النظام', 'قيد المعالجة'];
const SUBSCRIBER_STATUSES = ['نشط', 'مشترك جديد', 'رسوم مستحقة', 'توزيع أرباح', 'معلق', 'موقوف'];

const GULF_BANKS: Record<string, string[]> = {
  'المملكة العربية السعودية': [
    'البنك الأهلي السعودي (SNB)',
    'مصرف الراجحي',
    'بنك الرياض',
    'البنك السعودي الفرنسي (BSF)',
    'البنك السعودي البريطاني (SABB)',
    'مصرف الإنماء',
    'بنك البلاد',
    'بنك الجزيرة',
    'البنك العربي الوطني',
    'بنك ساب',
    'بنك الخليج',
    'البنك السعودي للاستثمار (SAIB)',
  ],
  'الإمارات العربية المتحدة': [
    'بنك الإمارات دبي الوطني (ENBD)',
    'بنك أبوظبي الأول (FAB)',
    'بنك أبوظبي التجاري (ADCB)',
    'مصرف الإمارات الإسلامي',
    'بنك دبي الإسلامي (DIB)',
    'بنك المشرق',
    'بنك الفجيرة الوطني',
    'بنك رأس الخيمة الوطني (RAKBANK)',
    'بنك الاتحاد الوطني',
    'بنك دبي التجاري',
    'بنك الشارقة الإسلامي',
    'بنك نور',
  ],
  'قطر': [
    'بنك قطر الوطني (QNB)',
    'المصرف التجاري القطري',
    'بنك الدوحة',
    'بنك أهلي قطر',
    'بنك الريان',
    'مصرف قطر الإسلامي (QIB)',
    'بنك قطر الدولي الإسلامي',
    'بنك برقان',
  ],
  'الكويت': [
    'بنك الكويت الوطني (NBK)',
    'بيت التمويل الكويتي (بيتك)',
    'البنك التجاري الكويتي',
    'بنك الخليج',
    'بنك برقان',
  ],
  'البحرين': [
    'بنك البحرين الوطني',
    'بنك أهلي البحرين',
    'مصرف الراجحي البحرين',
    'بنك الكويت والبحرين',
  ],
  'عُمان': [
    'بنك مسقط',
    'بنك ظفار',
    'بنك صحار',
    'البنك الوطني العُماني',
    'بنك عُمان العربي',
    'بنك نزوى',
  ],
};

const ALL_BANKS_FLAT = Object.values(GULF_BANKS).flat();

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 11);
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomAmount(min: number, max: number): number {
  return Math.floor((Math.random() * (max - min) + min) / 100) * 100;
}

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
// Initial Data — أسماء خليجية حقيقية
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
    const lastName  = LAST_NAMES[i % LAST_NAMES.length];
    const name = `${firstName} ${lastName}`;
    const sa = randomAmount(5000, 60000);
    const pr = randomAmount(500, 20000);
    const sf = Math.random() > 0.6 ? randomAmount(200, 3000) : 0;
    return {
      id: uid(),
      name,
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

const INITIAL_STATS: Stats = {
  totalSubscribers: '80',
  totalProfits: '١٬٢٨٤٬٥٠٠ ر.س',
  activeSubscriptions: '62',
  pendingRequests: '8',
};

const CHART_DATA = [
  { name: 'يناير', value: 420000, target: 400000 },
  { name: 'فبراير', value: 380000, target: 420000 },
  { name: 'مارس',  value: 510000, target: 450000 },
  { name: 'إبريل', value: 467000, target: 470000 },
  { name: 'مايو',  value: 590000, target: 500000 },
  { name: 'يونيو', value: 648000, target: 540000 },
  { name: 'يوليو', value: 712000, target: 580000 },
];

// ─────────────────────────────────────────────────────────────
// Badge helpers
// ─────────────────────────────────────────────────────────────

function amountColor(status: string): string {
  if (status === 'تنشيط النظام') return 'text-red-600 font-bold';
  if (status === 'اشتراك جديد')  return 'text-yellow-600 font-bold';
  if (status === 'قيد المعالجة') return 'text-blue-600 font-bold';
  return 'text-emerald-600 font-bold';
}

function statusBadge(status: string): React.ReactNode {
  const map: Record<string, string> = {
    'تنشيط النظام': 'bg-red-100 text-red-700 border-red-200',
    'اشتراك جديد':  'bg-yellow-100 text-yellow-700 border-yellow-200',
    'قيد المعالجة': 'bg-blue-100 text-blue-700 border-blue-200',
    'مكتمل':        'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  const dotColor: Record<string, string> = {
    'تنشيط النظام': 'bg-red-500',
    'اشتراك جديد':  'bg-yellow-500',
    'قيد المعالجة': 'bg-blue-500',
    'مكتمل':        'bg-emerald-500',
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
    'نشط':          'bg-emerald-100 text-emerald-700 border-emerald-200',
    'مشترك جديد':   'bg-blue-100 text-blue-700 border-blue-200',
    'رسوم مستحقة':  'bg-orange-100 text-orange-700 border-orange-200',
    'توزيع أرباح':  'bg-purple-100 text-purple-700 border-purple-200',
    'معلق':         'bg-gray-100 text-gray-600 border-gray-200',
    'موقوف':        'bg-red-100 text-red-700 border-red-200',
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
  name:'', phone:'', iban:'', subscriptionAmount:0, profits:0, systemFees:0,
  systemAccount:'', walletAddress:'', bankName:'', joinDate:'',
  subscriberStatus:'نشط', notes:'',
};

const EMPTY_OP: Omit<Operation, 'id'> = {
  subscriberName:'', operation:'توزيع ارباح', amount:'', date: todayStr(), status:'مكتمل',
};

// ─────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'admin' | 'addOperations' | 'addSubscriber';

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [subscribers, setSubscribers] = useLocalStorage<Subscriber[]>('msub_v2', INITIAL_SUBSCRIBERS);
  const [operations,  setOperations]  = useLocalStorage<Operation[]>('mops_v2',  INITIAL_OPERATIONS);
  const [totalProfits, setTotalProfits] = useLocalStorage<string>('mprof_v2', INITIAL_STATS.totalProfits);

  const liveStats: Stats = useMemo(() => ({
    totalSubscribers:    String(subscribers.length),
    totalProfits,
    activeSubscriptions: String(subscribers.filter(s => s.subscriberStatus === 'نشط').length),
    pendingRequests:     String(subscribers.filter(s => s.systemFees > 0).length),
  }), [subscribers, totalProfits]);

  const navItems: { tab: Tab; icon: React.ReactNode; label: string }[] = [
    { tab: 'dashboard',     icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم' },
    { tab: 'admin',         icon: <Shield size={20} />,          label: 'لوحة الأدمن' },
    { tab: 'addOperations', icon: <ClipboardList size={20} />,   label: 'إضافة عمليات' },
    { tab: 'addSubscriber', icon: <UserPlus size={20} />,        label: 'إضافة مشترك' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* ── Sidebar ── */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white hidden lg:flex flex-col sticky top-0 h-screen shadow-2xl z-20">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <Database size={20} className="text-white" />
            </div>
            <div>
              <p className="font-black text-sm leading-tight">مركز المشتركين</p>
              <p className="text-xs text-slate-400">Moshtarikeen Hub</p>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-4 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">النظام يعمل</span>
          <span className="mr-auto text-xs text-slate-500">{subscribers.length} مشترك</span>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.tab
                  ? 'bg-gradient-to-l from-emerald-600/30 to-teal-600/20 text-emerald-400 border border-emerald-500/30 shadow-lg'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}>
              {item.icon}
              <span>{item.label}</span>
              {activeTab === item.tab && <ChevronLeft size={13} className="mr-auto opacity-60" />}
            </button>
          ))}
          <Separator className="my-2 bg-white/10" />
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-white/5 hover:text-white transition-all">
            <Settings size={20} /><span>الإعدادات</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
              <User size={14} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">المدير العام</p>
              <p className="text-xs text-slate-500 truncate">admin@system.com</p>
            </div>
            <Lock size={12} className="text-slate-600 flex-shrink-0" />
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 text-xs font-medium transition-colors">
            <LogOut size={15} /><span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex lg:hidden gap-1">
              {navItems.map(item => (
                <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                  className={`p-1.5 rounded-lg transition-colors ${activeTab === item.tab ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {React.cloneElement(item.icon as React.ReactElement, { size: 15 })}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-800">نظام إدارة المشتركين</h1>
              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">v2.0</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
              <DashboardTab stats={liveStats} onProfitsChange={setTotalProfits} subscribers={subscribers} operations={operations} />
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AdminPanel subscribers={subscribers} operations={operations} />
            </motion.div>
          )}
          {activeTab === 'addOperations' && (
            <motion.div key="addOps" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AddOperationsTab operations={operations} onOperationsChange={setOperations} subscriberNames={subscribers.map(s => s.name)} />
            </motion.div>
          )}
          {activeTab === 'addSubscriber' && (
            <motion.div key="addSub" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AddSubscriberTab subscribers={subscribers} onSubscribersChange={setSubscribers} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Dashboard Tab
// ─────────────────────────────────────────────────────────────

function DashboardTab({ stats, onProfitsChange, subscribers, operations }: {
  stats: Stats;
  onProfitsChange: (v: string) => void;
  subscribers: Subscriber[];
  operations: Operation[];
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const completedOps = operations.filter(o => o.status === 'مكتمل').length;
  const pendingOps   = operations.filter(o => o.status === 'قيد المعالجة').length;
  const activationOps = operations.filter(o => o.status === 'تنشيط النظام').length;

  const statCards = [
    { title: 'إجمالي المشتركين',  value: stats.totalSubscribers,    sub: `نشط: ${stats.activeSubscriptions}`, icon: <Users size={22} className="text-blue-600" />,    bg: 'bg-blue-50',    ring: 'ring-blue-200',    trend: '+12%', up: true,  color: 'text-blue-700' },
    { title: 'إجمالي الأرباح',    value: stats.totalProfits,        sub: `${completedOps} عملية مكتملة`,      icon: <TrendingUp size={22} className="text-emerald-600" />, bg: 'bg-emerald-50', ring: 'ring-emerald-200', trend: '+8.3%', up: true,  color: 'text-emerald-700' },
    { title: 'الاشتراكات النشطة', value: stats.activeSubscriptions, sub: `من ${stats.totalSubscribers} مشترك`, icon: <CheckCheck size={22} className="text-purple-600" />, bg: 'bg-purple-50',  ring: 'ring-purple-200',  trend: '+5.1%', up: true,  color: 'text-purple-700' },
    { title: 'رسوم مستحقة',       value: stats.pendingRequests,     sub: `${activationOps} عملية تنشيط`,      icon: <AlertCircle size={22} className="text-orange-500" />, bg: 'bg-orange-50',  ring: 'ring-orange-200',  trend: '-2.4%', up: false, color: 'text-orange-600' },
  ];

  const pieData = [
    { name: 'نشط',        value: subscribers.filter(s => s.subscriberStatus === 'نشط').length,          color: '#10b981' },
    { name: 'جديد',       value: subscribers.filter(s => s.subscriberStatus === 'مشترك جديد').length,   color: '#3b82f6' },
    { name: 'رسوم',       value: subscribers.filter(s => s.subscriberStatus === 'رسوم مستحقة').length,  color: '#f59e0b' },
    { name: 'أرباح',      value: subscribers.filter(s => s.subscriberStatus === 'توزيع أرباح').length,  color: '#8b5cf6' },
    { name: 'معلق',       value: subscribers.filter(s => s.subscriberStatus === 'معلق').length,         color: '#94a3b8' },
  ].filter(d => d.value > 0);

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800">لوحة التحكم</h2>
          <p className="text-sm text-slate-400 mt-0.5">نظرة شاملة على أداء النظام</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-slate-600 border-slate-200 h-9 hidden sm:flex">
            <Download size={13} /> تصدير
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-slate-600 border-slate-200 h-9"
            onClick={() => { setDraft(stats.totalProfits); setEditOpen(true); }}>
            <Pencil size={13} /> تعديل الأرباح
          </Button>
        </div>
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
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTgt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 20px rgb(0 0 0 / 0.08)' }}
                  formatter={(v: number, name: string) => [`${v.toLocaleString()} ر.س`, name === 'value' ? 'الأرباح' : 'الهدف']}
                />
                <Area type="monotone" dataKey="target" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" fillOpacity={1} fill="url(#gTgt)" />
                <Area type="monotone" dataKey="value"  stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#gVal)" dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }} />
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
                <Tooltip formatter={(v: number, _name: string, props: any) => [`${v} مشترك`, props.payload.name]} contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  op.status === 'مكتمل' ? 'bg-emerald-100' : op.status === 'تنشيط النظام' ? 'bg-red-100' : op.status === 'اشتراك جديد' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
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
              { label: 'عمليات مكتملة',  value: completedOps,  total: operations.length, color: 'bg-emerald-500' },
              { label: 'قيد المعالجة',   value: pendingOps,    total: operations.length, color: 'bg-blue-500' },
              { label: 'تنشيط النظام',   value: activationOps, total: operations.length, color: 'bg-red-500' },
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

      {/* Edit profits modal */}
      <AnimatePresence>
        {editOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-800">تعديل إجمالي الأرباح</h3>
                <button onClick={() => setEditOpen(false)} className="text-slate-400 hover:text-slate-600 w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center"><X size={16} /></button>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block">قيمة الأرباح (نص حر)</label>
                <Input value={draft} onChange={e => setDraft(e.target.value)} className="h-11" placeholder="مثال: ١٬٢٨٤٬٥٠٠ ر.س" />
                <p className="text-xs text-slate-400 mt-1.5">باقي الإحصائيات تُحسب تلقائياً من البيانات الفعلية.</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)} className="border-slate-200">إلغاء</Button>
                <Button onClick={() => { onProfitsChange(draft); setEditOpen(false); }} className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 px-5">
                  <Save size={13} /> حفظ
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Admin Panel
// ─────────────────────────────────────────────────────────────

const OPS_PER_PAGE = 8;

function AdminPanel({ subscribers, operations }: { subscribers: Subscriber[]; operations: Operation[] }) {
  const [query, setQuery] = useState('');
  const [found, setFound] = useState<Subscriber | null>(null);
  const [searched, setSearched] = useState(false);
  const [opsPage, setOpsPage] = useState(1);
  const [showWallet, setShowWallet] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
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
    setOpsPage(1);
    setShowWallet(false);
  };

  const subscriberOps = useMemo(() => {
    if (!found) return [];
    return operations.filter(op => op.subscriberName === found.name);
  }, [found, operations]);

  const totalOpsPages = Math.max(1, Math.ceil(subscriberOps.length / OPS_PER_PAGE));
  const pagedOps = subscriberOps.slice((opsPage - 1) * OPS_PER_PAGE, opsPage * OPS_PER_PAGE);

  const clear = () => { setQuery(''); setFound(null); setSearched(false); setOpsPage(1); };

  return (
    <>
      <div>
        <h2 className="text-2xl font-black text-slate-800">لوحة الأدمن</h2>
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
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              </div>
              <Button onClick={handleSearch}
                className="h-12 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all whitespace-nowrap">
                استعلام الآن
              </Button>
              {searched && (
                <Button variant="outline" onClick={clear}
                  className="h-12 border-white/20 text-white hover:bg-white/10 rounded-xl px-3">
                  <X size={17} />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'إجمالي المشتركين', value: subscribers.length,                                              icon: <Users size={13} /> },
                { label: 'نشطون',             value: subscribers.filter(s => s.subscriberStatus === 'نشط').length,   icon: <CheckCircle2 size={13} /> },
                { label: 'رسوم مستحقة',       value: subscribers.filter(s => s.systemFees > 0).length,              icon: <AlertCircle size={13} /> },
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
                      {found.phone       && <MiniInfo icon={<Phone size={13} />}     label="الجوال"      value={found.phone} />}
                      {found.iban        && <MiniInfo icon={<CreditCard size={13} />} label="الآيبان"    value={found.iban} mono />}
                      {found.bankName    && <MiniInfo icon={<Building2 size={13} />}  label="البنك"       value={found.bankName} />}
                      {found.systemAccount && <MiniInfo icon={<Database size={13} />} label="حساب النظام" value={found.systemAccount} mono />}
                    </div>
                  </div>
                </div>

                {/* Financial */}
                <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {found.subscriptionAmount > 0 && (
                    <FinBox icon={<Wallet size={17} className="text-blue-500" />}    label="مبلغ الاشتراك" value={`${found.subscriptionAmount.toLocaleString()} ر.س`} bg="bg-blue-50"    ring="ring-blue-200"    color="text-blue-700" />
                  )}
                  {found.profits > 0 && (
                    <FinBox icon={<TrendingUp size={17} className="text-emerald-500" />} label="إجمالي الأرباح" value={`${found.profits.toLocaleString()} ر.س`} bg="bg-emerald-50" ring="ring-emerald-200" color="text-emerald-700" />
                  )}
                  {found.systemFees > 0 && (
                    <FinBox icon={<AlertTriangle size={17} className="text-orange-500" />} label="رسوم النظام" value={`${found.systemFees.toLocaleString()} ر.س`} bg="bg-orange-50" ring="ring-orange-200" color="text-orange-700"
                      extra={<Button size="sm" className="mt-2 h-7 text-xs bg-orange-500 hover:bg-orange-600 w-full shadow-sm">تنشيط الآن</Button>} />
                  )}
                  <FinBox icon={<Activity size={17} className="text-purple-500" />} label="العمليات" value={`${subscriberOps.length} عملية`} bg="bg-purple-50" ring="ring-purple-200" color="text-purple-700" />
                </div>

                {found.walletAddress && (
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-200 flex items-center gap-3">
                    <Hash size={15} className="text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 mb-0.5">المحفظة الرقمية</p>
                      <p className={`text-xs font-mono text-slate-700 truncate transition-all ${showWallet ? '' : 'blur-[3px] select-none'}`}>
                        {found.walletAddress}
                      </p>
                    </div>
                    <button onClick={() => setShowWallet(v => !v)} className="text-slate-400 hover:text-slate-600 flex-shrink-0 p-1">
                      {showWallet ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                )}

                {found.notes && (
                  <div className="mt-3 p-3 rounded-xl bg-yellow-50 ring-1 ring-yellow-200 text-sm text-slate-700">
                    <span className="font-bold text-yellow-700">ملاحظة: </span>{found.notes}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operations Table */}
            {subscriberOps.length > 0 && (
              <Card className="border-none shadow-sm ring-1 ring-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <CardTitle className="text-base font-black text-slate-800">آخر العمليات</CardTitle>
                      <CardDescription className="text-xs">{subscriberOps.length} عملية مسجّلة</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 border text-xs">{subscriberOps.filter(o => o.status === 'مكتمل').length} مكتمل</Badge>
                      {subscriberOps.filter(o => o.status === 'تنشيط النظام').length > 0 && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 border text-xs">{subscriberOps.filter(o => o.status === 'تنشيط النظام').length} تنشيط</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
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
                          <TableRow key={op.id} className="hover:bg-slate-50/80 transition-colors">
                            <TableCell className="text-slate-400 text-xs">{(opsPage - 1) * OPS_PER_PAGE + i + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  op.status === 'مكتمل' ? 'bg-emerald-500' : op.status === 'تنشيط النظام' ? 'bg-red-500' : op.status === 'اشتراك جديد' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`} />
                                <span className="text-sm font-medium text-slate-700">{op.operation}</span>
                              </div>
                            </TableCell>
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
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200" disabled={opsPage === 1} onClick={() => setOpsPage(p => p - 1)}><ChevronRight size={14} /></Button>
                        {Array.from({ length: Math.min(totalOpsPages, 5) }, (_, i) => {
                          const pg = opsPage <= 3 ? i + 1 : opsPage + i - 2;
                          if (pg > totalOpsPages) return null;
                          return (
                            <Button key={pg} size="sm" className={`h-8 w-8 p-0 text-xs ${pg === opsPage ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`} onClick={() => setOpsPage(pg)}>{pg}</Button>
                          );
                        })}
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200" disabled={opsPage === totalOpsPages} onClick={() => setOpsPage(p => p + 1)}><ChevronLeft size={14} /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
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

function AddOperationsTab({ operations, onOperationsChange, subscriberNames }: {
  operations: Operation[];
  onOperationsChange: (o: Operation[]) => void;
  subscriberNames: string[];
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
          <h2 className="text-2xl font-black text-slate-800">سجل العمليات</h2>
          <p className="text-sm text-slate-400 mt-0.5">{operations.length} عملية مسجّلة في النظام</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-sm">
          <Plus size={16} /> إضافة عملية
        </Button>
      </div>

      {/* Filters */}
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

      {/* Table */}
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
                <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronRight size={13} /> السابق
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3 border-slate-200 gap-1 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  التالي <ChevronLeft size={13} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
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

function AddSubscriberTab({ subscribers, onSubscribersChange }: {
  subscribers: Subscriber[];
  onSubscribersChange: (s: Subscriber[]) => void;
}) {
  const [form, setForm] = useState<Omit<Subscriber, 'id'>>({ ...EMPTY_SUB });
  const [editId, setEditId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [page, setPage] = useState(1);
  const [searchSub, setSearchSub] = useState('');
  const [customBank, setCustomBank] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
          <h2 className="text-2xl font-black text-slate-800">{editId ? 'تعديل مشترك' : 'إضافة مشترك جديد'}</h2>
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
            <FField label="اسم المشترك"            icon={<User size={12} />}        value={f.name}               onChange={v => set('name', v)}               placeholder="الاسم الكامل" />
            <FField label="رقم الهاتف"             icon={<Phone size={12} />}       value={f.phone}              onChange={v => set('phone', v)}              placeholder="05xxxxxxxx" />
            <FField label="رقم الآيبان (IBAN)"     icon={<CreditCard size={12} />}  value={f.iban}               onChange={v => set('iban', v)}               placeholder="SAxx xxxx xxxx" mono />
            <FField label="مبلغ الاشتراك (ر.س)"    icon={<Wallet size={12} />}      type="number" value={f.subscriptionAmount === 0 ? '' : String(f.subscriptionAmount)} onChange={v => set('subscriptionAmount', Number(v))} placeholder="0" />
            <FField label="الأرباح (ر.س)"           icon={<TrendingUp size={12} />}  type="number" value={f.profits === 0 ? '' : String(f.profits)}             onChange={v => set('profits', Number(v))} placeholder="0" />
            <FField label="رسوم النظام (ر.س)"       icon={<AlertCircle size={12} />} type="number" value={f.systemFees === 0 ? '' : String(f.systemFees)}       onChange={v => set('systemFees', Number(v))} placeholder="0" />
            <FField label="حساب النظام"             icon={<Building2 size={12} />}   value={f.systemAccount}      onChange={v => set('systemAccount', v)}      placeholder="SYS-000000" mono />
            <FField label="عنوان المحفظة الرقمية"   icon={<Hash size={12} />}        value={f.walletAddress}      onChange={v => set('walletAddress', v)}      placeholder="0x..." mono />
            <FField label="تاريخ الانضمام"          icon={<Calendar size={12} />}    type="date" value={f.joinDate} onChange={v => set('joinDate', v)} />
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

      {/* Delete confirm */}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {sub.iban               && <Chip icon={<CreditCard size={12} />} label="آيبان"         value={sub.iban} mono />}
                {sub.subscriptionAmount > 0 && <Chip icon={<Wallet size={12} />}    label="الاشتراك"    value={`${sub.subscriptionAmount.toLocaleString()} ر.س`} />}
                {sub.profits > 0           && <Chip icon={<TrendingUp size={12} />} label="الأرباح"     value={`${sub.profits.toLocaleString()} ر.س`} green />}
                {sub.systemFees > 0        && <Chip icon={<AlertCircle size={12} />} label="رسوم النظام" value={`${sub.systemFees.toLocaleString()} ر.س`} orange />}
                {sub.systemAccount         && <Chip icon={<Building2 size={12} />} label="حساب النظام"  value={sub.systemAccount} mono />}
                {sub.bankName              && <Chip icon={<Banknote size={12} />}  label="البنك"        value={sub.bankName} />}
                {sub.joinDate              && <Chip icon={<Calendar size={12} />}  label="الانضمام"     value={sub.joinDate} />}
                {sub.walletAddress         && <Chip icon={<Hash size={12} />}      label="المحفظة"      value={`${sub.walletAddress.slice(0, 12)}…`} mono />}
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
