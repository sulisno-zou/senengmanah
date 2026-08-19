import React from 'react';
import { X, CheckCircle2, XCircle, KeyRound, User, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { ProfileUpdateRequest, UserAccount } from '../types';

interface ProfileUpdateRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: ProfileUpdateRequest[];
  currentUser: UserAccount;
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason?: string) => void;
}

export const ProfileUpdateRequestsModal: React.FC<ProfileUpdateRequestsModalProps> = ({
  isOpen,
  onClose,
  requests,
  currentUser,
  onApproveRequest,
  onRejectRequest,
}) => {
  if (!isOpen) return null;

  const pendingRequests = requests.filter((r) => r.status === 'MENUNGGU_VERIFIKASI');
  const pastRequests = requests.filter((r) => r.status !== 'MENUNGGU_VERIFIKASI');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-6 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-pink-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Persetujuan Ganti Akun & Password Atlet</h3>
              <p className="text-xs text-slate-400">Verifikasi permintaan perubahan kredensial mandiri atlet</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition border border-slate-700/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Pending Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Menunggu Persetujuan ({pendingRequests.length})</span>
              </h4>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="font-bold text-slate-300">Tidak ada pengajuan yang tertunda</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Semua permohonan telah diproses oleh admin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{req.athleteName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          @{req.currentUsername}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                        {req.newUsername && (
                          <p>
                            <span className="text-slate-400">Username Baru:</span>{' '}
                            <span className="font-bold text-pink-400 font-mono">@{req.newUsername}</span>
                          </p>
                        )}
                        {req.newPassword && (
                          <p>
                            <span className="text-slate-400">Password Baru:</span>{' '}
                            <span className="font-bold text-emerald-400 font-mono">{req.newPassword}</span>
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 col-span-full">
                          Diajukan pada: {new Date(req.requestedAt).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => onRejectRequest(req.id, 'Ditolak oleh admin')}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Tolak</span>
                      </button>

                      <button
                        onClick={() => onApproveRequest(req.id)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-extrabold shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Setujui & Terapkan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past History Section */}
          {pastRequests.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">
                Riwayat Pengajuan Sebelumnya ({pastRequests.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {pastRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-slate-200">{req.athleteName}</span>
                      <span className="text-slate-500 ml-2">(@{req.currentUsername})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        req.status === 'DISETUJUI'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {req.status === 'DISETUJUI' ? 'Disetujui' : 'Ditolak'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
