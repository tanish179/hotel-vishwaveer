'use client';

import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Plus,
  Wrench,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  X,
  Calendar,
} from 'lucide-react';
import { PhysicalRoom, RoomStatus, RoomType } from '@/lib/types';
import { formatINR } from '@/lib/pricing';

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<PhysicalRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  // Add room modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomTypeId, setNewRoomTypeId] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [newNotes, setNewNotes] = useState('');

  // Maintenance block modal
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
        setRoomTypes(data.roomTypes);
        if (data.roomTypes.length > 0 && !newRoomTypeId) {
          setNewRoomTypeId(data.roomTypes[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (roomId: string, newStatus: RoomStatus) => {
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, updates: { status: newStatus } }),
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: newRoomNumber,
          roomTypeId: newRoomTypeId,
          floor: newFloor,
          notes: newNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddModalOpen(false);
        setNewRoomNumber('');
        setNewNotes('');
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'block',
          roomId: selectedRoomId,
          startDate: blockStartDate,
          endDate: blockEndDate,
          reason: blockReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBlockModalOpen(false);
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-hotel-muted font-bold block mb-1">
            Physical Asset Inventory
          </span>
          <h1 className="font-serif text-3xl font-medium text-hotel-charcoal">
            Room Inventory & Blocks
          </h1>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hotel-cypress hover:bg-hotel-cypress-dark text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-subtle"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Physical Room</span>
        </button>
      </div>

      {/* Room Categories Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {roomTypes.map((rt) => {
          const categoryRooms = rooms.filter((r) => r.room_type_id === rt.id);
          const availableCount = categoryRooms.filter((r) => r.status === 'available').length;
          return (
            <div key={rt.id} className="doppelrand-shell">
              <div className="doppelrand-core p-6 bg-white space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-hotel-muted font-bold block">
                  Category
                </span>
                <h3 className="font-serif text-xl font-medium text-hotel-charcoal">
                  {rt.name}
                </h3>
                <span className="font-serif text-lg font-bold text-hotel-cypress block">
                  {formatINR(rt.base_price_paise)} / night
                </span>
                <div className="pt-2 border-t border-hotel-charcoal/10 flex justify-between text-xs text-hotel-muted">
                  <span>Total: {categoryRooms.length} rooms</span>
                  <span className="font-semibold text-hotel-charcoal">
                    {availableCount} Available
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Physical Rooms Grid */}
      <div className="doppelrand-shell">
        <div className="doppelrand-core p-6 md:p-8 bg-white space-y-6">
          <h3 className="font-serif text-2xl font-medium text-hotel-charcoal">
            All 10 Physical Units
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => {
              const rType = roomTypes.find((t) => t.id === room.room_type_id);
              return (
                <div
                  key={room.id}
                  className="p-6 rounded-2xl border border-hotel-charcoal/10 bg-hotel-sand/20 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-hotel-muted block">
                        Floor {room.floor}
                      </span>
                      <h4 className="font-serif text-2xl font-bold text-hotel-charcoal">
                        Room {room.room_number}
                      </h4>
                    </div>

                    {/* Status Pill */}
                    <select
                      value={room.status}
                      onChange={(e) =>
                        handleStatusChange(room.id, e.target.value as RoomStatus)
                      }
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none ${
                        room.status === 'available'
                          ? 'bg-hotel-cypress/10 border-hotel-cypress/30 text-hotel-cypress'
                          : room.status === 'maintenance'
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : room.status === 'cleaning'
                          ? 'bg-blue-100 border-blue-300 text-blue-800'
                          : 'bg-red-100 border-red-300 text-red-800'
                      }`}
                    >
                      <option value="available">Available</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>

                  <div className="text-xs text-hotel-muted space-y-1">
                    <p>
                      <strong>Category:</strong> {rType?.name}
                    </p>
                    <p>
                      <strong>Tariff:</strong> {formatINR(rType?.base_price_paise || 0)}
                    </p>
                    {room.notes && <p className="italic text-[11px] pt-1">{room.notes}</p>}
                  </div>

                  <div className="pt-3 border-t border-hotel-charcoal/10 flex justify-between items-center text-xs">
                    <button
                      onClick={() => {
                        setSelectedRoomId(room.id);
                        setBlockModalOpen(true);
                      }}
                      className="text-hotel-cypress hover:underline flex items-center gap-1 font-medium"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Schedule Maintenance</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ADD ROOM MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-hotel-charcoal/10">
              <h3 className="font-serif text-2xl font-medium text-hotel-charcoal">
                Add Physical Room
              </h3>
              <button onClick={() => setAddModalOpen(false)}>
                <X className="w-5 h-5 text-hotel-charcoal" />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                  Room / Villa Number *
                </label>
                <input
                  type="text"
                  required
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  placeholder="e.g. 104, 303, Villa 3"
                  className="w-full p-2.5 rounded-lg border bg-hotel-limestone"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                  Room Category *
                </label>
                <select
                  value={newRoomTypeId}
                  onChange={(e) => setNewRoomTypeId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border bg-hotel-limestone"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.id}>
                      {rt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                  Floor
                </label>
                <input
                  type="number"
                  value={newFloor}
                  onChange={(e) => setNewFloor(parseInt(e.target.value, 10))}
                  min={1}
                  max={5}
                  className="w-full p-2 rounded-lg border bg-hotel-limestone"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Garden orientation, proximity to spa, etc."
                  className="w-full p-2 rounded-lg border bg-hotel-limestone resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 text-hotel-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-hotel-cypress text-white rounded-xl uppercase font-semibold text-xs"
                >
                  Create Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE BLOCK MODAL */}
      {blockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-hotel-charcoal/10">
              <h3 className="font-serif text-2xl font-medium text-hotel-charcoal">
                Block Room for Maintenance
              </h3>
              <button onClick={() => setBlockModalOpen(false)}>
                <X className="w-5 h-5 text-hotel-charcoal" />
              </button>
            </div>

            <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={blockStartDate}
                    onChange={(e) => setBlockStartDate(e.target.value)}
                    className="w-full p-2 rounded border bg-hotel-limestone"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={blockEndDate}
                    onChange={(e) => setBlockEndDate(e.target.value)}
                    className="w-full p-2 rounded border bg-hotel-limestone"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-hotel-muted block mb-1">
                  Reason for Block *
                </label>
                <input
                  type="text"
                  required
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Annual teak polishing, AC overhaul"
                  className="w-full p-2.5 rounded border bg-hotel-limestone"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBlockModalOpen(false)}
                  className="px-4 py-2 text-hotel-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-700 text-white rounded-xl uppercase font-semibold text-xs"
                >
                  Apply Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
