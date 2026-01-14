import React, { useState, useEffect } from 'react';

interface UserManagementProps {
  onClose: () => void;
}

interface UserInfo {
  username: string;
  password: string;
  createdAt?: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const [users, setUsers] = useState<UserInfo[]>([]);

  useEffect(() => {
    const usersRaw = localStorage.getItem('zenith_users');
    if (usersRaw) {
      const parsedUsers = JSON.parse(usersRaw);
      setUsers(parsedUsers.filter((u: UserInfo) => u.username !== 'admin'));
    }
  }, []);

  const getUserBalance = (username: string) => {
    const balance = localStorage.getItem(`zenith_balance_${username}`);
    return balance ? parseFloat(balance) : 0;
  };

  const getUserStatus = (username: string) => {
    const status = localStorage.getItem(`zenith_status_${username}`);
    return status === 'true';
  };

  const deleteUser = (username: string) => {
    if (!confirm(`Xóa người dùng ${username}?`)) return;
    
    const filtered = users.filter(u => u.username !== username);
    localStorage.setItem('zenith_users', JSON.stringify(filtered));
    setUsers(filtered);
    
    // Xóa dữ liệu liên quan
    localStorage.removeItem(`zenith_balance_${username}`);
    localStorage.removeItem(`zenith_status_${username}`);
    localStorage.removeItem(`zenith_history_${username}`);
    localStorage.removeItem(`zenith_last_upd_${username}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div className="bg-[#161b2c] border border-white/10 rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-indigo-600/20">
          <h2 className="text-2xl font-black text-white italic tracking-tight">👥 QUẢN LÝ NGƯỜI DÙNG</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 text-2xl">✕</button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh]">
          <div className="mb-6 p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-500 text-xs font-black uppercase">Tổng người dùng</p>
                <p className="text-3xl font-black text-white mt-2">{users.length}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-black uppercase">Đang hoạt động</p>
                <p className="text-3xl font-black text-green-500 mt-2">
                  {users.filter(u => getUserStatus(u.username)).length}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-black uppercase">Tổng số dư</p>
                <p className="text-3xl font-black text-white mt-2">
                  {users.reduce((sum, u) => sum + getUserBalance(u.username), 0).toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p className="text-xl font-bold">Chưa có người dùng nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => {
                const balance = getUserBalance(user.username);
                const isMining = getUserStatus(user.username);
                
                return (
                  <div key={user.username} className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-xl">{user.username[0].toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-black text-lg">@{user.username}</p>
                          <p className="text-slate-500 text-sm">
                            Số dư: <span className="text-indigo-400 font-bold">{balance.toLocaleString('vi-VN')}₫</span>
                            {' · '}
                            <span className={isMining ? 'text-green-500' : 'text-slate-600'}>
                              {isMining ? '🟢 Đang treo' : '⚫ Dừng'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteUser(user.username)}
                        className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 font-bold text-sm hover:bg-red-500/20 transition-all"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
