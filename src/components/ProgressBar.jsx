import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ total, completed }) => {
    const percentage = total === 0 ? 0 : (completed / total) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs uppercase tracking-wider font-bold text-zinc-500 mb-2">
                <span>Momentum Velocity</span>
                <span>{Math.round(percentage)}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
