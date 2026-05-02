import React, { useState } from 'react';
import toast from 'react-hot-toast';

const OKRs = () => {
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');

  const addObjective = () => {
    if (!newObjective) return;
    setObjectives([...objectives, { id: Date.now(), text: newObjective, krs: [] }]);
    setNewObjective('');
    toast.success('Objective added');
  };
  const addKeyResult = (objId, krText) => {
    setObjectives(objectives.map(obj => obj.id === objId ? { ...obj, krs: [...obj.krs, { id: Date.now(), text: krText, progress: 0 }] } : obj));
  };
  const updateProgress = (objId, krId, prog) => {
    setObjectives(objectives.map(obj => obj.id === objId ? { ...obj, krs: obj.krs.map(kr => kr.id === krId ? { ...kr, progress: prog } : kr) } : obj));
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">Objectives & Key Results</h2>
      <div className="mb-4 flex gap-2"><input type="text" placeholder="New Objective" className="border p-2 flex-1" value={newObjective} onChange={e => setNewObjective(e.target.value)} /><button onClick={addObjective} className="bg-purple-600 text-white px-4 py-2 rounded">Add</button></div>
      {objectives.map(obj => <div key={obj.id} className="border rounded p-3 mb-3"><h3 className="font-bold">{obj.text}</h3><div className="ml-4"><input type="text" placeholder="Key Result" className="border p-1 w-full mb-2" onKeyPress={(e) => { if (e.key === 'Enter') addKeyResult(obj.id, e.target.value); e.target.value = ''; }} /></div>
        {obj.krs.map(kr => <div key={kr.id} className="flex items-center gap-2 mt-2"><span className="flex-1">{kr.text}</span><input type="range" min="0" max="100" value={kr.progress} onChange={e => updateProgress(obj.id, kr.id, parseInt(e.target.value))} /><span>{kr.progress}%</span></div>)}</div>)}
    </div>
  );
};
export default OKRs;
