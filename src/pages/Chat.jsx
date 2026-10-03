import React, { useState } from 'react';
import { Send, Hash, Search, MoreVertical, Image as ImageIcon, Smile } from 'lucide-react';
import './Chat.css';

export default function Chat() {
  const [messages] = useState([
    { id: 1, sender: 'Admin User', time: '10:30 AM', text: 'Welcome to the Robotics Club chat!', isMine: true },
    { id: 2, sender: 'Sarah Connor', time: '10:32 AM', text: 'Thanks! When is the next meeting?', isMine: false },
    { id: 3, sender: 'John Smith', time: '10:35 AM', text: 'I think it is scheduled for next Tuesday in Lab 3.', isMine: false },
  ]);

  const channels = [
    { id: 'general', name: 'General', unread: 0 },
    { id: 'robotics', name: 'Robotics Club', unread: 3 },
    { id: 'drama', name: 'Drama Club', unread: 0 },
    { id: 'announcements', name: 'Announcements', unread: 1 },
  ];

  return (
    <div className="chat-container glass-panel">
      <div className="chat-sidebar">
        <div className="chat-search">
          <Search size={16} className="text-muted" />
          <input type="text" placeholder="Search channels..." />
        </div>
        
        <div className="channels-list">
          <h4 className="channels-title">CHANNELS</h4>
          {channels.map(channel => (
            <div key={channel.id} className={`channel-item ${channel.id === 'robotics' ? 'active' : ''}`}>
              <Hash size={16} className="text-muted" />
              <span className="channel-name">{channel.name}</span>
              {channel.unread > 0 && <span className="unread-badge">{channel.unread}</span>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-title">
            <Hash size={20} />
            <h3>Robotics Club</h3>
          </div>
          <button className="icon-btn"><MoreVertical size={20} /></button>
        </div>
        
        <div className="chat-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.isMine ? 'mine' : 'theirs'}`}>
              {!msg.isMine && <div className="message-avatar">{msg.sender[0]}</div>}
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">{msg.sender}</span>
                  <span className="message-time">{msg.time}</span>
                </div>
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="chat-input-area">
          <button className="input-action-btn"><ImageIcon size={20} /></button>
          <input type="text" placeholder="Type a message..." className="chat-input" />
          <button className="input-action-btn"><Smile size={20} /></button>
          <button className="send-btn"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
