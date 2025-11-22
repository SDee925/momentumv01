import React from 'react';
import { Flame, Target, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalysisPanel = ({ analysis, opportunities }) => {
    return (
        <div className="grid md:grid-cols-3 gap-6 mb-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-3 bg-red-500/5 border border-red-500/20 rounded-2xl p-6"
            >
                <div className="flex items-center gap-2 mb-3 text-red-400 font-bold uppercase tracking-wider text-sm">
                    <Flame size={16} />
                    <span>Friction Analysis</span>
                </div>
                <p className="text-zinc-200 text-lg leading-relaxed">
                    {analysis}
                </p>
            </motion.div>

            <OpportunityCard
                icon={<Zap className="text-yellow-500" />}
                title="Internal Leverage"
                description={opportunities.internal}
                delay={0.2}
            />
            <OpportunityCard
                icon={<Target className="text-blue-500" />}
                title="External Leverage"
                description={opportunities.external}
                delay={0.3}
            />
            <OpportunityCard
                icon={<Eye className="text-purple-500" />}
                title="Hidden Angle"
                description={opportunities.hidden}
                delay={0.4}
            />
        </div>
    );
};

const OpportunityCard = ({ icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5"
    >
        <div className="flex items-center gap-2 mb-3 font-bold text-zinc-400 text-sm uppercase tracking-wider">
            {icon}
            <span>{title}</span>
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed">
            {description}
        </p>
    </motion.div>
);

export default AnalysisPanel;
