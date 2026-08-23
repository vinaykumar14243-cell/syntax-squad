/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isMainPageOpen, setIsMainPageOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050811] text-[#f3f7ff] font-sans selection:bg-[#19d58b] selection:text-[#050811]">
      <AnimatePresence mode="wait">
        {!isMainPageOpen ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="w-full h-full"
          >
            <LandingPage onEnter={() => setIsMainPageOpen(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full min-h-screen"
          >
            <Dashboard onExit={() => setIsMainPageOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
