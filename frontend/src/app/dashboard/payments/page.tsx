"use client";

import { useEffect, useState, useCallback } from "react";
import { paymentsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Zap, Droplets, DoorOpen, Check, X } from "lucide-react";

interface PaymentOverview {
  _id: string;
  room: {
    _id: string;
    roomNumber: string;
    floor: number;
  };
  month: number;
  year: number;
  rent: number;
  tenantCount: number;
  electricityUsed: number | null;
  waterUsed: number | null;
  electricityCost: number;
  waterCost: number;
  serviceFee: number;
  rentPaid: boolean;
  servicePaid: boolean;
  utilityPaid: boolean;
  note: string;
}

export default function PaymentsPage() {
  const now = new Date();
  const [payments, setPayments] = useState<PaymentOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  const years = Array.from({ length: 5 }, (_, i) => String(now.getFullYear() - 2 + i));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentsAPI.getOverview({ month, year });
      setPayments(res.data);
    } catch {
      toast.error("Lỗi khi tải dữ liệu thanh toán");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleRent = async (id: string) => {
    try {
      await paymentsAPI.toggleRentPaid(id);
      setPayments((prev) =>
        prev.map((p) => (p._id === id ? { ...p, rentPaid: !p.rentPaid } : p))
      );
      toast.success("Đã cập nhật trạng thái tiền phòng");
    } catch {
      toast.error("Lỗi khi cập nhật");
    }
  };

  const handleToggleService = async (id: string) => {
    try {
      await paymentsAPI.toggleServicePaid(id);
      setPayments((prev) =>
        prev.map((p) => (p._id === id ? { ...p, servicePaid: !p.servicePaid } : p))
      );
      toast.success("Đã cập nhật trạng thái tiền dịch vụ");
    } catch {
      toast.error("Lỗi khi cập nhật");
    }
  };

  const handleToggleUtility = async (id: string) => {
    try {
      await paymentsAPI.toggleUtilityPaid(id);
      setPayments((prev) =>
        prev.map((p) => (p._id === id ? { ...p, utilityPaid: !p.utilityPaid } : p))
      );
      toast.success("Đã cập nhật trạng thái tiền điện/nước");
    } catch {
      toast.error("Lỗi khi cập nhật");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
        <p className="text-gray-500 text-sm mt-1">
          Theo dõi tiền phòng và dịch vụ hàng tháng
        </p>
      </div>

      {/* Month/Year Selector */}
      <div className="flex gap-3 items-end">
        <div>
          <Label className="text-xs text-gray-500">Tháng</Label>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-32 mt-1">
              <SelectValue>{`Tháng ${month}`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  Tháng {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-gray-500">Năm</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-28 mt-1">
              <SelectValue>{`Năm ${year}`}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Tổng phòng</p>
          <p className="text-xl font-bold text-gray-900">{payments.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Đã đóng tiền phòng</p>
          <p className="text-xl font-bold text-green-600">
            {payments.filter((p) => p.rentPaid).length}/{payments.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Đã đóng tiền DV</p>
          <p className="text-xl font-bold text-green-600">
            {payments.filter((p) => p.servicePaid).length}/{payments.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Đã đóng Điện/Nước</p>
          <p className="text-xl font-bold text-green-600">
            {payments.filter((p) => p.utilityPaid).length}/{payments.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Tổng tiền dự kiến</p>
          <p className="text-xl font-bold text-gray-900 truncate">
            {formatCurrency(payments.reduce((s, p) => s + p.rent + p.serviceFee + p.electricityCost + p.waterCost, 0))}
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold">Phòng</TableHead>
                <TableHead className="font-semibold text-right">Tiền phòng</TableHead>
                <TableHead className="font-semibold text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Tiêu thụ Điện
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> Tiêu thụ Nước
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-right">Tiền dịch vụ</TableHead>
                <TableHead className="font-semibold text-center">TT Tiền phòng</TableHead>
                <TableHead className="font-semibold text-center">TT Tiền DV</TableHead>
                <TableHead className="font-semibold text-center">TT Tiền Điện/nước</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p._id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div>
                      <span className="font-semibold text-gray-900">Phòng {p.room.roomNumber}</span>
                      <span className="text-xs text-gray-400 ml-2">({p.tenantCount} người)</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-900">
                    {formatCurrency(p.rent)}
                  </TableCell>
                  <TableCell className="text-center">
                    {p.electricityUsed !== null ? (
                      <div>
                        <span className="font-semibold text-amber-600">{p.electricityUsed} kWh</span>
                        <div className="text-xs text-gray-400 font-normal">{formatCurrency(p.electricityCost)}</div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-400 border-gray-200">
                        Chưa chốt số
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {p.waterUsed !== null ? (
                      <div>
                        <span className="font-semibold text-blue-600">{p.waterUsed} m³</span>
                        <div className="text-xs text-gray-400 font-normal">{formatCurrency(p.waterCost)}</div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-gray-50 text-gray-400 border-gray-200">
                        Chưa chốt số
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-900">
                    {formatCurrency(p.serviceFee)}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggleRent(p._id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
                        ${p.rentPaid
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-50 text-red-500 hover:bg-red-100"
                        }
                      `}
                    >
                      {p.rentPaid ? (
                        <><Check className="w-3 h-3" /> Đã đóng</>
                      ) : (
                        <><X className="w-3 h-3" /> Chưa đóng</>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggleService(p._id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
                        ${p.servicePaid
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-50 text-red-500 hover:bg-red-100"
                        }
                      `}
                    >
                      {p.servicePaid ? (
                        <><Check className="w-3 h-3" /> Đã đóng</>
                      ) : (
                        <><X className="w-3 h-3" /> Chưa đóng</>
                      )}
                    </button>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggleUtility(p._id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
                        ${p.utilityPaid
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-50 text-red-500 hover:bg-red-100"
                        }
                      `}
                    >
                      {p.utilityPaid ? (
                        <><Check className="w-3 h-3" /> Đã đóng</>
                      ) : (
                        <><X className="w-3 h-3" /> Chưa đóng</>
                      )}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    <DoorOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p>Không có phòng nào đang có người ở</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
