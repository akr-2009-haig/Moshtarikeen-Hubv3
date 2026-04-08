/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  Wallet,
  Search,
  LayoutDashboard,
  Settings,
  Bell,
  LogOut,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Phone,
  User,
  Shield,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ChevronDown,
  Hash,
  Building2,
  UserPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────
// localStorage hook
// ────────────────────────────────────────────────────────────

function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  };

  return [storedValue, setValue];
}

// ────────────────────────────────────────────────────────────
// Initial / seed data
// ────────────────────────────────────────────────────────────

const INITIAL_SUBSCRIBERS: Subscriber[] = [
  {
    id: '1',
    name: 'عفاف مبارك الاحمري',
    phone: '0598920244',
    iban: 'SA1380000295608016001301',
    subscriptionAmount: 1750,
    profits: 45000,
    systemFees: 750,
    systemAccount: '',
    walletAddress: '',
  },
  {
    id: '2',
    name: 'احمد العتيبي',
    phone: '0501234567',
    iban: 'SA4380000295608016001302',
    subscriptionAmount: 1200,
    profits: 22000,
    systemFees: 500,
    systemAccount: '',
    walletAddress: '',
  },
];

const INITIAL_OPERATIONS: Operation[] = [
  { id: '1',  subscriberName: 'احمد العتيبي',    operation: 'توزيع ارباح',  amount: '+1,200 ر.س',  date: '2026/04/08', status: 'مكتمل' },
  { id: '2',  subscriberName: 'سارة القحطاني',   operation: 'اشتراك جديد',  amount: '-2,500 ر.س',  date: '2026/04/08', status: 'اشتراك جديد' },
  { id: '3',  subscriberName: 'محمد الشهري',     operation: 'تنشيط النظام', amount: '-750 ر.س',    date: '2026/04/08', status: 'تنشيط النظام' },
  { id: '4',  subscriberName: 'نورة الدوسري',    operation: 'توزيع ارباح',  amount: '+3,400 ر.س',  date: '2026/04/08', status: 'مكتمل' },
  { id: '5',  subscriberName: 'فهد المطيري',     operation: 'اشتراك جديد',  amount: '-1,750 ر.س',  date: '2026/04/08', status: 'اشتراك جديد' },
  { id: '6',  subscriberName: 'ريم العنزي',      operation: 'توزيع ارباح',  amount: '+15,000 ر.س', date: '2026/04/08', status: 'مكتمل' },
  { id: '7',  subscriberName: 'خالد الغامدي',    operation: 'تنشيط النظام', amount: '-750 ر.س',    date: '2026/04/08', status: 'تنشيط النظام' },
  { id: '8',  subscriberName: 'هيا السبيعي',     operation: 'توزيع ارباح',  amount: '+2,100 ر.س',  date: '2026/04/08', status: 'مكتمل' },
  { id: '9',  subscriberName: 'عبدالله الشمري',  operation: 'اشتراك جديد',  amount: '-5,000 ر.س',  date: '2026/04/08', status: 'اشتراك جديد' },
  { id: '10', subscriberName: 'ليلى الحربي',     operation: 'توزيع ارباح',  amount: '+8,500 ر.س',  date: '2026/04/08', status: 'مكتمل' },
];

const INITIAL_STATS: Stats = {
  totalSubscribers: '1,284',
  totalProfits: '452,900 ر.س',
  activeSubscriptions: '942',
  pendingRequests: '12',
};

const chartData = [
  { name: 'يناير', value: 4000 },
  { name: 'فبراير', value: 3000 },
  { name: 'مارس',  value: 2000 },
  { name: 'ابريل', value: 2780 },
  { name: 'مايو',  value: 1890 },
  { name: 'يونيو', value: 2390 },
  { name: 'يوليو', value: 3490 },
];

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function amountColor(status: string) {
  if (status === 'تنشيط النظام') return 'text-red-600';
  if (status === 'اشتراك جديد')  return 'text-yellow-600';
  return 'text-green-600';
}

function statusBadge(status: string) {
  if (status === 'تنشيط النظام')
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">تنشيط النظام</Badge>;
  if (status === 'اشتراك جديد')
    return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">اشتراك جديد</Badge>;
  if (status === 'قيد المعالجة')
    return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">قيد المعالجة</Badge>;
  return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">مكتمل</Badge>;
}

// ────────────────────────────────────────────────────────────
// Empty form templates
// ────────────────────────────────────────────────────────────

const EMPTY_SUBSCRIBER: Omit<Subscriber, 'id'> = {
  name: '', phone: '', iban: '',
  subscriptionAmount: 0, profits: 0, systemFees: 0,
  systemAccount: '', walletAddress: '',
};

const EMPTY_OPERATION: Omit<Operation, 'id'> = {
  subscriberName: '', operation: 'توزيع ارباح',
  amount: '', date: '', status: 'مكتمل',
};

// ────────────────────────────────────────────────────────────
// Main App
// ────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'admin' | 'addOperations' | 'addSubscriber';

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [subscribers, setSubscribers] = useLocalStorage<Subscriber[]>('subscribers_v1', INITIAL_SUBSCRIBERS);
  const [operations, setOperations]   = useLocalStorage<Operation[]>('operations_v1',   INITIAL_OPERATIONS);
  const [stats, setStats]             = useLocalStorage<Stats>('stats_v1',               INITIAL_STATS);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl">
              <LayoutDashboard size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">نظام الادارة</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem icon={<LayoutDashboard size={20} />} label="لوحة التحكم"    active={activeTab === 'dashboard'}     onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Shield size={20} />}          label="لوحة الادمن"    active={activeTab === 'admin'}          onClick={() => setActiveTab('admin')} />
          <NavItem icon={<ClipboardList size={20} />}   label="اضافة عمليات"   active={activeTab === 'addOperations'} onClick={() => setActiveTab('addOperations')} />
          <NavItem icon={<UserPlus size={20} />}        label="اضافة مشترك"    active={activeTab === 'addSubscriber'} onClick={() => setActiveTab('addSubscriber')} />
          <Separator className="my-4" />
          <NavItem icon={<Settings size={20} />}        label="الاعدادات"      active={false}                         onClick={() => {}} />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-600 cursor-pointer transition-colors">
            <LogOut size={20} />
            <span className="font-medium">تسجيل الخروج</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4 lg:hidden">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <LayoutDashboard size={20} />
            </div>
            <span className="font-bold text-lg">نظام الادارة</span>
          </div>

          <div className="hidden lg:block">
            <h1 className="text-2xl font-bold text-gray-900">نظام ادارة المشتركين</h1>
            <p className="text-sm text-gray-500">مرحبا بك في لوحة التحكم</p>
          </div>

          {/* Mobile tab switcher */}
          <div className="flex lg:hidden gap-1.5 flex-wrap">
            <button onClick={() => setActiveTab('dashboard')}     className={`p-2 rounded-lg text-sm font-medium ${activeTab === 'dashboard'     ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}><LayoutDashboard size={16} /></button>
            <button onClick={() => setActiveTab('admin')}         className={`p-2 rounded-lg text-sm font-medium ${activeTab === 'admin'         ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}><Shield size={16} /></button>
            <button onClick={() => setActiveTab('addOperations')} className={`p-2 rounded-lg text-sm font-medium ${activeTab === 'addOperations' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}><ClipboardList size={16} /></button>
            <button onClick={() => setActiveTab('addSubscriber')} className={`p-2 rounded-lg text-sm font-medium ${activeTab === 'addSubscriber' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-600'}`}><UserPlus size={16} /></button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold">المدير العام</p>
                <p className="text-xs text-gray-500">admin@system.com</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
              <DashboardTab stats={stats} onStatsChange={setStats} />
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AdminPanel subscribers={subscribers} operations={operations} onOperationsChange={setOperations} />
            </motion.div>
          )}
          {activeTab === 'addOperations' && (
            <motion.div key="addOperations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AddOperationsTab operations={operations} onOperationsChange={setOperations} />
            </motion.div>
          )}
          {activeTab === 'addSubscriber' && (
            <motion.div key="addSubscriber" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto w-full">
              <AddSubscriberTab subscribers={subscribers} onSubscribersChange={setSubscribers} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Dashboard Tab
// ────────────────────────────────────────────────────────────

function DashboardTab({ stats, onStatsChange }: { stats: Stats; onStatsChange: (s: Stats) => void }) {
  const [editingStats, setEditingStats] = useState(false);
  const [draft, setDraft]               = useState<Stats>(stats);

  const saveStats = () => { onStatsChange(draft); setEditingStats(false); };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">الاحصائيات</h2>
        <Button variant="outline" size="sm" className="gap-2"
          onClick={() => { setDraft({ ...stats }); setEditingStats(true); }}>
          <Pencil size={14} /> تعديل البطاقات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="اجمالي المشتركين"   value={stats.totalSubscribers}    icon={<Users        className="text-blue-600" />}   bgColor="bg-blue-50" />
        <StatCard title="اجمالي الارباح"     value={stats.totalProfits}        icon={<TrendingUp   className="text-green-600" />}  bgColor="bg-green-50" />
        <StatCard title="الاشتراكات النشطة"  value={stats.activeSubscriptions} icon={<CheckCircle2 className="text-purple-600" />} bgColor="bg-purple-50" />
        <StatCard title="طلبات معلقة"        value={stats.pendingRequests}     icon={<AlertCircle  className="text-orange-600" />} bgColor="bg-orange-50" />
      </div>

      <AnimatePresence>
        {editingStats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">تعديل البطاقات</h3>
                <button onClick={() => setEditingStats(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <LabeledInput label="اجمالي المشتركين"   value={draft.totalSubscribers}    onChange={v => setDraft(d => ({ ...d, totalSubscribers: v }))} />
                <LabeledInput label="اجمالي الارباح"     value={draft.totalProfits}        onChange={v => setDraft(d => ({ ...d, totalProfits: v }))} />
                <LabeledInput label="الاشتراكات النشطة"  value={draft.activeSubscriptions} onChange={v => setDraft(d => ({ ...d, activeSubscriptions: v }))} />
                <LabeledInput label="طلبات معلقة"        value={draft.pendingRequests}     onChange={v => setDraft(d => ({ ...d, pendingRequests: v }))} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditingStats(false)}>الغاء</Button>
                <Button onClick={saveStats} className="gap-2"><Save size={14} /> حفظ</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>نمو الارباح</CardTitle>
          <CardDescription>تحليل الارباح الشهرية للنظام</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#141414" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#141414" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="value" stroke="#141414" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Admin Panel Tab — Search subscriber + show details + operations
// ────────────────────────────────────────────────────────────

function AdminPanel({ subscribers, operations, onOperationsChange }: {
  subscribers: Subscriber[];
  operations: Operation[];
  onOperationsChange: (o: Operation[]) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [foundSubscriber, setFoundSubscriber] = useState<Subscriber | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim().toLowerCase();
    const found = subscribers.find(s =>
      s.name.toLowerCase().includes(q) ||
      s.iban.toLowerCase().includes(q) ||
      s.walletAddress.toLowerCase().includes(q) ||
      s.systemAccount.toLowerCase().includes(q) ||
      s.phone.includes(q)
    );
    setFoundSubscriber(found || null);
    setSearched(true);
  };

  const subscriberOps = useMemo(() => {
    if (!foundSubscriber) return [];
    return operations.filter(op => op.subscriberName === foundSubscriber.name);
  }, [foundSubscriber, operations]);

  const clearSearch = () => {
    setSearchQuery('');
    setFoundSubscriber(null);
    setSearched(false);
  };

  return (
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-800">لوحة الادمن</h2>
        <p className="text-sm text-gray-500">البحث عن مشترك وعرض بياناته وعملياته</p>
      </div>

      {/* Search */}
      <Card className="border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <CardHeader>
          <CardTitle className="text-primary-foreground">الاستعلام عن الارباح</CardTitle>
          <CardDescription className="text-gray-300">أدخل رقم الآيبان (IBAN) للمشترك لعرض تفاصيل أرباحه</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="relative">
            <Input
              placeholder="ادخل الاسم، الآيبان، عنوان المحفظة، أو رقم الهاتف..."
              className="bg-white/10 border-white/20 text-primary-foreground placeholder:text-gray-400 h-12 pr-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
          </div>
          <div className="flex gap-3">
            <Button className="flex-1 bg-white text-primary hover:bg-gray-100 h-12 font-bold" onClick={handleSearch}>
              استعلام الآن
            </Button>
            {searched && (
              <Button variant="outline" className="h-12 border-white/30 text-primary-foreground hover:bg-white/10" onClick={clearSearch}>
                <X size={16} />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {searched && foundSubscriber && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Subscriber Profile Card */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardContent className="p-0">
                {/* Header with name and status */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <User size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{foundSubscriber.name}</h3>
                      <p className="text-sm text-green-600 font-medium">مشترك نشط في النظام</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-4 py-1.5 text-sm">نشط</Badge>
                </div>

                {/* Details */}
                <div className="p-6 space-y-6">
                  {/* Phone */}
                  <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Phone size={18} />
                      <span className="text-sm">رقم الجوال</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 tracking-wide">{foundSubscriber.phone || '—'}</span>
                  </div>

                  {/* IBAN */}
                  <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-2 text-gray-500">
                      <CreditCard size={18} />
                      <span className="text-sm">رقم الايبان</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 break-all">{foundSubscriber.iban || '—'}</span>
                  </div>

                  {/* Subscription Amount */}
                  {foundSubscriber.subscriptionAmount > 0 && (
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Wallet size={18} />
                        <span className="text-sm">مبلغ الاشتراك</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{foundSubscriber.subscriptionAmount.toLocaleString()} ر.س</span>
                    </div>
                  )}

                  {/* Profits */}
                  {foundSubscriber.profits > 0 && (
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <TrendingUp size={18} />
                        <span className="text-sm">إجمالي الأرباح</span>
                      </div>
                      <span className="text-lg font-bold text-green-600">{foundSubscriber.profits.toLocaleString()} ر.س</span>
                    </div>
                  )}

                  {/* System Fees */}
                  {foundSubscriber.systemFees > 0 && (
                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle size={18} className="text-orange-500" />
                              <span className="font-bold text-gray-800">رسوم النظام المستحقة</span>
                            </div>
                            <p className="text-xs text-gray-500">يستخدم لتنشيط النظام واستلام أرباحك</p>
                          </div>
                          <div className="text-left">
                            <span className="text-2xl font-black text-orange-600">{foundSubscriber.systemFees.toLocaleString()} ر.س</span>
                            {foundSubscriber.iban && (
                              <p className="text-xs text-gray-400 mt-1">SAr{foundSubscriber.iban}</p>
                            )}
                          </div>
                        </div>
                        <Button className="mt-3 bg-green-600 hover:bg-green-700 text-white gap-2">
                          <CheckCircle2 size={14} /> تنشيط الآن
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* System Account & Wallet */}
                  {foundSubscriber.systemAccount && (
                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Building2 size={18} />
                        <span className="text-sm">حساب النظام</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{foundSubscriber.systemAccount}</span>
                    </div>
                  )}
                  {foundSubscriber.walletAddress && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Hash size={18} />
                        <span className="text-sm">عنوان المحفظة</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 break-all">{foundSubscriber.walletAddress}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subscriber Operations */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">آخر العمليات</CardTitle>
                <CardDescription>قائمة بأحدث عمليات الاشتراك وتوزيع الأرباح</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-right font-bold">المشترك</TableHead>
                        <TableHead className="text-right font-bold">العملية</TableHead>
                        <TableHead className="text-right font-bold">المبلغ</TableHead>
                        <TableHead className="text-right font-bold">التاريخ</TableHead>
                        <TableHead className="text-right font-bold">الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriberOps.length > 0 ? subscriberOps.map(op => (
                        <TableRow key={op.id} className="hover:bg-gray-50/50">
                          <TableCell className="font-medium">{op.subscriberName}</TableCell>
                          <TableCell>{op.operation}</TableCell>
                          <TableCell className={`font-bold ${amountColor(op.status)}`}>{op.amount}</TableCell>
                          <TableCell className="text-gray-500 text-sm">{op.date}</TableCell>
                          <TableCell>{statusBadge(op.status)}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400 py-8">لا توجد عمليات لهذا المشترك.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {searched && !foundSubscriber && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Search size={32} className="mx-auto mb-4 text-gray-300" />
            <h3 className="font-bold text-gray-700">لم يعثر على مشترك</h3>
            <p className="text-sm text-gray-500 mt-1">لم يعثر على مشترك يطابق معايير البحث.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Add Operations Tab
// ────────────────────────────────────────────────────────────

const OPERATION_TYPES    = ['توزيع ارباح', 'اشتراك جديد', 'تنشيط النظام', 'سحب ارباح', 'تحويل'];
const OPERATION_STATUSES = ['مكتمل', 'اشتراك جديد', 'تنشيط النظام', 'قيد المعالجة'];

function AddOperationsTab({ operations, onOperationsChange }: {
  operations: Operation[];
  onOperationsChange: (o: Operation[]) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [form, setForm]           = useState<Omit<Operation, 'id'>>(EMPTY_OPERATION);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...EMPTY_OPERATION, date: new Date().toISOString().slice(0, 10).replace(/-/g, '/') });
    setModalOpen(true);
  };

  const openEdit = (op: Operation) => {
    setEditId(op.id);
    const { id: _id, ...rest } = op;
    setForm(rest);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      onOperationsChange(operations.map(o => o.id === editId ? { id: editId, ...form } : o));
    } else {
      onOperationsChange([{ id: uid(), ...form }, ...operations]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => onOperationsChange(operations.filter(o => o.id !== id));

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">سجل العمليات</h2>
          <p className="text-sm text-gray-500">عرض وتعديل جميع العمليات</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus size={16} /> اضافة عملية</Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-right font-bold">المشترك</TableHead>
                  <TableHead className="text-right font-bold">العملية</TableHead>
                  <TableHead className="text-right font-bold">المبلغ</TableHead>
                  <TableHead className="text-right font-bold">التاريخ</TableHead>
                  <TableHead className="text-right font-bold">الحالة</TableHead>
                  <TableHead className="text-right font-bold">اجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operations.map(op => (
                  <TableRow key={op.id} className="hover:bg-gray-50/50">
                    <TableCell className="font-medium">{op.subscriberName || '—'}</TableCell>
                    <TableCell>{op.operation}</TableCell>
                    <TableCell className={`font-bold ${amountColor(op.status)}`}>{op.amount}</TableCell>
                    <TableCell className="text-gray-500 text-sm">{op.date}</TableCell>
                    <TableCell>{statusBadge(op.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(op)}     className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(op.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {operations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400 py-10">لا توجد عمليات بعد.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6 flex-wrap text-xs text-gray-500 pt-1">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> مكتمل — المبلغ اخضر</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> اشتراك جديد — المبلغ اصفر</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> تنشيط النظام — المبلغ احمر</span>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{editId ? 'تعديل عملية' : 'اضافة عملية جديدة'}</h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
              </div>

              <div className="space-y-3">
                <LabeledInput label="اسم المشترك" value={form.subscriberName} onChange={v => setForm(f => ({ ...f, subscriberName: v }))} />

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">نوع العملية</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                    value={form.operation}
                    onChange={e => setForm(f => ({ ...f, operation: e.target.value }))}
                  >
                    {OPERATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <LabeledInput label="المبلغ" value={form.amount} onChange={v => setForm(f => ({ ...f, amount: v }))} placeholder="+1,200 ر.س" />

                <LabeledInput
                  label="التاريخ"
                  type="date"
                  value={form.date.replace(/\//g, '-')}
                  onChange={v => setForm(f => ({ ...f, date: v.replace(/-/g, '/') }))}
                />

                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">الحالة</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    {OPERATION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>الغاء</Button>
                <Button onClick={handleSave} className="gap-2">
                  <Save size={14} /> {editId ? 'حفظ' : 'اضافة'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Add Subscriber Tab
// ────────────────────────────────────────────────────────────

function AddSubscriberTab({ subscribers, onSubscribersChange }: {
  subscribers: Subscriber[];
  onSubscribersChange: (s: Subscriber[]) => void;
}) {
  const [form, setForm] = useState<Omit<Subscriber, 'id'>>(EMPTY_SUBSCRIBER);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSubscribersChange([...subscribers, { id: uid(), ...form }]);
    setForm(EMPTY_SUBSCRIBER);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-800">اضافة مشترك جديد</h2>
        <p className="text-sm text-gray-500">ادخل بيانات المشترك الجديد واضغط حفظ</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledInput label="اسم المشترك"          icon={<User size={14} />}       value={form.name}                          onChange={v => setForm(f => ({ ...f, name: v }))} />
            <LabeledInput label="رقم الهاتف"           icon={<Phone size={14} />}      value={form.phone}                         onChange={v => setForm(f => ({ ...f, phone: v }))} />
            <LabeledInput label="رقم الآيبان IBAN"     icon={<CreditCard size={14} />} value={form.iban}                          onChange={v => setForm(f => ({ ...f, iban: v }))} />
            <LabeledInput label="مبلغ الاشتراك"        icon={<Wallet size={14} />}     type="number" value={String(form.subscriptionAmount)} onChange={v => setForm(f => ({ ...f, subscriptionAmount: Number(v) }))} />
            <LabeledInput label="الارباح"               icon={<TrendingUp size={14} />} type="number" value={String(form.profits)}            onChange={v => setForm(f => ({ ...f, profits: Number(v) }))} />
            <LabeledInput label="رسوم النظام"           icon={<AlertCircle size={14} />} type="number" value={String(form.systemFees)}        onChange={v => setForm(f => ({ ...f, systemFees: Number(v) }))} />
            <LabeledInput label="حساب النظام"           icon={<Building2 size={14} />} value={form.systemAccount}                 onChange={v => setForm(f => ({ ...f, systemAccount: v }))} />
            <LabeledInput label="عنوان المحفظة"         icon={<Hash size={14} />}       value={form.walletAddress}                 onChange={v => setForm(f => ({ ...f, walletAddress: v }))} />
          </div>

          <div className="flex items-center gap-3 mt-6">
            <Button onClick={handleSave} className="gap-2 px-8">
              <Save size={14} /> حفظ
            </Button>
            <AnimatePresence>
              {saved && (
                <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="text-green-600 text-sm font-medium flex items-center gap-1">
                  <CheckCircle2 size={16} /> تم الحفظ بنجاح
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Existing subscribers list */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">جميع المشتركين ({subscribers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscribers.map(sub => (
              <SubscriberCard key={sub.id} sub={sub}
                onEdit={() => {
                  const { id: _id, ...rest } = sub;
                  setForm(rest);
                }}
                onDelete={() => onSubscribersChange(subscribers.filter(s => s.id !== sub.id))}
              />
            ))}
            {subscribers.length === 0 && (
              <p className="text-center text-gray-400 py-8">لا يوجد مشتركون بعد.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ────────────────────────────────────────────────────────────
// Subscriber card sub-component
// ────────────────────────────────────────────────────────────

function SubscriberCard({ sub, onEdit, onDelete, defaultExpanded = false }: {
  sub: Subscriber;
  onEdit: () => void;
  onDelete: () => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-100 rounded-2xl bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User size={18} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{sub.name || '(بدون اسم)'}</p>
            <p className="text-xs text-gray-500">{sub.phone || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          <button onClick={e => { e.stopPropagation(); onEdit(); }}   className="p-2 rounded-lg hover:bg-blue-50 text-blue-500"><Pencil  size={15} /></button>
          <button onClick={e => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-lg hover:bg-red-50  text-red-400"><Trash2  size={15} /></button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-50 pt-4">
              {sub.iban               && <InfoItem icon={<CreditCard size={16} />} label="آيبان"          value={sub.iban} />}
              {sub.subscriptionAmount > 0 && <InfoItem icon={<Wallet size={16} />}     label="مبلغ الاشتراك"  value={`${sub.subscriptionAmount.toLocaleString()} ر.س`} />}
              {sub.profits > 0           && <InfoItem icon={<TrendingUp size={16} />}  label="الارباح"        value={`${sub.profits.toLocaleString()} ر.س`} valueClassName="text-green-600" />}
              {sub.systemFees > 0        && <InfoItem icon={<AlertCircle size={16} />} label="رسوم النظام"    value={`${sub.systemFees.toLocaleString()} ر.س`} valueClassName="text-orange-600" />}
              {sub.systemAccount         && <InfoItem icon={<Building2 size={16} />}   label="حساب النظام"   value={sub.systemAccount} />}
              {sub.walletAddress         && <InfoItem icon={<Hash size={16} />}        label="عنوان المحفظة" value={sub.walletAddress} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Shared small components
// ────────────────────────────────────────────────────────────

function NavItem({ icon, label, active = false, onClick }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
      active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
    }`}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function StatCard({ title, value, icon, bgColor }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${bgColor}`}>{icon}</div>
        </div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-black mt-1 text-gray-900">{value}</h3>
      </CardContent>
    </Card>
  );
}

function InfoItem({ icon, label, value, className = '', valueClassName = '' }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-1.5 text-gray-400">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-sm font-bold text-gray-900 break-all ${valueClassName}`}>{value}</p>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = 'text', icon, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-1">
        {icon}{label}
      </label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder ?? label} className="h-10" />
    </div>
  );
}
