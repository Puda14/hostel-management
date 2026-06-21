"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { tenantsAPI } from "@/lib/api";
import { formatDate, getUploadUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Crown, Upload, X, Eye } from "lucide-react";

interface Room {
  _id: string;
  roomNumber: string;
  floor: number;
}

interface Tenant {
  _id: string;
  fullName: string;
  phone: string;
  idCardFront: string | null;
  idCardBack: string | null;
  room: Room | null;
  isLeader: boolean;
  moveInDate: string;
  moveOutDate: string | null;
  active: boolean;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [imageViewOpen, setImageViewOpen] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state - only name, phone, CCCD
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [idCardFrontFile, setIdCardFrontFile] = useState<File | null>(null);
  const [idCardBackFile, setIdCardBackFile] = useState<File | null>(null);
  const [idCardFrontPreview, setIdCardFrontPreview] = useState<string>("");
  const [idCardBackPreview, setIdCardBackPreview] = useState<string>("");

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const tenantsRes = await tenantsAPI.getAll(search ? { search } : undefined);
      setTenants(tenantsRes.data);
    } catch {
      toast.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFullName("");
    setPhone("");
    setIdCardFrontFile(null);
    setIdCardBackFile(null);
    setIdCardFrontPreview("");
    setIdCardBackPreview("");
  };

  const openCreate = () => {
    resetForm();
    setEditing(false);
    setSelectedTenant(null);
    setFormOpen(true);
  };

  const openEdit = (tenant: Tenant) => {
    setFullName(tenant.fullName);
    setPhone(tenant.phone);
    setIdCardFrontFile(null);
    setIdCardBackFile(null);
    setIdCardFrontPreview(tenant.idCardFront ? getUploadUrl(tenant.idCardFront) : "");
    setIdCardBackPreview(tenant.idCardBack ? getUploadUrl(tenant.idCardBack) : "");
    setSelectedTenant(tenant);
    setEditing(true);
    setFormOpen(true);
  };

  const handleFileChange = (
    file: File | null,
    side: "front" | "back"
  ) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === "front") {
      setIdCardFrontFile(file);
      setIdCardFrontPreview(url);
    } else {
      setIdCardBackFile(file);
      setIdCardBackPreview(url);
    }
  };

  const handleSave = async () => {
    if (!fullName || !phone) {
      toast.error("Vui lòng điền đầy đủ họ tên và SĐT");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("phone", phone);
      if (idCardFrontFile) formData.append("idCardFront", idCardFrontFile);
      if (idCardBackFile) formData.append("idCardBack", idCardBackFile);

      if (editing && selectedTenant) {
        await tenantsAPI.update(selectedTenant._id, formData);
        toast.success("Cập nhật người ở thành công");
      } else {
        await tenantsAPI.create(formData);
        toast.success("Thêm người ở thành công");
      }

      setFormOpen(false);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi khi lưu thông tin");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTenant) return;
    try {
      await tenantsAPI.delete(selectedTenant._id);
      toast.success("Đã xóa người ở");
      setDeleteOpen(false);
      setSelectedTenant(null);
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const viewImage = (url: string) => {
    setViewImageUrl(url);
    setImageViewOpen(true);
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người ở</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tổng: {tenants.length} người
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm người ở
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm theo tên hoặc SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold">Họ và tên</TableHead>
                <TableHead className="font-semibold">SĐT</TableHead>
                <TableHead className="font-semibold">Phòng</TableHead>
                <TableHead className="font-semibold">CCCD</TableHead>
                <TableHead className="font-semibold">Ngày vào</TableHead>
                <TableHead className="font-semibold text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant._id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold flex-shrink-0">
                        {tenant.fullName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium flex items-center gap-1.5">
                          {tenant.fullName}
                          {tenant.isLeader && (
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{tenant.phone}</TableCell>
                  <TableCell>
                    {tenant.room ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        {tenant.room.roomNumber}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                        Chưa có phòng
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {tenant.idCardFront && (
                        <button
                          onClick={() => viewImage(getUploadUrl(tenant.idCardFront))}
                          className="w-8 h-8 rounded border border-gray-200 overflow-hidden hover:border-blue-400 transition-colors"
                        >
                          <img
                            src={getUploadUrl(tenant.idCardFront)}
                            alt="CCCD trước"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )}
                      {tenant.idCardBack && (
                        <button
                          onClick={() => viewImage(getUploadUrl(tenant.idCardBack))}
                          className="w-8 h-8 rounded border border-gray-200 overflow-hidden hover:border-blue-400 transition-colors"
                        >
                          <img
                            src={getUploadUrl(tenant.idCardBack)}
                            alt="CCCD sau"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      )}
                      {!tenant.idCardFront && !tenant.idCardBack && (
                        <span className="text-xs text-gray-400">Chưa có</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {formatDate(tenant.moveInDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                        onClick={() => openEdit(tenant)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                    Không tìm thấy người ở nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog - Only name, phone, CCCD */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Chỉnh sửa người ở" : "Thêm người ở mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Họ và tên *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="mt-1"
                />
              </div>
            </div>

            {/* ID Card Upload */}
            <div className="space-y-3">
              <Label>Ảnh CCCD</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Mặt trước</p>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, "front")}
                  />
                  {idCardFrontPreview ? (
                    <div className="relative group">
                      <img
                        src={idCardFrontPreview}
                        alt="CCCD mặt trước"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => viewImage(idCardFrontPreview)}
                          className="p-1.5 bg-white rounded-full"
                        >
                          <Eye className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIdCardFrontFile(null);
                            setIdCardFrontPreview("");
                          }}
                          className="p-1.5 bg-white rounded-full"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => frontInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">Chọn ảnh</span>
                    </button>
                  )}
                </div>

                {/* Back */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Mặt sau</p>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null, "back")}
                  />
                  {idCardBackPreview ? (
                    <div className="relative group">
                      <img
                        src={idCardBackPreview}
                        alt="CCCD mặt sau"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => viewImage(idCardBackPreview)}
                          className="p-1.5 bg-white rounded-full"
                        >
                          <Eye className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIdCardBackFile(null);
                            setIdCardBackPreview("");
                          }}
                          className="p-1.5 bg-white rounded-full"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => backInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs">Chọn ảnh</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer */}
      <Dialog open={imageViewOpen} onOpenChange={setImageViewOpen}>
        <DialogContent className="sm:max-w-2xl p-2">
          <img
            src={viewImageUrl}
            alt="CCCD"
            className="w-full rounded-lg"
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người ở</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa {selectedTenant?.fullName}? Người này sẽ
              được đánh dấu là đã chuyển đi.
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
