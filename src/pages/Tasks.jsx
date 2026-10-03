import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  User, 
  Zap, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Filter
} from 'lucide-react';
import './Tasks.css';

export default function Tasks() {
  const { tasks, moveTask, addTask } = useApp();
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [club, setClub] = useState('Robotics & Tech');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('2026-10-14');
  const [assignee, setAssignee] = useState('Alex Johnson');
  const [xp, setXp] = useState(100);

  const columns = ['To Do', 'In Progress', 'Review', 'Completed'];

  const getPriorityBadge = (p) => {
    switch(p) {
      case 'High': return <span className="priority-badge high">High Priority</span>;
      case 'Medium': return <span className="priority-badge medium">Medium</span>;
      default: return <span className="priority-badge low">Low</span>;
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      club,
      priority,
      dueDate,
      assignee,
      xp: Number(xp)
    });

    setShowModal(false);
    setTitle('');
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header glass-panel">
        <div>
          <h2 className="page-heading flex items-center gap-2">
            <CheckSquare className="text-accent" size={24} /> Club Task Management Kanban
          </h2>
          <p className="page-subtext">Track assignments, collaborate with members, and earn XP points upon completion.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="kanban-board">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col);
          return (
            <div key={col} className="kanban-column glass-panel">
              <div className="column-header">
                <span className="column-title">{col}</span>
                <span className="column-count">{colTasks.length}</span>
              </div>

              <div className="column-tasks-list">
                {colTasks.length === 0 ? (
                  <div className="empty-col">No tasks in {col}</div>
                ) : (
                  colTasks.map(task => (
                    <div key={task.id} className="task-card">
                      <div className="flex justify-between items-start mb-2">
                        {getPriorityBadge(task.priority)}
                        <span className="task-xp"><Zap size={12}/> +{task.xp} XP</span>
                      </div>

                      <h4 className="task-title">{task.title}</h4>
                      
                      <div className="task-meta">
                        <span className="meta-tag"><User size={12}/> {task.assignee}</span>
                        <span className="meta-tag"><Clock size={12}/> {task.dueDate}</span>
                      </div>

                      <div className="task-footer">
                        <span className="club-tag">{task.club}</span>
                        
                        <div className="task-actions">
                          {col !== 'Completed' && (
                            <button 
                              className="move-btn"
                              title="Move to Next Stage"
                              onClick={() => {
                                const nextCol = columns[columns.indexOf(col) + 1];
                                moveTask(task.id, nextCol);
                              }}
                            >
                              <ArrowRight size={14} />
                            </button>
                          )}
                          {col === 'Completed' && (
                            <CheckCircle2 size={16} className="text-success" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign New Task</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleCreateTask} className="modal-form">
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Draft Budget Proposal for Q4"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assigned Club</label>
                  <select value={club} onChange={e => setClub(e.target.value)}>
                    <option>Robotics & Tech</option>
                    <option>AI Research Group</option>
                    <option>Debate Society</option>
                    <option>Design Guild</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority Level</label>
                  <select value={priority} onChange={e => setPriority(e.target.value)}>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assignee Name</label>
                  <input type="text" value={assignee} onChange={e => setAssignee(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>XP Reward Value</label>
                <input type="number" value={xp} onChange={e => setXp(e.target.value)} required />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
