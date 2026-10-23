import React, { useMemo, useState } from 'react';
import { Send, Hash, Search, MoreVertical, Image as ImageIcon, Smile } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Chat.css';

export default function Chat() {
  const { chatMessages, setChatMessages, clubs, user } = useApp();
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [draft, setDraft] = useState('');
  const channels = useMemo(() => [
    { id: 'general', name: 'General' },
    ...clubs.map(club => ({ id: String(club.id), name: club.name })),
  ], [clubs]);
  const activeChannel = channels.find(channel => channel.id === selectedChannel) ?? channels[0];
  const messages = chatMessages.filter(message => message.channelId === activeChannel?.id);

  const sendMessage = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeChannel) return;
    setChatMessages(previous => [...previous, {
      id: crypto.randomUUID(), channelId: activeChannel.id,
      sender: user.name, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text, isMine: true,
    }]);
    setDraft('');
  };

  return (
    <div className="chat-container glass-panel">
      <div className="chat-sidebar">
        <div className="chat-search"><Search size={16} className="text-muted" /><input type="text" placeholder="Search channels..." /></div>
        <div className="channels-list">
          <h4 className="channels-title">CHANNELS</h4>
          {channels.map(channel => (
            <button type="button" key={channel.id} onClick={() => setSelectedChannel(channel.id)} className={`channel-item ${channel.id === activeChannel?.id ? 'active' : ''}`}>
              <Hash size={16} className="text-muted" /><span className="channel-name">{channel.name}</span>
            </button>
          ))}
          {clubs.length === 0 && <p className="text-muted">Create a club before starting a club channel.</p>}
        </div>
      </div>
      <div className="chat-main">
        <div className="chat-header"><div className="chat-title"><Hash size={20} /><h3>{activeChannel?.name ?? 'Messages'}</h3></div><button className="icon-btn" aria-label="Channel options"><MoreVertical size={20} /></button></div>
        <div className="chat-messages">
          {messages.length === 0 ? <p className="text-muted">No messages in this channel yet.</p> : messages.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.isMine ? 'mine' : 'theirs'}`}>
              {!msg.isMine && <div className="message-avatar">{msg.sender[0]}</div>}
              <div className="message-content"><div className="message-header"><span className="message-sender">{msg.sender}</span><span className="message-time">{msg.time}</span></div><div className="message-bubble">{msg.text}</div></div>
            </div>
          ))}
        </div>
        <form className="chat-input-area" onSubmit={sendMessage}>
          <button type="button" className="input-action-btn" disabled aria-label="Image messages unavailable"><ImageIcon size={20} /></button>
          <input value={draft} onChange={event => setDraft(event.target.value)} type="text" placeholder="Type a message..." className="chat-input" disabled={!activeChannel} />
          <button type="button" className="input-action-btn" disabled aria-label="Emoji picker unavailable"><Smile size={20} /></button>
          <button type="submit" className="send-btn" disabled={!draft.trim()} aria-label="Send message"><Send size={18} /></button>
        </form>
      </div>
    </div>
  );
}
