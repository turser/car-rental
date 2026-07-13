import Sidebar from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function Layout() {
    const location = useLocation();

    return (
        <div className="flex min-h-screen bg-stone-50 print:block">
            <div className="print:hidden">
                <Sidebar />
            </div>
            <div className="flex-1 ml-60 flex flex-col min-h-screen print:ml-0 print:min-h-0">
                <main className="flex-1 p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -16, scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.8 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
