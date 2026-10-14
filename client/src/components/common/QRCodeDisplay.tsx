import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import api from '../../lib/api';

interface Props {
  memberId: string;
  memberName: string;
  onClose: () => void;
}

export default function QRCodeDisplay({ memberId, memberName, onClose }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/members/${memberId}/qr`)
      .then(r => setQrDataUrl(r.data.qrCode))
      .catch(() => setError('Could not load QR code'))
      .finally(() => setLoading(false));
  }, [memberId]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${memberName.replace(/\s+/g, '_')}_QR.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="card w-full max-w-xs animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-surface-border">
          <h3 className="text-white font-semibold text-sm">Member QR Code</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col items-center gap-4">
          {loading ? (
            <div className="skeleton w-48 h-48 rounded-lg" />
          ) : error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : (
            <>
              <div className="p-3 bg-white rounded-xl">
                <img src={qrDataUrl} alt="QR Code" className="w-44 h-44" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">{memberName}</p>
                <p className="text-gray-500 text-xs mt-0.5">Scan for gym check-in</p>
              </div>
              <button onClick={handleDownload} className="btn-secondary btn-sm w-full justify-center">
                <Download size={14} /> Download QR
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
