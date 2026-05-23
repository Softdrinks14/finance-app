import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Wallet, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TransactionForm from '../components/TransactionForm';

export default function Dashboard({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentEdit, setCurrentEdit] = useState(null);
  
  // Filter state (Default: Bulan & Tahun ini)
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const q = query(
      collection(db, "transactions"), 
      where("uid", "==", user.uid),
      orderBy("date", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Filter logika berjalan tiap data/filter berubah
  useEffect(() => {
    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      return (tDate.getMonth() + 1) === Number(month) && tDate.getFullYear() === Number(year);
    });
    setFilteredData(filtered);
  }, [transactions, month, year]);

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus transaksi ini?")) {
      await deleteDoc(doc(db, "transactions", id));
      toast.success("Transaksi dihapus");
    }
  };

  // Kalkulasi
  const totalIncome = filteredData.filter(t => t.type === 'Income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutcome = filteredData.filter(t => t.type === 'Outcome').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalOutcome;

  const chartData = [
    { name: 'Ringkasan', Income: totalIncome, Outcome: totalOutcome }
  ];

  return (
    <div>
      <nav className="dashboard-navbar">
        <h1>FinManage</h1>
        <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
          <span>{user.email}</span>
          <button className="btn-logout" onClick={() => signOut(auth)}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Filter Section */}
        <div className="filters">
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>Bulan {i+1}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {[2026, 2027, 2028, 2029].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="card">
            <div className="card-icon income"><TrendingUp size={28} /></div>
            <div className="card-info">
              <h3>Total Income</h3>
              <p>Rp {totalIncome.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-icon outcome"><TrendingDown size={28} /></div>
            <div className="card-info">
              <h3>Total Outcome</h3>
              <p>Rp {totalOutcome.toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-icon balance"><Wallet size={28} /></div>
            <div className="card-info">
              <h3>Saldo Akhir</h3>
              <p style={{color: balance < 0 ? '#dc3545' : '#333'}}>Rp {balance.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Main Grid: Form & Table/Chart */}
        <div className="main-grid">
          <div>
            <TransactionForm user={user} currentEdit={currentEdit} setCurrentEdit={setCurrentEdit} />
            
            {/* Chart Widget di bawah Form */}
            <div className="section-card" style={{ marginTop: '2rem', height: '350px', width: '100%', overflowX: 'hidden' }}>
              <h3 style={{marginBottom:'1rem'}}>Grafik Bulanan</h3>
              
              <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={chartData} 
                    /* Margin left dikembalikan ke 0 agar tidak memotong layar kiri */
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    {/* YAxis diberi width 60px dan diformat agar angkanya disingkat (K untuk Ribu, M untuk Juta) */}
                    <YAxis 
                      width={60} 
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${value / 1000000}M`;
                        if (value >= 1000) return `${value / 1000}K`;
                        return value;
                      }}
                      style={{ fontSize: '0.8rem' }}
                    />
                    <Tooltip formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="Income" fill="#28a745" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    <Bar dataKey="Outcome" fill="#dc3545" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h3>Daftar Transaksi</h3>
            {filteredData.length === 0 ? (
              <p style={{color: '#888', textAlign: 'center', padding: '2rem 0'}}>Tidak ada transaksi di bulan ini.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Kategori</th>
                    <th>Keterangan</th>
                    <th>Tipe</th>
                    <th>Nominal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(t => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.category}</td>
                      <td>{t.description}</td>
                      <td>
                        <span className={`badge ${t.type.toLowerCase()}`}>{t.type}</span>
                      </td>
                      <td style={{fontWeight: '600'}}>Rp {t.amount.toLocaleString('id-ID')}</td>
                      <td>
                        <div className="action-btns">
                          <button onClick={() => setCurrentEdit(t)} className="btn-icon edit"><Edit size={18}/></button>
                          <button onClick={() => handleDelete(t.id)} className="btn-icon delete"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}