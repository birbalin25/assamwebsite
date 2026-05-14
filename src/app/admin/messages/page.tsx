'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Trash2, Mail, Clock, User } from 'lucide-react';
import { getAllContactMessages, deleteContactMessage, type ContactMessageWithId } from '@/lib/services/contactMessages';
import { toast } from 'sonner';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const data = await getAllContactMessages();
        setMessages(data);
      } catch {
        toast.error('Failed to load messages.');
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    setDeleting(id);
    try {
      await deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Message deleted.');
    } catch {
      toast.error('Failed to delete message.');
    } finally {
      setDeleting(null);
    }
  };

  const handleReply = (msg: ContactMessageWithId) => {
    const mailtoUrl = `mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`;
    window.open(mailtoUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-earth-800">
          Contact Messages
          {messages.length > 0 && (
            <span className="ml-2 text-base font-normal text-earth-500">({messages.length})</span>
          )}
        </h1>
      </div>

      {messages.length === 0 ? (
        <Card className="text-center py-12">
          <Mail className="h-12 w-12 text-earth-300 mx-auto mb-3" />
          <p className="text-earth-500">No contact messages yet.</p>
          <p className="text-earth-400 text-sm mt-1">Messages submitted via the Contact page will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card key={msg.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-earth-800">{msg.subject}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-earth-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> {msg.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {msg.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {msg.createdAt ? format(new Date(msg.createdAt.seconds * 1000), 'MMM d, yyyy h:mm a') : ''}
                    </span>
                  </div>
                  <p className="text-earth-600 text-sm mt-3 whitespace-pre-wrap">{msg.message}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => handleReply(msg)} title="Reply via email">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(msg.id)}
                    isLoading={deleting === msg.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title="Delete message"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
