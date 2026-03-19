import AppLayout from '@/components/layout/AppLayout';
import { ChevronRight, Heart, LogOut, MapPin, Package, Pencil, Plus, Settings, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  addDeliveryAddress,
  deleteDeliveryAddress,
  getDeliveryAddresses,
  getProfile,
  getSession,
  logout,
  updateDeliveryAddress,
  updateProfile,
  type DeliveryAddress,
} from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const colorOptions = ["Red", "Blue", "Green", "Black", "White", "Pink", "Orange", "Purple"];

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<{
    userName: string;
    email: string;
    whatsappNumber?: string;
    phoneNumber?: string;
    favoriteColors?: string[];
    location?: string;
    profilePhotoUrl?: string;
  } | null>(null);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWhatsappNumber, setEditWhatsappNumber] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editFavoriteColors, setEditFavoriteColors] = useState<string[]>([]);
  const [editProfilePhotoUrlPreview, setEditProfilePhotoUrlPreview] = useState<string | null>(null);
  const [editProfilePhotoChanged, setEditProfilePhotoChanged] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleFavoriteColor = (c: string, checked: boolean) => {
    setEditFavoriteColors((prev) => {
      const set = new Set(prev);
      if (checked) set.add(c);
      else set.delete(c);
      return Array.from(set);
    });
  };

  const onPickProfilePhoto = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setEditProfilePhotoUrlPreview(result);
        setEditProfilePhotoChanged(true);
      } else {
        toast.error("Failed to read image (mock)");
      }
    };
    reader.onerror = () => toast.error("Failed to read image (mock)");
    reader.readAsDataURL(file);
  };

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [addressForm, setAddressForm] = useState<{
    label: string;
    recipientName: string;
    mobile: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    pin: string;
    isDefault: boolean;
  }>({
    label: "",
    recipientName: "",
    mobile: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pin: "",
    isDefault: false,
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await getProfile();
        setProfile(res);
      } catch {
        toast.error("Failed to load profile (mock)");
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const s = await getSession();
        setIsAdmin(s.role === "ADMIN");
      } catch {
        // keep default false
      }
    })();
  }, []);

  const menuItems = [
    ...(isAdmin ? [{ icon: Package, label: "Admin Portal", href: "/admin/dashboard" }] : []),
    { icon: Package, label: "My Orders", href: "/my-orders" },
    { icon: Heart, label: "Wishlist", href: "/wishlist" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: LogOut, label: "Logout", href: null },
  ];

  useEffect(() => {
    void (async () => {
      try {
        const data = await getDeliveryAddresses();
        setAddresses(data);
      } catch {
        toast.error("Failed to load delivery addresses (mock)");
      }
    })();
  }, []);

  const onLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      toast.success("Logged out (mock)");
      navigate('/login');
    } catch {
      toast.error("Logout failed (mock)");
    } finally {
      setLoggingOut(false);
    }
  };

  const openEditProfile = () => {
    setEditName(profile?.userName ?? "");
    setEditEmail(profile?.email ?? "");
    setEditWhatsappNumber(profile?.whatsappNumber ?? "");
    setEditPhoneNumber(profile?.phoneNumber ?? "");
    setEditLocation(profile?.location ?? "");
    setEditFavoriteColors(profile?.favoriteColors ?? []);
    setEditProfilePhotoUrlPreview(profile?.profilePhotoUrl ?? null);
    setEditProfilePhotoChanged(false);
    setEditProfileOpen(true);
  };

  const onSaveProfile = async () => {
    if (!editName.trim()) return toast.error("Name is required");
    if (!editEmail.trim()) return toast.error("Email is required");
    if (!editWhatsappNumber.trim()) return toast.error("WhatsApp number is required");
    if (!editLocation.trim()) return toast.error("Location is required");

    const payload: Parameters<typeof updateProfile>[0] = {
      userName: editName.trim(),
      email: editEmail.trim(),
      whatsappNumber: editWhatsappNumber.trim(),
      phoneNumber: editPhoneNumber.trim() ? editPhoneNumber.trim() : undefined,
      location: editLocation.trim(),
      favoriteColors: editFavoriteColors,
    };

    if (editProfilePhotoChanged) {
      payload.profilePhotoUrl = editProfilePhotoUrlPreview ?? undefined;
    }
    try {
      const next = await updateProfile(payload);
      setProfile(next);
      setEditProfileOpen(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile (mock)");
    }
  };

  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: "Home",
      recipientName: profile?.userName ?? "",
      mobile: "9947428821",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pin: "",
      isDefault: addresses.length === 0,
    });
    setAddressDialogOpen(true);
  };

  const openEditAddress = (addr: DeliveryAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      recipientName: addr.recipientName,
      mobile: addr.mobile,
      line1: addr.line1,
      line2: addr.line2 ?? "",
      city: addr.city,
      state: addr.state,
      pin: addr.pin,
      isDefault: !!addr.isDefault,
    });
    setAddressDialogOpen(true);
  };

  const onSaveAddress = async () => {
    if (!addressForm.label.trim()) return toast.error("Label is required");
    if (!addressForm.recipientName.trim()) return toast.error("Recipient name is required");
    if (!addressForm.mobile.trim()) return toast.error("Mobile number is required");
    if (!addressForm.line1.trim()) return toast.error("Address line is required");
    if (!addressForm.city.trim()) return toast.error("City is required");
    if (!addressForm.state.trim()) return toast.error("State is required");
    if (!addressForm.pin.trim()) return toast.error("PIN is required");

    try {
      if (editingAddressId) {
        const res = await updateDeliveryAddress({
          id: editingAddressId,
          label: addressForm.label.trim(),
          recipientName: addressForm.recipientName.trim(),
          mobile: addressForm.mobile.trim(),
          line1: addressForm.line1.trim(),
          line2: addressForm.line2.trim() ? addressForm.line2.trim() : undefined,
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pin: addressForm.pin.trim(),
          isDefault: addressForm.isDefault,
        });
        setAddresses(res);
        toast.success("Address updated");
      } else {
        const res = await addDeliveryAddress({
          label: addressForm.label.trim(),
          recipientName: addressForm.recipientName.trim(),
          mobile: addressForm.mobile.trim(),
          line1: addressForm.line1.trim(),
          line2: addressForm.line2.trim() ? addressForm.line2.trim() : undefined,
          city: addressForm.city.trim(),
          state: addressForm.state.trim(),
          pin: addressForm.pin.trim(),
          isDefault: addressForm.isDefault,
        });
        setAddresses(res);
        toast.success("Address added");
      }

      setAddressDialogOpen(false);
    } catch {
      toast.error("Failed to save address (mock)");
    }
  };

  const onDeleteAddress = async (id: string) => {
    if (!window.confirm("Delete this delivery address?")) return;
    try {
      const res = await deleteDeliveryAddress(id);
      setAddresses(res);
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address (mock)");
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-xl mx-auto">
        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {profile?.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt={`${profile.userName ?? "User"} profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground">{profile?.userName ?? "Loading..."}</h1>
            <p className="text-sm text-muted-foreground">{profile?.email ?? ""}</p>
            <div className="mt-2 space-y-1">
              {profile?.whatsappNumber ? (
                <p className="text-xs text-muted-foreground">WhatsApp: {profile.whatsappNumber}</p>
              ) : null}
              {profile?.phoneNumber ? <p className="text-xs text-muted-foreground">Phone: {profile.phoneNumber}</p> : null}
              {profile?.location ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="truncate">{profile.location}</span>
                </p>
              ) : null}
            </div>
            {profile?.favoriteColors?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.favoriteColors.slice(0, 5).map((c) => (
                  <span key={c} className="text-[11px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.label === "Logout") {
                  setLogoutDialogOpen(true);
                  return;
                }
                if (item.href) navigate(item.href);
              }}
              className={`w-full flex items-center justify-between gap-3 p-4 hover:bg-secondary transition-colors duration-200 ${
                item.href && location.pathname === item.href ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon
                  className={`w-5 h-5 ${item.href && location.pathname === item.href ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={1.5}
                />
                <span className="text-sm font-medium text-foreground truncate">{item.label}</span>
              </div>
              {item.href ? <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} /> : null}
            </button>
          ))}
        </div>

        {/* Profile Edit */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">Profile</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email ?? ""}</p>
            </div>
            <Button className="rounded-xl font-bold h-11" onClick={openEditProfile}>
              <Pencil className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Edit Profile
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Update your name and email details for order & delivery communication.
          </div>
        </div>

        {/* Delivery Addresses */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" strokeWidth={1.5} />
                Delivery Addresses
              </p>
              <p className="text-xs text-muted-foreground">Add multiple delivery locations (mock)</p>
            </div>
            <Button className="rounded-xl font-bold h-11" onClick={openAddAddress}>
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Add
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-secondary/50 border border-border rounded-2xl p-4 text-muted-foreground text-sm text-center">
              No addresses yet.
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((a) => (
                <div key={a.id} className="bg-secondary/30 border border-border rounded-2xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">
                        {a.label}
                        {a.isDefault ? (
                          <span className="ml-2 text-[10px] font-bold bg-whatsapp/10 text-whatsapp px-2 py-1 rounded-full uppercase">
                            Default
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">{a.recipientName} • {a.mobile}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="rounded-xl h-9 font-bold" onClick={() => openEditAddress(a)}>
                        <Pencil className="w-4 h-4 mr-1" strokeWidth={1.5} />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl h-9 font-bold" onClick={() => void onDeleteAddress(a.id)}>
                        <Trash2 className="w-4 h-4 mr-1" strokeWidth={1.5} />
                        Delete
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}
                    <br />
                    {a.city}, {a.state} - {a.pin}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legal Policies */}
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3">
          <p className="text-sm font-bold text-foreground">Legal</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button asChild variant="outline" className="rounded-xl font-bold h-11">
              <Link to="/terms-of-use">Terms of Use</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl font-bold h-11">
              <Link to="/privacy-policy">Privacy Policy</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl font-bold h-11 sm:col-span-2">
              <Link to="/refund-policy">Refund Policy</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black">Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {editProfilePhotoUrlPreview ? (
                  <img src={editProfilePhotoUrlPreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-primary" strokeWidth={1.5} />
                )}
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold text-foreground">Profile Photo (Optional)</p>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-secondary file:text-foreground/80 hover:file:bg-secondary/70"
                  onChange={(e) => onPickProfilePhoto(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl font-bold"
                  disabled={editProfilePhotoUrlPreview == null && !editProfilePhotoChanged}
                  onClick={() => {
                    setEditProfilePhotoUrlPreview(null);
                    setEditProfilePhotoChanged(true);
                  }}
                >
                  Remove photo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Name</p>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Email</p>
              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">WhatsApp Number</p>
                <Input
                  value={editWhatsappNumber}
                  onChange={(e) => setEditWhatsappNumber(e.target.value)}
                  placeholder="e.g., 9XXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">Phone Number (Optional)</p>
                <Input
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  placeholder="e.g., 9XXXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Location (District in Kerala/City)</p>
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="e.g., Kochi / Ernakulam"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Favorite Colors (Optional)</p>
              <div className="grid grid-cols-2 gap-2">
                {colorOptions.map((c) => {
                  const checked = editFavoriteColors.includes(c);
                  return (
                    <label
                      key={c}
                      className={`flex items-center gap-2 p-2 rounded-xl border ${
                        checked ? "bg-primary/10 border-primary/20" : "bg-secondary/50 border-border"
                      }`}
                    >
                      <Checkbox checked={checked} onCheckedChange={(v) => toggleFavoriteColor(c, Boolean(v))} />
                      <span className="text-sm font-bold text-foreground">{c}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 rounded-xl font-bold" onClick={() => void onSaveProfile()}>
                Save
              </Button>
              <Button
                variant="outline"
                className="rounded-xl font-bold"
                onClick={() => {
                  setEditProfileOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black">{editingAddressId ? "Edit Address" : "Add Delivery Address"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-foreground">Set as default</p>
              <Switch checked={addressForm.isDefault} onCheckedChange={(v) => setAddressForm((s) => ({ ...s, isDefault: v }))} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Label</p>
              <Input value={addressForm.label} onChange={(e) => setAddressForm((s) => ({ ...s, label: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Recipient Name</p>
              <Input
                value={addressForm.recipientName}
                onChange={(e) => setAddressForm((s) => ({ ...s, recipientName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Mobile</p>
              <Input value={addressForm.mobile} onChange={(e) => setAddressForm((s) => ({ ...s, mobile: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Address Line 1</p>
              <Input value={addressForm.line1} onChange={(e) => setAddressForm((s) => ({ ...s, line1: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">Address Line 2 (optional)</p>
              <Input value={addressForm.line2} onChange={(e) => setAddressForm((s) => ({ ...s, line2: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">City</p>
                <Input value={addressForm.city} onChange={(e) => setAddressForm((s) => ({ ...s, city: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-foreground">State</p>
                <Input value={addressForm.state} onChange={(e) => setAddressForm((s) => ({ ...s, state: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-foreground">PIN</p>
              <Input value={addressForm.pin} onChange={(e) => setAddressForm((s) => ({ ...s, pin: e.target.value }))} />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 rounded-xl font-bold" onClick={() => void onSaveAddress()}>
                Save
              </Button>
              <Button variant="outline" className="rounded-xl font-bold" onClick={() => setAddressDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout confirmation dialog */}
      <Dialog
        open={logoutDialogOpen}
        onOpenChange={(open) => {
          setLogoutDialogOpen(open);
          if (!open) setLoggingOut(false);
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black">Logout?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to log out of your account?</p>

          <div className="flex gap-2 pt-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl font-bold"
              disabled={loggingOut}
              onClick={() => setLogoutDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl font-bold"
              disabled={loggingOut}
              onClick={() => void onLogout()}
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
