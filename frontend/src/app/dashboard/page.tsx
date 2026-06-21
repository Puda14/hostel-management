"use client";

import { useEffect, useState } from "react";
import { dashboardAPI } from "@/lib/api";
import { formatCurrency, getMonthName } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { DoorOpen, Users, DoorClosed, AlertCircle } from "lucide-react";

interface Stats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  totalTenants: number;
  currentMonth: number;
  currentYear: number;
  totalRevenue: number;
  unpaidCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Tổng số phòng",
      value: stats?.totalRooms || 0,
      icon: DoorOpen,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Phòng đang ở",
      value: stats?.occupiedRooms || 0,
      icon: DoorClosed,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Phòng trống",
      value: stats?.availableRooms || 0,
      icon: DoorOpen,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Tổng người ở",
      value: stats?.totalTenants || 0,
      icon: Users,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Xin chào! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Tổng quan hệ thống nhà trọ — {getMonthName(stats?.currentMonth || 1)}{" "}
          {stats?.currentYear}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${card.bgColor} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Revenue & Unpaid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Doanh thu tháng này</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Tổng tiền đã thu trong {getMonthName(stats?.currentMonth || 1)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Chưa thanh toán</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.unpaidCount || 0} phòng
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Số phòng chưa đóng tiền tháng này
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
