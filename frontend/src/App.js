import { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

function App() {
  const [stats, setStats] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [hadiths, setHadiths] = useState([]);
  const [loggedIn, setLoggedIn] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({ title: '', type: 'ibadah', time: '', day: '', status: 'active' });
  const [quoteForm, setQuoteForm] = useState({ text: '', author: '' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [hadithForm, setHadithForm] = useState({ source: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setErrorMessage('');
      const [statsRes, schedulesRes, quotesRes, announcementsRes, hadithsRes] = await Promise.all([
        axios.get(`${API_URL}/statistics`),
        axios.get(`${API_URL}/schedules`),
        axios.get(`${API_URL}/quotes`),
        axios.get(`${API_URL}/announcements`),
        axios.get(`${API_URL}/hadiths`)
      ]);
      setStats(statsRes.data);
      setSchedules(schedulesRes.data);
      setQuotes(quotesRes.data);
      setAnnouncements(announcementsRes.data);
      setHadiths(hadithsRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setErrorMessage('Gagal terhubung ke server API. Pastikan backend berjalan di localhost:5000.');
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/schedules`, form);
      setForm({ title: '', type: 'ibadah', time: '', day: '', status: 'active' });
      fetchData();
    } catch (error) {
      console.error('Failed to save schedule', error);
      setErrorMessage('Jadwal gagal disimpan. Cek koneksi backend Anda.');
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/quotes`, quoteForm);
      setQuoteForm({ text: '', author: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to save quote', error);
      setErrorMessage('Quote gagal disimpan. Cek koneksi backend Anda.');
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/announcements`, announcementForm);
      setAnnouncementForm({ title: '', content: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to save announcement', error);
      setErrorMessage('Pengumuman gagal disimpan. Cek koneksi backend Anda.');
    }
  };

  const handleHadithSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/hadiths`, hadithForm);
      setHadithForm({ source: '', text: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to save hadith', error);
      setErrorMessage('Hadis gagal disimpan. Cek koneksi backend Anda.');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await axios.delete(`${API_URL}/schedules/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete schedule', error);
      setErrorMessage('Jadwal gagal dihapus. Cek koneksi backend Anda.');
    }
  };

  const chartData = (stats?.weeklyTrend || [70, 78, 82, 85, 88, 90, 92]).map((value, index) => ({
    name: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'][index],
    value
  }));

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2">Login Admin</h2>
          <p className="text-slate-500 mb-4">Masuk sebagai pengurus pondok</p>
          <input className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="Username" />
          <input className="w-full border rounded-lg px-3 py-2 mb-3" placeholder="Password" type="password" />
          <button onClick={() => setLoggedIn(true)} className="w-full bg-emerald-600 text-white py-2 rounded-lg">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-gradient-to-r from-emerald-700 to-blue-700 text-white rounded-2xl shadow p-6">
          <h1 className="text-3xl font-bold">Admin Web Panel - Santri Reminder NJ</h1>
          <p className="mt-2 text-emerald-100">Panel resmi pengurus pondok untuk mengelola jadwal, pengumuman, quote, dan hadis.</p>
        </header>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <section className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-sm text-slate-500">Santri Aktif</p>
            <h2 className="text-2xl font-bold mt-2">{stats?.activeStudents ?? 0}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-sm text-slate-500">Kedisiplinan Harian</p>
            <h2 className="text-2xl font-bold mt-2">{stats?.dailyDiscipline ?? 0}%</h2>
          </div>
          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-sm text-slate-500">Tingkat Penyelesaian</p>
            <h2 className="text-2xl font-bold mt-2">{stats?.taskCompletion ?? 0}%</h2>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Grafik Penyelesaian Jadwal</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Form Tambah Jadwal</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-3">
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Judul jadwal" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <select className="w-full border rounded-lg px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="ibadah">Ibadah</option>
                <option value="kuliah">Kuliah</option>
                <option value="pondok">Pondok</option>
              </select>
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Jam (contoh 04:30)" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Hari (contoh Senin)" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} required />
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg" type="submit">Simpan Jadwal</button>
            </form>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Daftar Jadwal</h3>
            <ul className="space-y-2">
              {schedules.map((item) => (
                <li key={item.id} className="border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p>{item.title} • {item.day} • {item.time}</p>
                    <p className="text-sm text-slate-500">{item.type}</p>
                  </div>
                  <button onClick={() => handleDeleteSchedule(item.id)} className="text-red-500 text-sm">Hapus</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Kelola Quote Islami</h3>
            <form onSubmit={handleQuoteSubmit} className="space-y-3">
              <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Teks quote" value={quoteForm.text} onChange={(e) => setQuoteForm({ ...quoteForm, text: e.target.value })} required />
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Penulis / sumber" value={quoteForm.author} onChange={(e) => setQuoteForm({ ...quoteForm, author: e.target.value })} required />
              <button className="w-full bg-emerald-600 text-white py-2 rounded-lg" type="submit">Simpan Quote</button>
            </form>
            <ul className="mt-4 space-y-2">
              {quotes.map((item) => (
                <li key={item.id} className="border rounded-lg p-3">
                  <p className="text-sm italic">“{item.text}”</p>
                  <p className="text-xs text-slate-500 mt-1">{item.author}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Pengumuman Pondok</h3>
            <form onSubmit={handleAnnouncementSubmit} className="space-y-3">
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Judul pengumuman" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} required />
              <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Isi pengumuman" value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} required />
              <button className="w-full bg-amber-600 text-white py-2 rounded-lg" type="submit">Publikasikan</button>
            </form>
            <ul className="mt-4 space-y-2">
              {announcements.map((item) => (
                <li key={item.id} className="border rounded-lg p-3">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.content}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Database Hadis</h3>
            <form onSubmit={handleHadithSubmit} className="space-y-3">
              <input className="w-full border rounded-lg px-3 py-2" placeholder="Sumber hadis" value={hadithForm.source} onChange={(e) => setHadithForm({ ...hadithForm, source: e.target.value })} required />
              <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Isi hadis" value={hadithForm.text} onChange={(e) => setHadithForm({ ...hadithForm, text: e.target.value })} required />
              <button className="w-full bg-violet-600 text-white py-2 rounded-lg" type="submit">Simpan Hadis</button>
            </form>
            <ul className="mt-4 space-y-2">
              {hadiths.map((item) => (
                <li key={item.id} className="border rounded-lg p-3">
                  <p className="text-sm italic">“{item.text}”</p>
                  <p className="text-xs text-slate-500 mt-1">{item.source}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
