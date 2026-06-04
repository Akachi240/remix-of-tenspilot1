import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getPainLogs, PainLog } from '../../lib/pain';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

export const PainHistory = () => {
  const { user } = useAuth();
  const [painLogs, setPainLogs] = useState<PainLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPainLogs = async () => {
      if (!user) return;
      setLoading(true);
      const logs = await getPainLogs(user.uid);
      setPainLogs(logs);
      setLoading(false);
    };
    loadPainLogs();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pain History</CardTitle>
      </CardHeader>
      <CardContent>
        {painLogs.length === 0 ? (
          <p className="text-sm text-gray-500">No pain logs yet. Start tracking your pain!</p>
        ) : (
          <div className="space-y-3">
            {painLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg text-gray-900">
                      Pain Level: {log.painLevel}/10
                    </p>
                    <p className="text-sm text-gray-600">Location: {log.location}</p>
                    {log.notes && <p className="text-sm text-gray-600">Notes: {log.notes}</p>}
                  </div>
                  <p className="text-xs text-gray-400">
                    {log.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
