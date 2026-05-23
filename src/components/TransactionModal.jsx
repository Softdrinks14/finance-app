import { useState, useEffect } from 'react'

export default function TransactionModal({ isOpen, onClose, onSubmit, editData }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    category: '',
    description: '',
    amount: ''
  })

  useEffect(() => {
    if (editData) setFormData(editData)
    else setFormData({ date: new Date().toISOString().split('T')[0], type: 'income', category: '', description: '', amount: '' })
  }, [editData, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...formData, amount: Number(formData.amount) })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{ marginBottom: '1.5rem' }}>{editData ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Tanggal</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="form-control" />
            </div>
            <div className="form-group">
              <label>Jenis</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="form-control">
                <option value="income">Pemasukan</option>
                <option value="outcome">Pengeluaran</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Kategori</label>
            <input type="text" required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="form-control" placeholder="Contoh: Gaji, Makanan, dll" />
          </div>
          <div className="form-group">
            <label>Deskripsi</label>
            <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="form-control" placeholder="Catatan opsional" />
          </div>
          <div className="form-group">
            <label>Nominal (Rp)</label>
            <input type="number" required min="1" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="form-control" placeholder="0" />
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">Batal</button>
            <button type="submit" className="btn btn-primary">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  )
}