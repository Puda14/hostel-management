"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { roomsAPI, tenantsAPI, utilitiesAPI } from "@/lib/api";
import { formatCurrency, getStatusLabel, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  ChevronRight,
  Users,
  Crown,
  UserPlus,
  UserMinus,
  Zap,
  Droplets,
  ArrowLeft,
  DoorOpen,
  Banknote,
  Shield,
  Gauge,
  Plus,
  Check,
  Undo2,
  Trash2,
  Pencil,
  X,
} from "lucide-react";

interface Tenant {
  _id: string;
  fullName: string;
  phone: string;
  isLeader: boolean;
}

interface UnassignedTenant {
  _id: string;
  fullName: string;
  phone: string;
}

interface Utility {
  _id: string;
  month: number;
  year: number;
  electricityStart: number;
  electricityEnd: number;
  electricityUsed: number;
  waterStart: number;
  waterEnd: number;
  waterUsed: number;
  isFinalized: boolean;
}

interface RoomDetail {
  _id: string;
  roomNumber: string;
  floor: number;
  maxOccupants: number;
  monthlyRent: number;
  deposit: number;
  depositPaid: boolean;
  serviceFeePerPerson: number;
  electricityPrice: number;
  waterPrice: number;
  status: string;
  leader: { _id: string; fullName: string; phone: string } | null;
  tenants: Tenant[];
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Tenant assignment
  const [addTenantOpen, setAddTenantOpen] = useState(false);
  const [unassignedTenants, setUnassignedTenants] = useState<UnassignedTenant[]>([]);
  const [loadingUnassigned, setLoadingUnassigned] = useState(false);

  // Utilities
  const [roomUtilities, setRoomUtilities] = useState<Utility[]>([]);
  const [loadingUtilities, setLoadingUtilities] = useState(false);
  const [utilFormOpen, setUtilFormOpen] = useState(false);
  const [savingUtil, setSavingUtil] = useState(false);
  const [utilMonth, setUtilMonth] = useState(String(new Date().getMonth() + 1));
  const [utilYear, setUtilYear] = useState(String(new Date().getFullYear()));
  const [elecEnd, setElecEnd] = useState("");
  const [waterEnd, setWaterEnd] = useState("");

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - 2 + i));

  const fetchRoom = useCallback(async () => {
    try {
      const res = await roomsAPI.getById(roomId);
      setRoom(res.data);
    } catch {
      toast.error("Không thể tải thông tin phòng");
      router.push("/dashboard/rooms");
    } finally {
      setLoading(false);
    }
  }, [roomId, router]);

  const fetchUtilities = useCallback(async () => {
    setLoadingUtilities(true);
    try {
      const res = await utilitiesAPI.getAll({ room: roomId });
      setRoomUtilities(res.data);
    } catch {
      setRoomUtilities([]);
    } finally {
      setLoadingUtilities(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
    fetchUtilities();
  }, [fetchRoom, fetchUtilities]);

  // === Tenant handlers ===
  const handleSetLeader = async (tenantId: string) => {
    try {
      const formData = new FormData();
      formData.append("isLeader", "true");
      await tenantsAPI.update(tenantId, formData);
      toast.success("Đã đặt trưởng phòng");
      fetchRoom();
    } catch {
      toast.error("Lỗi khi đặt trưởng phòng");
    }
  };

  const openAddTenant = async () => {
    setLoadingUnassigned(true);
    setAddTenantOpen(true);
    try {
      const res = await tenantsAPI.getAll({ unassigned: "true" });
      setUnassignedTenants(res.data);
    } catch {
      toast.error("Lỗi khi tải danh sách người chưa có phòng");
      setUnassignedTenants([]);
    } finally {
      setLoadingUnassigned(false);
    }
  };

  const handleAssignTenant = async (tenantId: string) => {
    try {
      await tenantsAPI.assignRoom(tenantId, roomId);
      toast.success("Đã thêm người vào phòng");
      setUnassignedTenants((prev) => prev.filter((t) => t._id !== tenantId));
      fetchRoom();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi khi thêm người vào phòng");
    }
  };

  const handleUnassignTenant = async (tenantId: string) => {
    try {
      await tenantsAPI.unassignRoom(tenantId);
      toast.success("Đã xóa người khỏi phòng");
      fetchRoom();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi khi xóa người khỏi phòng");
    }
  };

  const handleToggleDeposit = async () => {
    if (!room) return;
    try {
      await roomsAPI.update(roomId, { depositPaid: !room.depositPaid });
      setRoom({ ...room, depositPaid: !room.depositPaid });
      toast.success(room.depositPaid ? "Đã đánh dấu chưa cọc" : "Đã đánh dấu đã cọc tiền");
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái cọc");
    }
  };

  // === Utility handlers ===
  const openUtilForm = (util?: Utility) => {
    if (util) {
      setUtilMonth(String(util.month));
      setUtilYear(String(util.year));
      setElecEnd(String(util.electricityEnd));
      setWaterEnd(String(util.waterEnd));
    } else {
      setUtilMonth(String(new Date().getMonth() + 1));
      setUtilYear(String(new Date().getFullYear()));
      setElecEnd("");
      setWaterEnd("");
    }
    setUtilFormOpen(true);
  };

  const handleSaveUtil = async () => {
    setSavingUtil(true);
    try {
      await utilitiesAPI.createOrUpdate({
        room: roomId,
        month: parseInt(utilMonth),
        year: parseInt(utilYear),
        electricityEnd: Number(elecEnd) || 0,
        waterEnd: Number(waterEnd) || 0,
      });
      toast.success("Lưu chỉ số thành công");
      setUtilFormOpen(false);
      fetchUtilities();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi khi lưu chỉ số");
    } finally {
      setSavingUtil(false);
    }
  };

  const handleFinalizeUtil = async (id: string) => {
    try {
      await utilitiesAPI.finalize(id);
      toast.success("Đã chốt điện nước!");
      fetchUtilities();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi khi chốt");
    }
  };

  const handleUnfinalizeUtil = async (id: string) => {
    try {
      await utilitiesAPI.unfinalize(id);
      toast.success("Đã bỏ chốt");
      fetchUtilities();
    } catch {
      toast.error("Lỗi khi bỏ chốt");
    }
  };

  const handleDeleteUtil = async (id: string) => {
    try {
      await utilitiesAPI.delete(id);
      toast.success("Đã xóa bản ghi");
      fetchUtilities();
    } catch {
      toast.error("Lỗi khi xóa");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12 text-gray-400">
        <DoorOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Không tìm thấy phòng</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/dashboard/rooms")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link
          href="/dashboard/rooms"
          className="hover:text-blue-600 transition-colors font-medium"
        >
          Quản lý phòng
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-semibold">Phòng {room.roomNumber}</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 text-gray-500 hover:text-gray-700"
            onClick={() => router.push("/dashboard/rooms")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Phòng {room.roomNumber}
              <Badge variant="outline" className={`${getStatusColor(room.status)} text-xs`}>
                {getStatusLabel(room.status)}
              </Badge>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Tầng {room.floor}</p>
          </div>
        </div>
      </div>

      {/* Room Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
            <Banknote className="w-3.5 h-3.5" />
            Tiền thuê / tháng
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(room.monthlyRent)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
            <Shield className="w-3.5 h-3.5" />
            Tiền cọc
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(room.deposit)}</p>
          <button
            onClick={handleToggleDeposit}
            className={`mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer
              ${room.depositPaid
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-red-50 text-red-500 hover:bg-red-100"
              }
            `}
          >
            {room.depositPaid ? (
              <><Check className="w-3 h-3" /> Đã cọc</>
            ) : (
              <><X className="w-3 h-3" /> Chưa cọc</>
            )}
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
            <Gauge className="w-3.5 h-3.5" />
            Phí DV / người
          </div>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(room.serviceFeePerPerson)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Đơn giá Điện / Nước
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            Điện: {formatCurrency(room.electricityPrice || 3000)} / kWh
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-1 leading-tight">
            Nước: {formatCurrency(room.waterPrice || 15000)} / m³
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
            <Users className="w-3.5 h-3.5" />
            Người ở
          </div>
          <p className="text-lg font-bold text-gray-900">{room.tenants?.length || 0}/{room.maxOccupants}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 text-xs mb-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            Trưởng phòng
          </div>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {room.leader?.fullName || <span className="text-gray-400 font-normal">Chưa chọn</span>}
          </p>
        </div>
      </div>

      {/* Tenants Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Danh sách người ở ({room.tenants?.length || 0}/{room.maxOccupants})
          </h2>
          {(room.tenants?.length || 0) < room.maxOccupants && (
            <Button
              size="sm"
              className="h-8 text-xs bg-blue-500 hover:bg-blue-600"
              onClick={openAddTenant}
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Thêm người vào phòng
            </Button>
          )}
        </div>
        <div className="p-4">
          {room.tenants && room.tenants.length > 0 ? (
            <div className="space-y-2">
              {room.tenants.map((tenant) => (
                <div
                  key={tenant._id}
                  className="flex items-center justify-between bg-gray-50 rounded-xl p-3.5 hover:bg-gray-100/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {tenant.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        {tenant.fullName}
                        {tenant.isLeader && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100">
                            <Crown className="w-2.5 h-2.5 mr-0.5" /> Trưởng phòng
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{tenant.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!tenant.isLeader && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-amber-600 border-amber-200 hover:bg-amber-50 h-7 px-2.5"
                        onClick={() => handleSetLeader(tenant._id)}
                      >
                        <Crown className="w-3 h-3 mr-1" /> Đặt trưởng phòng
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-red-500 border-red-200 hover:bg-red-50 h-7 px-2.5"
                      onClick={() => handleUnassignTenant(tenant._id)}
                    >
                      <UserMinus className="w-3 h-3 mr-1" /> Xóa khỏi phòng
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Chưa có người ở trong phòng này</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 text-xs"
                onClick={openAddTenant}
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Thêm người vào phòng
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Utility Section - Full management */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Điện nước theo tháng
          </h2>
          <Button
            size="sm"
            className="h-8 text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            onClick={() => openUtilForm()}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Nhập chỉ số
          </Button>
        </div>
        <div className="p-4">
          {loadingUtilities ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : roomUtilities.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50">
                    <TableHead className="text-xs font-semibold">Tháng</TableHead>
                    <TableHead className="text-xs font-semibold text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" /> Chỉ số điện (kWh)
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-500" /> Chỉ số nước (m³)
                      </div>
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-center">Trạng thái</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomUtilities
                    .sort((a, b) => (b.year - a.year) || (b.month - a.month))
                    .map((util) => {
                      return (
                        <TableRow key={util._id} className="hover:bg-gray-50/50">
                          <TableCell className="text-sm font-medium">
                            T{util.month}/{util.year}
                          </TableCell>
                          <TableCell className="text-sm text-center">{util.electricityEnd}</TableCell>
                          <TableCell className="text-sm text-center">{util.waterEnd}</TableCell>
                          <TableCell className="text-center">
                            {util.isFinalized ? (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                                ✓ Đã chốt
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
                                Chưa chốt
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {!util.isFinalized ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                                    onClick={() => openUtilForm(util)}
                                    title="Sửa chỉ số"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs bg-emerald-500 hover:bg-emerald-600"
                                    onClick={() => handleFinalizeUtil(util._id)}
                                  >
                                    <Check className="w-3 h-3 mr-1" /> Chốt
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                  onClick={() => handleUnfinalizeUtil(util._id)}
                                >
                                  <Undo2 className="w-3 h-3 mr-1" /> Bỏ chốt
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
                                onClick={() => handleDeleteUtil(util._id)}
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Zap className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Chưa có dữ liệu điện nước cho phòng này</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 text-xs"
                onClick={() => openUtilForm()}
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Nhập chỉ số đầu tiên
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Tenant Dialog */}
      <Dialog open={addTenantOpen} onOpenChange={setAddTenantOpen}>
        <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Thêm người vào phòng {room.roomNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {loadingUnassigned ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full" />
              </div>
            ) : unassignedTenants.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 mb-3">
                  Chọn người chưa có phòng để thêm vào:
                </p>
                {unassignedTenants.map((tenant) => (
                  <div
                    key={tenant._id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                        {tenant.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tenant.fullName}</p>
                        <p className="text-xs text-gray-500">{tenant.phone}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-blue-500 hover:bg-blue-600"
                      onClick={() => handleAssignTenant(tenant._id)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" /> Thêm
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-gray-400">
                  Không có người nào chưa có phòng
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Hãy thêm người ở mới tại trang &quot;Người ở&quot; trước
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Utility Input Dialog */}
      <Dialog open={utilFormOpen} onOpenChange={setUtilFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nhập chỉ số điện nước — Phòng {room.roomNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Month / Year */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tháng</Label>
                <Select value={utilMonth} onValueChange={setUtilMonth}>
                  <SelectTrigger className="mt-1">
                    <SelectValue>{`Tháng ${utilMonth}`}</SelectValue>
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
                <Label className="text-xs">Năm</Label>
                <Select value={utilYear} onValueChange={setUtilYear}>
                  <SelectTrigger className="mt-1">
                    <SelectValue>{`Năm ${utilYear}`}</SelectValue>
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

            {/* Electricity */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Chỉ số điện (kWh)</span>
              </div>
              <Input
                type="number"
                value={elecEnd}
                onChange={(e) => setElecEnd(e.target.value)}
                placeholder="VD: 1050"
                className="mt-1"
              />
            </div>

            {/* Water */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Chỉ số nước (m³)</span>
              </div>
              <Input
                type="number"
                value={waterEnd}
                onChange={(e) => setWaterEnd(e.target.value)}
                placeholder="VD: 45"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUtilFormOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveUtil} disabled={savingUtil}>
              {savingUtil ? "Đang lưu..." : "Lưu chỉ số"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
