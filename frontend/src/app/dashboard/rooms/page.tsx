"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { roomsAPI } from "@/lib/api";
import { formatCurrency, getStatusLabel, getStatusColor, formatNumberWithDots, parseNumberFromDots } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Crown, DoorOpen } from "lucide-react";

interface Room {
  _id: string;
  roomNumber: string;
  floor: number;
  maxOccupants: number;
  monthlyRent: number;
  deposit: number;
  serviceFeePerPerson: number;
  status: string;
  leader: { _id: string; fullName: string; phone: string } | null;
  tenantCount: number;
  electricityPrice: number;
  waterPrice: number;
}

const defaultRoom = {
  roomNumber: "",
  floor: 1,
  maxOccupants: 4,
  monthlyRent: 2000000,
  deposit: 2000000,
  serviceFeePerPerson: 60000,
  electricityPrice: 3000,
  waterPrice: 15000,
  status: "available",
};

export default function RoomsPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState(defaultRoom);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await roomsAPI.getAll();
      setRooms(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const openCreate = () => {
    setFormData(defaultRoom);
    setEditing(false);
    setFormOpen(true);
  };

  const openEdit = (room: Room) => {
    setFormData({
      roomNumber: room.roomNumber,
      floor: room.floor,
      maxOccupants: room.maxOccupants,
      monthlyRent: room.monthlyRent,
      deposit: room.deposit,
      serviceFeePerPerson: room.serviceFeePerPerson,
      electricityPrice: room.electricityPrice || 3000,
      waterPrice: room.waterPrice || 15000,
      status: room.status,
    });
    setSelectedRoom(room);
    setEditing(true);
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.roomNumber) {
      toast.error("Vui lòng nhập số phòng");
      return;
    }
    setSaving(true);
    try {
      if (editing && selectedRoom) {
        await roomsAPI.update(selectedRoom._id, formData);
        toast.success("Cập nhật phòng thành công");
      } else {
        await roomsAPI.create(formData);
        toast.success("Thêm phòng thành công");
      }
      setFormOpen(false);
      fetchRooms();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi khi lưu phòng");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;
    try {
      await roomsAPI.delete(selectedRoom._id);
      toast.success("Xóa phòng thành công");
      setDeleteOpen(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi khi xóa phòng");
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tổng: {rooms.length} phòng
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm phòng
        </Button>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <Card
            key={room._id}
            className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => router.push(`/dashboard/rooms/${room._id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  Phòng {room.roomNumber}
                </h3>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(room.status)} text-xs`}
                >
                  {getStatusLabel(room.status)}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Tầng</span>
                  <span className="font-medium text-gray-900">{room.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Người ở</span>
                  <span className="font-medium text-gray-900">
                    {room.tenantCount}/{room.maxOccupants}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tiền thuê</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(room.monthlyRent)}
                  </span>
                </div>
              </div>

              {room.leader && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs text-gray-500">
                    Trưởng phòng: <span className="font-medium text-gray-700">{room.leader.fullName}</span>
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(room);
                  }}
                >
                  <Pencil className="w-3 h-3 mr-1" /> Sửa
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRoom(room);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <DoorOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có phòng nào</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Chỉnh sửa phòng" : "Thêm phòng mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roomNumber">Số phòng *</Label>
                <Input
                  id="roomNumber"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="VD: 101"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="floor">Tầng *</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxOccupants">Số người tối đa</Label>
                <Input
                  id="maxOccupants"
                  type="number"
                  value={formData.maxOccupants}
                  onChange={(e) => setFormData({ ...formData, maxOccupants: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue>{getStatusLabel(formData.status)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Trống</SelectItem>
                    <SelectItem value="occupied">Đang ở</SelectItem>
                    <SelectItem value="deposited">Đã cọc</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="monthlyRent">Tiền thuê / tháng (VNĐ)</Label>
              <Input
                id="monthlyRent"
                type="text"
                value={formatNumberWithDots(formData.monthlyRent)}
                onChange={(e) => setFormData({ ...formData, monthlyRent: parseNumberFromDots(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deposit">Tiền cọc (VNĐ)</Label>
                <Input
                  id="deposit"
                  type="text"
                  value={formatNumberWithDots(formData.deposit)}
                  onChange={(e) => setFormData({ ...formData, deposit: parseNumberFromDots(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="serviceFee">Phí DV / người (VNĐ)</Label>
                <Input
                  id="serviceFee"
                  type="text"
                  value={formatNumberWithDots(formData.serviceFeePerPerson)}
                  onChange={(e) => setFormData({ ...formData, serviceFeePerPerson: parseNumberFromDots(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="electricityPrice">Giá điện / kWh (VNĐ)</Label>
                <Input
                  id="electricityPrice"
                  type="text"
                  value={formatNumberWithDots(formData.electricityPrice)}
                  onChange={(e) => setFormData({ ...formData, electricityPrice: parseNumberFromDots(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="waterPrice">Giá nước / m³ (VNĐ)</Label>
                <Input
                  id="waterPrice"
                  type="text"
                  value={formatNumberWithDots(formData.waterPrice)}
                  onChange={(e) => setFormData({ ...formData, waterPrice: parseNumberFromDots(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm phòng"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa phòng {selectedRoom?.roomNumber}? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
