import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function TransactionForm({ user, currentEdit, setCurrentEdit }) {
  const [formData, setFormData] = useState({
    date: '', type: 'Outcome', category: '', description: '', amount: ''
  });

  useEffect(() => {
    if (currentEdit) setFormData(currentEdit);
    else setFormData({ date: '', type: 'Outcome', category: '', description: '', amount: '' });
  }, [currentEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.category || !formData.amount) {
      return toast.error("Lengkapi semua data!");
    }

    try {
      const payload = {
        uid: user.uid,
        ...formData,
        amount: Number(formData.amount),
        timestamp: currentEdit ? currentEdit.timestamp : serverTimestamp()
      };

      if (currentEdit) {
        await updateDoc(doc(db, "transactions", currentEdit.id), payload);
        toast.success("Transaksi diupdate!");
        setCurrentEdit(null);
      } else {
        await addDoc(collection(db, "transactions"), payload);
        toast.success("Transaksi ditambahkan!");
      }
      setFormData({ date: '', type: 'Outcome', category: '', description: '', amount: '' });
    } catch (error) {
      toast.error("Gagal memproses data: " + error.message);
    }
  };

  return (
    <div className="section-card">
      <h3>{currentEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tanggal</label>
          <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Jenis</label>
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
            <option value="Income">Income (Pemasukan)</option>
            <option value="Outcome">Outcome (Pengeluaran)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Kategori</label>
          <input type="text" placeholder="Gaji, Makanan, Transport..." value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Deskripsi</label>
          <input type="text" placeholder="Keterangan transaksi" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Nominal (Rp)</label>
          <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
        </div>
        <button type="submit" className="btn-primary" style={{ background: currentEdit ? '#28a745' : '#0056b3' }}>
          {currentEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
        </button>
        {currentEdit && (
          <button type="button" onClick={() => setCurrentEdit(null)} className="btn-primary" style={{ background: '#6c757d', marginTop: '0.5rem' }}>Batal Edit</button>
        )}
      </form>
    </div>
  );
}