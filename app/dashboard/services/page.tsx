"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Service = {
  id: string;
  barber_id: string;
  name: string;
  duration_min: number;
  price: number;
};

type Barber = {
  id: string;
  slug: string;
  name: string;
  email: string;
};

export default function ServicesPage() {
  const router = useRouter();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    duration_min: "",
    price: "",
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: barberData } = await supabase
        .from("barbers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (barberData) setBarber(barberData);

      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("barber_id", barberData?.id)
        .order("name", { ascending: true });

      if (servicesData) setServices(servicesData);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!barber) return;

    const serviceData = {
      barber_id: barber.id,
      name: formData.name,
      duration_min: parseInt(formData.duration_min),
      price: parseFloat(formData.price),
    };

    if (editingService) {
      await supabase
        .from("services")
        .update(serviceData)
        .eq("id", editingService.id);
    } else {
      await supabase.from("services").insert(serviceData);
    }

    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .eq("barber_id", barber.id)
      .order("name", { ascending: true });

    if (servicesData) setServices(servicesData);
    
    setShowForm(false);
    setEditingService(null);
    setFormData({ name: "", duration_min: "", price: "" });
  }

  async function handleDelete(id: string) {
    await supabase.from("services").delete().eq("id", id);
    
    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .eq("barber_id", barber?.id)
      .order("name", { ascending: true });

    if (servicesData) setServices(servicesData);
  }

  function handleEdit(service: Service) {
    setEditingService(service);
    setFormData({
      name: service.name,
      duration_min: service.duration_min.toString(),
      price: service.price.toString(),
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingService(null);
    setFormData({ name: "", duration_min: "", price: "" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-indigo-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(700px_400px_at_20%_110%,rgba(168,85,247,0.18),transparent_55%)]" aria-hidden="true" />

      <main className="relative mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
            <p className="mt-1 text-sm text-white/60">Manage your service offerings</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
          >
            Add Service
          </button>
        </div>

        {showForm && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold text-white/90">
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl bg-black/40 px-3 py-2.5 text-sm text-white ring-1 ring-white/10 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration_min}
                    onChange={(e) => setFormData({ ...formData, duration_min: e.target.value })}
                    className="w-full rounded-xl bg-black/40 px-3 py-2.5 text-sm text-white ring-1 ring-white/10 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-xl bg-black/40 px-3 py-2.5 text-sm text-white ring-1 ring-white/10 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
                >
                  {editingService ? "Update Service" : "Add Service"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 ring-1 ring-white/10 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-white/90">Your Services</h2>
          <div className="mt-4 space-y-3">
            {services.length === 0 ? (
              <p className="text-sm text-white/40">No services yet. Add your first service above.</p>
            ) : (
              services.map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-xl bg-black/40 px-4 py-3 ring-1 ring-white/10">
                  <div>
                    <div className="text-sm font-medium text-white">{service.name}</div>
                    <div className="text-xs text-white/50">{service.duration_min} min • ${service.price.toFixed(2)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="rounded-lg bg-indigo-600/20 px-3 py-1.5 text-xs font-medium text-indigo-300 ring-1 ring-indigo-400/30 hover:bg-indigo-600/30"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="rounded-lg bg-rose-600/20 px-3 py-1.5 text-xs font-medium text-rose-300 ring-1 ring-rose-400/30 hover:bg-rose-600/30"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
