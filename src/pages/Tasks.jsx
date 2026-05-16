import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { CheckSquare, Plus, Filter, Search, MoreHorizontal, Clock, AlertTriangle, User, MessageSquare, Paperclip, Send, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import useWebSocket from '../hooks/useWebSocket';

const TaskCard = React.memo(({ task, onDragStart, onClick }) => {
  const getPriorityColor = (p) => {
    switch (p) {
      case 'urgent': return 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_8px_rgba(244,63,94,0.2)]';
      case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.2)]';
      case 'medium': return 'text-brand bg-brand/10 border-brand/20 shadow-[0_0_8px_rgba(51,102,255,0.2)]';
      default: return 'text-text-tertiary bg-white/5 border-white/10';
    }
  };

  return (
    <Card 
      variant="default"
      hover
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
      className="!p-4 cursor-grab active:cursor-grabbing group border-white/5 hover:border-brand/40"
    >
      <div className="flex items-start justify-between mb-4">
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <div className="flex -space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <Avatar user={task.assignee} size={24} className="ring-2 ring-[#0d1425]" />
        </div>
      </div>
      
      <h4 className="text-sm font-black text-white mb-2 leading-snug group-hover:text-brand transition-colors tracking-tight">{task.title}</h4>
      <p className="text-xs text-text-tertiary mb-5 line-clamp-2 leading-relaxed">{task.description || 'No description provided.'}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-4 text-text-tertiary">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter">
            <MessageSquare size={12} className="text-brand" />
            {task.comments?.length || 0}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter">
            <Paperclip size={12} className="text-brand" />
            {task.files?.length || 0}
          </div>
        </div>
        {task.due_date && (
          <div className="flex items-center gap-1.5 text-[10px] font-black text-text-tertiary uppercase tracking-widest opacity-60">
            <Clock size={12} />
            {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
    </Card>
  );
});

export default function Tasks() {
  const { activeWorkspace } = useStore();
  const [tasks, setTasks] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filterProject, setFilterProject] = React.useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [taskForm, setTaskForm] = React.useState({ 
    title: '', 
    description: '', 
    project: '', 
    priority: 'medium', 
    status: 'todo' 
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'gray' },
    { id: 'in_progress', title: 'In Progress', color: 'blue' },
    { id: 'review', title: 'Review', color: 'purple' },
    { id: 'done', title: 'Done', color: 'green' },
  ];

  React.useEffect(() => {
    if (activeWorkspace) {
      fetchInitialData();
    }
  }, [activeWorkspace]);

  useWebSocket(`/ws/tasks/${activeWorkspace?.id}/`, {
    enabled: !!activeWorkspace,
    onMessage: (data) => {
      if (data.action === 'created') {
        setTasks(prev => [...prev, data.task]);
      } else if (data.action === 'updated') {
        setTasks(prev => prev.map(t => t.id === data.task.id ? data.task : t));
      } else if (data.action === 'deleted') {
        setTasks(prev => prev.filter(t => t.id !== data.task_id));
      }
    }
  });

  const fetchInitialData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get(`/projects/?workspace=${activeWorkspace.id}`),
        api.get(`/tasks/?workspace=${activeWorkspace.id}`)
      ]);
      setProjects(projectsRes.data.data || projectsRes.data);
      setTasks(tasksRes.data.data || tasksRes.data);
      if (projectsRes.data.length > 0) {
        setTaskForm(prev => ({ ...prev, project: projectsRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch task data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.project) {
      toast.error('Please fill in title and project');
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post('/tasks/', taskForm);
      // tasks will be updated via WebSocket if backend broadcasts, 
      // but let's add locally just in case WS is slow
      setTasks(prev => [...prev, data.data || data]);
      setIsCreateModalOpen(false);
      setTaskForm({ ...taskForm, title: '', description: '' });
      toast.success('Task created! 📝');
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const [draggingTaskId, setDraggingTaskId] = React.useState(null);
  const [selectedTask, setSelectedTask] = React.useState(null);

  const filteredTasks = React.useMemo(() => {
    return filterProject === 'all' 
      ? tasks 
      : tasks.filter(t => t.project === parseInt(filterProject));
  }, [tasks, filterProject]);

  const onDragStart = React.useCallback((e, taskId) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
  }, []);

  const onDrop = React.useCallback(async (e, status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    try {
      await api.patch(`/tasks/${taskId}/`, { status });
      setTasks(prev => prev.map(t => t.id === parseInt(taskId) ? { ...t, status } : t));
      toast.success(`Task moved to ${status}`);
    } catch (err) {
      toast.error('Failed to move task');
    }
    setDraggingTaskId(null);
  }, []);

  const onDragOver = React.useCallback((e) => {
    e.preventDefault();
  }, []);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#0a0f1d]">
      {/* Kanban Header */}
      <div className="p-6 border-b border-gray-800 bg-[#0d1425]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="text-blue-500" />
              Task Board
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track project tasks for {activeWorkspace?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <select 
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none min-w-[180px]"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <Plus size={18} />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Content */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6 custom-scrollbar bg-[#0a0f1d] snap-x snap-mandatory">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex gap-4 md:gap-6 h-full min-w-max pb-6 px-2 md:px-0">
            {columns.map(col => (
              <div 
                key={col.id} 
                className="w-[85vw] md:w-80 flex flex-col shrink-0 snap-center md:snap-none"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col.id)}
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${col.color}-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]`}></span>
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">{col.title}</h3>
                    <span className="bg-gray-800 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-gray-700">
                      {filteredTasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-800"><MoreHorizontal size={16} /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar pb-10">
                  {filteredTasks.filter(t => t.status === col.id).map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onDragStart={onDragStart}
                      onClick={() => setSelectedTask(task)}
                    />
                  ))}
                  <button className="w-full py-2 border border-dashed border-gray-800 rounded-xl text-gray-600 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-xs font-bold flex items-center justify-center gap-2 group">
                    <Plus size={14} className="group-hover:scale-110 transition-transform" />
                    Add Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Modal Placeholder */}
      {selectedTask && (
        <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="New Task">
        <form onSubmit={handleCreateTask} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Task Title</label>
            <input 
              required
              type="text" 
              value={taskForm.title}
              onChange={e => setTaskForm({...taskForm, title: e.target.value})}
              placeholder="What needs to be done?"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Project</label>
              <select 
                value={taskForm.project}
                onChange={e => setTaskForm({...taskForm, project: e.target.value})}
                className="w-full bg-[#0b1429] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="">Select a Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Priority</label>
              <select 
                value={taskForm.priority}
                onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                className="w-full bg-[#0b1429] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Description</label>
            <textarea 
              value={taskForm.description}
              onChange={e => setTaskForm({...taskForm, description: e.target.value})}
              placeholder="Add details about this task..."
              rows={3}
              className="w-full bg-[#0b1429] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-brand/40 resize-none h-32" 
            />
          </div>
          <Button 
            disabled={creating || !taskForm.project || !taskForm.title}
            type="submit" 
            loading={creating}
            className="w-full py-3 md:py-4 text-base md:text-lg"
          >
            Create Task
          </Button>
        </form>
      </Modal>
    </div>
  );
}



function TaskModal({ task, onClose }) {
  return (
    <Modal isOpen={!!task} onClose={onClose} title={task.title} size="lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-3">Description</h4>
            <div className="bg-white/2 p-5 rounded-3xl border border-white/5 text-text-secondary leading-relaxed">
              {task.description || 'No detailed description provided for this task.'}
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-5">Activity & Comments</h4>
            <div className="space-y-5 mb-8">
              {task.comments?.map(comment => (
                <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                  <Avatar user={comment.user_obj || { username: comment.user }} size={36} />
                  <div className="bg-white/3 p-4 rounded-3xl rounded-tl-none border border-white/5 flex-1 shadow-sm">
                    <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
                    <p className="text-[10px] text-text-tertiary mt-2 font-bold opacity-60">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Add a comment..."
                className="flex-1 bg-[#0b1429] border border-white/5 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-brand/40"
              />
              <Button size="sm" variant="primary">
                <Send size={18} />
              </Button>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-5">Task Activity History</h4>
            <div className="space-y-4">
              {task.activities?.map(act => (
                <div key={act.id} className="flex items-center gap-4 text-[11px] animate-in fade-in duration-500">
                  <div className="w-2 h-2 rounded-full bg-brand shadow-[0_0_8px_rgba(51,102,255,0.5)]" />
                  <p className="text-text-secondary">
                    <span className="text-white font-black">{act.user_name}</span> {act.verb}
                  </p>
                  <span className="text-text-tertiary ml-auto font-bold opacity-50">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {(!task.activities || task.activities.length === 0) && (
                <p className="text-[10px] text-text-tertiary italic opacity-60">No activity recorded yet.</p>
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
            <h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-5">Attachments</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {task.files?.map(file => (
                <div key={file.id} className="flex items-center gap-4 p-4 bg-white/2 border border-white/5 rounded-3xl hover:border-brand/40 transition-all cursor-pointer group shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-tertiary group-hover:text-brand transition-colors">
                    <Paperclip size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white truncate">{file.filename}</p>
                    <p className="text-[9px] text-text-tertiary font-black uppercase tracking-tight">{file.uploaded_by_name}</p>
                  </div>
                </div>
              ))}
              <button className="flex items-center justify-center gap-2 p-4 border border-dashed border-white/10 rounded-3xl text-text-tertiary hover:text-brand hover:border-brand/50 hover:bg-brand/5 transition-all text-xs font-black">
                <Plus size={16} />
                Upload File
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/2 p-6 rounded-[32px] border border-white/5 space-y-6 shadow-xl">
            <div>
              <label className="text-[10px] font-black text-text-tertiary block mb-2 uppercase tracking-widest">Status</label>
              <div className="px-4 py-3 rounded-2xl bg-[#0b1429] border border-white/5 text-xs font-black text-white capitalize flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand shadow-[0_0_10px_rgba(51,102,255,0.6)]" />
                {task.status.replace('_', ' ')}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-text-tertiary block mb-2 uppercase tracking-widest">Priority</label>
              <div className="px-4 py-3 rounded-2xl bg-[#0b1429] border border-white/5 text-xs font-black text-white capitalize">
                {task.priority}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-text-tertiary block mb-2 uppercase tracking-widest">Assignee</label>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#0b1429] border border-white/5">
                <Avatar user={task.assignee} size={32} />
                <span className="text-xs font-black text-white truncate">{task.assignee_name || 'Unassigned'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button variant="primary" className="w-full font-black py-4">Edit Task</Button>
            <Button variant="danger" className="w-full font-black py-4">Delete Task</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
