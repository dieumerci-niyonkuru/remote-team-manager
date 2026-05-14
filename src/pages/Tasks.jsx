import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { CheckSquare, Plus, Filter, Search, MoreHorizontal, Clock, AlertTriangle, User, MessageSquare, Paperclip, Send, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import Avatar from '../components/common/Avatar';

export default function Tasks() {
  const { activeWorkspace } = useStore();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [taskForm, setTaskForm] = useState({ 
    title: '', 
    description: '', 
    project: '', 
    priority: 'medium', 
    status: 'todo' 
  });

  const wsRef = useRef(null);
  const columns = [
    { id: 'todo', title: 'To Do', color: 'gray' },
    { id: 'in_progress', title: 'In Progress', color: 'blue' },
    { id: 'review', title: 'Review', color: 'purple' },
    { id: 'done', title: 'Done', color: 'green' },
  ];

  useEffect(() => {
    if (activeWorkspace) {
      fetchInitialData();
      connectWS();
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [activeWorkspace]);

  const connectWS = () => {
    if (wsRef.current) wsRef.current.close();
    const token = localStorage.getItem('rtm_access');
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const wsHost = host.includes('localhost:5173') ? 'localhost:8000' : host;
    const wsUrl = `${protocol}://${wsHost}/ws/tasks/${activeWorkspace.id}/?token=${token}`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.action === 'created') {
        setTasks(prev => [...prev, data.task]);
      } else if (data.action === 'updated') {
        setTasks(prev => prev.map(t => t.id === data.task.id ? data.task : t));
      } else if (data.action === 'deleted') {
        setTasks(prev => prev.filter(t => t.id !== data.task_id));
      }
    };

    wsRef.current.onclose = () => {
      setTimeout(connectWS, 3000);
    };
  };

  const fetchInitialData = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.get(`/projects/?workspace=${activeWorkspace.id}`),
        api.get(`/tasks/?workspace=${activeWorkspace.id}`)
      ]);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
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
      const res = await api.post('/tasks/', taskForm);
      // tasks will be updated via WebSocket if backend broadcasts, 
      // but let's add locally just in case WS is slow
      setTasks(prev => [...prev, res.data]);
      setIsCreateModalOpen(false);
      setTaskForm({ ...taskForm, title: '', description: '' });
      toast.success('Task created! 📝');
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const onDragStart = (e, taskId) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
  };

  const onDrop = async (e, status) => {
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
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const filteredTasks = filterProject === 'all' 
    ? tasks 
    : tasks.filter(t => t.project === parseInt(filterProject));

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-[#0a0f1d]">
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
      <div className="flex-1 overflow-x-auto p-6 custom-scrollbar bg-[#0a0f1d]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex gap-6 h-full min-w-max">
            {columns.map(col => (
              <div 
                key={col.id} 
                className="w-80 flex flex-col"
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
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Project</label>
              <select 
                value={taskForm.project}
                onChange={e => setTaskForm({...taskForm, project: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Priority</label>
              <select 
                value={taskForm.priority}
                onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
            <textarea 
              value={taskForm.description}
              onChange={e => setTaskForm({...taskForm, description: e.target.value})}
              placeholder="Add details about this task..."
              rows={3}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" 
            />
          </div>
          <button 
            disabled={creating}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function TaskCard({ task, onDragStart, onClick }) {
  const getPriorityColor = (p) => {
    switch (p) {
      case 'urgent': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
      className="bg-gray-800/40 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-xl group cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <div className="flex -space-x-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <Avatar user={task.assignee} size={24} className="ring-2 ring-gray-900" />
        </div>
      </div>
      
      <h4 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-blue-400 transition-colors">{task.title}</h4>
      <p className="text-xs text-gray-500 mb-4 line-clamp-2">{task.description || 'No description provided.'}</p>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <MessageSquare size={12} />
            {task.comments?.length || 0}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <Paperclip size={12} />
            {task.files?.length || 0}
          </div>
        </div>
        {task.due_date && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
            <Clock size={12} />
            {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskModal({ task, onClose }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="bg-[#0d1425] border border-gray-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        <div className="p-8">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                    <CheckSquare size={20} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Task Details</p>
                    <h2 className="text-2xl font-black text-white leading-tight">{task.title}</h2>
                 </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl text-gray-500 hover:text-white transition-colors">
                 <X size={24} />
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                 <div>
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Description</h4>
                    <p className="text-gray-300 leading-relaxed bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                       {task.description || 'No detailed description provided for this task.'}
                    </p>
                 </div>
                 
                 <div>
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Activity & Comments</h4>
                    <div className="space-y-4 mb-6">
                       {task.comments?.map(comment => (
                          <div key={comment.id} className="flex gap-3">
                             <Avatar user={comment.user_obj || { username: comment.user }} size={32} />
                             <div className="bg-gray-800/50 p-3 rounded-2xl rounded-tl-none border border-gray-800 flex-1">
                                <p className="text-sm text-gray-300">{comment.content}</p>
                                <p className="text-[10px] text-gray-500 mt-1 font-bold">{new Date(comment.created_at).toLocaleString()}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="Add a comment..."
                         className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                       />
                       <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl">
                          <Send size={18} />
                       </button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-800">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Task Activity History</h4>
                    <div className="space-y-3">
                       {task.activities?.map(act => (
                          <div key={act.id} className="flex items-center gap-3 text-[11px]">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                             <p className="text-gray-400">
                                <span className="text-white font-bold">{act.user_name}</span> {act.verb}
                             </p>
                             <span className="text-gray-600 ml-auto font-medium">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                       ))}
                       {(!task.activities || task.activities.length === 0) && (
                          <p className="text-[10px] text-gray-600 italic">No activity recorded yet.</p>
                       )}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-800">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Attachments</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       {task.files?.map(file => (
                          <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-gray-700 transition-all cursor-pointer group">
                             <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-blue-500 transition-colors">
                                <Paperclip size={14} />
                             </div>
                             <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-300 truncate">{file.filename}</p>
                                <p className="text-[9px] text-gray-600 font-bold uppercase">{file.uploaded_by_name}</p>
                             </div>
                          </div>
                       ))}
                       <button className="flex items-center justify-center gap-2 p-3 border border-dashed border-gray-800 rounded-2xl text-gray-600 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-xs font-bold">
                          <Plus size={14} />
                          Upload File
                       </button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-800">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Subtasks</h4>
                    <div className="space-y-2">
                       {task.subtasks?.map(sub => (
                          <div key={sub.id} className="flex items-center gap-3 p-2 bg-gray-900/30 border border-gray-800 rounded-xl hover:bg-gray-800/50 transition-colors">
                             <input type="checkbox" checked={sub.is_completed} className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500/50" />
                             <span className={`text-sm ${sub.is_completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{sub.title}</span>
                          </div>
                       ))}
                       <button className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1 mt-2">
                          + Add Subtask
                       </button>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-gray-800/20 p-4 rounded-2xl border border-gray-800">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Status & Assignee</h4>
                    <div className="space-y-4">
                       <div>
                          <label className="text-[10px] font-bold text-gray-400 block mb-1">Status</label>
                          <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm font-bold text-white capitalize flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                             {task.status.replace('_', ' ')}
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-gray-400 block mb-1">Priority</label>
                          <div className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-sm font-bold text-white capitalize">
                             {task.priority}
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-gray-400 block mb-1">Assignee</label>
                           <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-900 border border-gray-800">
                              <Avatar user={task.assignee} size={24} className="rounded-lg" />
                              <span className="text-xs font-bold text-white">{task.assignee_name || 'Unassigned'}</span>
                           </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-2">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all shadow-lg shadow-blue-600/20">
                       Edit Task
                    </button>
                    <button className="w-full bg-gray-800 hover:bg-red-600/20 hover:text-red-500 text-gray-400 font-bold py-3 rounded-2xl transition-all border border-gray-700 hover:border-red-500/50">
                       Delete Task
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
