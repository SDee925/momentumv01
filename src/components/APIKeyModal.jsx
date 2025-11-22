import React, { useState } from 'react';
import { Key, X } from 'lucide-react';

const APIKeyModal = ({ isOpen, onClose, onSave }) => {
    const [inputKey, setInputKey] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Key className="text-indigo-500" size={20} />
                        API Configuration
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-zinc-400 text-sm mb-4">
                    To power the Momentum Engine, you need an OpenRouter API Key.
                    Your key is stored locally in your browser and never sent to our servers.
                </p>

                <input
                    type="password"
                    placeholder="Paste your OpenRouter API Key here"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 mb-6"
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-zinc-400 hover:text-white font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSave(inputKey);
                            onClose();
                        }}
                        disabled={!inputKey}
                        className="px-4 py-2 bg-white text-black rounded-lg font-bold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Key
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">
                        Get an OpenRouter API Key
                    </a>
                </div>
            </div>
        </div>
    );
};

export default APIKeyModal;
