import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

const HistoryView = ({ history }) => {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-12 text-zinc-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>No history yet. Complete a session to see it here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Momentum History</h2>

            {history.map((session, index) => {
                // Use index as fallback key if id is missing (though it shouldn't be)
                const key = session.createdAt || index;
                const isExpanded = expandedId === key;
                const date = new Date(session.createdAt).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const completedCount = session.actions ? session.actions.filter(a => a.isCompleted).length : 0;
                const totalCount = session.actions ? session.actions.length : 0;

                return (
                    <div key={key} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <button
                            onClick={() => toggleExpand(key)}
                            className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                        >
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-white capitalize">{session.focusArea}</h3>
                                <p className="text-sm text-zinc-500">{date}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-zinc-400">
                                    <CheckCircle2 size={16} className={completedCount === totalCount ? "text-green-500" : "text-zinc-600"} />
                                    <span>{completedCount}/{totalCount} Done</span>
                                </div>
                                {isExpanded ? <ChevronUp size={20} className="text-zinc-500" /> : <ChevronDown size={20} className="text-zinc-500" />}
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                                {session.journalEntry && (
                                    <div className="mb-6 bg-zinc-950 p-4 rounded-lg border border-zinc-800/50">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Journal Entry</h4>
                                        <p className="text-zinc-300 whitespace-pre-wrap">{session.journalEntry}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Actions</h4>
                                    {session.actions.map(action => (
                                        <div key={action.id} className="flex items-start gap-3 text-sm">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${session.completedActions.includes(action.id) ? 'bg-green-500' : 'bg-zinc-700'}`} />
                                            <div>
                                                <span className={`font-medium ${session.completedActions.includes(action.id) ? 'text-zinc-400 line-through' : 'text-zinc-300'}`}>
                                                    {action.title}
                                                </span>
                                                <p className="text-zinc-500 text-xs">{action.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default HistoryView;
