import React, { useState } from 'react';
import { PenTool, Cloud } from 'lucide-react';

const JournalSection = ({ entry, onChange, onSave, lastSynced }) => {
    const [localStatus, setLocalStatus] = useState('idle');

    const handleSave = async () => {
        if (typeof onSave !== 'function') return;
        setLocalStatus('saving');
        try {
            await onSave(entry);
            setLocalStatus('saved');
            setTimeout(() => setLocalStatus('idle'), 2000);
        } catch (err) {
            setLocalStatus('error');
            setTimeout(() => setLocalStatus('idle'), 3000);
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4 text-zinc-400">
                <PenTool size={18} />
                <h3 className="font-medium">Momentum Journal</h3>
                <div className="ml-auto flex items-center gap-2 text-sm text-zinc-400">
                    <button onClick={handleSave} className="px-3 py-1 bg-zinc-800 rounded text-zinc-200">{localStatus === 'saving' ? 'Saving...' : 'Save'}</button>
                    <div className="flex items-center gap-2">
                        <Cloud size={14} />
                        <span className="text-xs text-zinc-500">{lastSynced ? `Saved ${new Date(lastSynced).toLocaleString()}` : 'Not saved'}</span>
                    </div>
                </div>
            </div>

            <textarea
                value={entry}
                onChange={(e) => onChange(e.target.value)}
                placeholder="What is the friction telling you? What is the first step? Write it down to get it out of your head..."
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all"
            />

            <p className="text-xs text-zinc-600 mt-2 text-right">
                Auto-saved to local storage
            </p>
        </div>
    );
};

export default JournalSection;
