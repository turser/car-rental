import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <ThemeToggle />
            <Sidebar />
            <main className="flex-1 ml-60 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
